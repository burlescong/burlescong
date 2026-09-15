// Replaces the Makefile: compile TypeScript, assemble per-browser
// unpacked dirs, then zip / CRX / XPI.
"use strict";

const { execFileSync, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const crx3 = require("crx3");
const yazl = require("yazl");

const ROOT = path.resolve(__dirname, "..");
const DIST_DIR = path.join(ROOT, "dist");
const BUILD_DIR = path.join(ROOT, "build");
const SRC = path.join(ROOT, "src");
const BROWSERS = ["chromium", "firefox"];
const STATIC = ["icon.png", "options.html", "LICENSE.txt"];
const CRX3_KEY = path.join(ROOT, "burlesco-pkcs8-key.pem");
const ENV_FILE = path.join(ROOT, ".env");
const TSC = require.resolve("typescript/bin/tsc");
const WEB_EXT = path.join(
  path.dirname(require.resolve("web-ext")),
  "bin",
  "web-ext.js",
);

// Loads KEY=VALUE pairs from .env into process.env without overriding
// values already set in the shell (so CI secrets still win).
function loadEnv() {
  if (!fs.existsSync(ENV_FILE)) return;
  for (const line of fs.readFileSync(ENV_FILE, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnv();

function copyStaticFiles() {
  const chromiumSrc = path.join(DIST_DIR, "chromium", "src");

  fs.mkdirSync(chromiumSrc, { recursive: true });

  const staticFiles = [
    "manifest.json",
    "options.html",
    "icon.png",
    "LICENSE.txt",
  ];

  for (const file of staticFiles) {
    const source = path.join(SRC, file);
    const destination = path.join(chromiumSrc, file);

    if (fs.existsSync(source)) {
      fs.copyFileSync(source, destination);
      console.log(`[watch] Copiado: ${file}`);
    }
  }
}

function watch() {
  // pasta base sem limpar a cada rebuild (senão o Chrome perde a extensão)
  if (!fs.existsSync(path.join(DIST_DIR, "chromium", "src"))) {
    preBuild(); // ou só assemble chromium
  }

  copyStaticFiles();

  const tsc = spawn(
    process.execPath,
    [TSC, "--watch", "--preserveWatchOutput", "--outDir", BUILD_DIR],
    {
      cwd: ROOT,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  const onOutput = (buf) => {
    const text = buf.toString();
    process.stdout.write(text);
    if (/Found 0 errors/.test(text) || /Watching for file changes/.test(text)) {
      assembleChromium();
    }
  };
  tsc.stdout.on("data", onOutput);
  tsc.stderr.on("data", onOutput);

  // Arquivos que não passam pelo TypeScript
  const watchedFiles = [
    "manifest.json",
    "options.html",
    "icon.png",
    "LICENSE.txt",
  ];

  const watchers = [];

  for (const file of watchedFiles) {
    const source = path.join(SRC, file);

    if (!fs.existsSync(source)) {
      continue;
    }

    let timeout;

    const watcher = fs.watch(source, () => {
      clearTimeout(timeout);

      // debounce para evitar múltiplos eventos no Windows
      timeout = setTimeout(() => {
        console.log(`[watch] Alterado: ${file}`);

        copyStaticFiles();

        // Se o assembleChromium também faz outras transformações,
        // podemos chamar ele aqui.
        assembleChromium();
      }, 100);
    });

    watchers.push(watcher);
  }

  // Encerrar tudo com Ctrl+C
  const cleanup = () => {
    console.log("\nEncerrando watch...");

    tsc.kill();

    for (const watcher of watchers) {
      watcher.close();
    }

    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}

function runTsc(args) {
  execFileSync(process.execPath, [TSC, ...args], {
    cwd: ROOT,
    stdio: "inherit",
  });
}

function clean() {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
  fs.rmSync(BUILD_DIR, { recursive: true, force: true });
}

function copyJs(destDir) {
  for (const name of fs.readdirSync(BUILD_DIR)) {
    if (!name.endsWith(".js")) continue;
    fs.copyFileSync(path.join(BUILD_DIR, name), path.join(destDir, name));
  }
}

function copyStatic(destDir) {
  for (const file of STATIC) {
    const from = path.join(SRC, file);
    if (!fs.existsSync(from)) {
      console.warn(`skipping missing ${file}`);
      continue;
    }
    fs.copyFileSync(from, path.join(destDir, file));
  }
}

function writeManifest(browser, destDir) {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(SRC, "manifest.json"), "utf8"),
  );
  if (browser === "firefox") {
    manifest.background.scripts = ["background.js"];
    delete manifest.update_url;
  } else {
    delete manifest.browser_specific_settings;
  }
  fs.writeFileSync(
    path.join(destDir, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}

function preBuild() {
  clean();
  runTsc(["--outDir", BUILD_DIR]);
  for (const browser of BROWSERS) {
    const srcDir = path.join(DIST_DIR, browser, "src");
    fs.mkdirSync(srcDir, { recursive: true });
    copyJs(srcDir);
    copyStatic(srcDir);
    writeManifest(browser, srcDir);
  }
}

function zipDirectory(srcDir, zipPath) {
  return new Promise((resolve, reject) => {
    const zip = new yazl.ZipFile();
    const out = fs.createWriteStream(zipPath);
    zip.outputStream.pipe(out);
    out.on("close", resolve);
    out.on("error", reject);
    zip.outputStream.on("error", reject);
    for (const name of fs.readdirSync(srcDir)) {
      const full = path.join(srcDir, name);
      if (fs.statSync(full).isFile()) {
        zip.addFile(full, name);
      }
    }
    zip.end();
  });
}

function signFirefox(srcDir, artifactsDir) {
  const apiKey = process.env.mozilla_api_key;
  const apiSecret = process.env.mozilla_api_secret;
  if (!apiKey || !apiSecret) {
    throw new Error(
      "missing mozilla_api_key / mozilla_api_secret (set them in .env)",
    );
  }

  // web-ext names the download like "<uuid>-<version>.xpi"; keep that name.
  for (const name of fs.readdirSync(artifactsDir)) {
    if (name.endsWith(".xpi")) {
      fs.unlinkSync(path.join(artifactsDir, name));
    }
  }

  execFileSync(
    process.execPath,
    [
      WEB_EXT,
      "sign",
      "--channel=unlisted",
      `--source-dir=${srcDir}`,
      `--artifacts-dir=${artifactsDir}`,
      `--api-key=${apiKey}`,
      `--api-secret=${apiSecret}`,
      "-v",
    ],
    { cwd: ROOT, stdio: "inherit" },
  );

  const xpIs = fs.readdirSync(artifactsDir).filter((f) => f.endsWith(".xpi"));
  if (xpIs.length !== 1) {
    throw new Error(
      `expected one xpi in ${artifactsDir}, found: ${xpIs.join(", ")}`,
    );
  }
  console.log(`firefox xpi: ${path.join(artifactsDir, xpIs[0])}`);
}

async function packageBrowser(browser) {
  console.log(browser);
  const dir = path.join(DIST_DIR, browser);
  const srcDir = path.join(dir, "src");
  const zipPath = path.join(dir, `burlesco-${browser}.zip`);
  await zipDirectory(srcDir, zipPath);
  if (browser === "chromium") {
    await crx3([srcDir], {
      keyPath: CRX3_KEY,
      crxPath: path.join(dir, "burlesco-chromium.crx"),
    });
    return;
  }
  signFirefox(srcDir, dir);
}

async function build() {
  preBuild();
  for (const browser of BROWSERS) {
    await packageBrowser(browser);
  }
}

async function main() {
  const cmd = process.argv[2] || "build";
  if (cmd === "clean") {
    clean();
    return;
  }
  if (cmd === "pre-build") {
    preBuild();
    return;
  }
  if (cmd === "build") {
    await build();
    return;
  }
  if (cmd === "watch") {
    watch();
    return;
  }
  console.error(`unknown command: ${cmd}`);
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

function assembleChromium() {
  const srcDir = path.join(DIST_DIR, "chromium", "src");
  fs.mkdirSync(srcDir, { recursive: true });
  copyJs(srcDir);
  copyStatic(srcDir);
  writeManifest("chromium", srcDir);
  console.log("updated dist/chromium/src");
}
