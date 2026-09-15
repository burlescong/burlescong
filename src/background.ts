interface CookieBlocking {
  urlFilter: string;
  blockAll: boolean;
}

interface HeaderInjection {
  name: string;
  value: string;
  urlFilter: string;
}

interface SiteRules {
  scriptBlocking?: string[];
  xhrBlocking?: string[];
  cookieBlocking?: CookieBlocking;
  headerInjection?: HeaderInjection;
}

type BackgroundMessage = ExecuteScriptMessage | 'update';
type Injection = () => void;

type ActionType = chrome.declarativeNetRequest.RuleActionType;
type HeaderOperation = chrome.declarativeNetRequest.HeaderOperation;
type ResourceType = chrome.declarativeNetRequest.ResourceType;

// The enums these values belong to are not exposed as runtime objects by every
// browser, so the literals are narrowed here instead of being read from them.
const BLOCK = 'block' as ActionType;
const ALLOW = 'allow' as ActionType;
const MODIFY_HEADERS = 'modifyHeaders' as ActionType;
const REMOVE = 'remove' as HeaderOperation;
const SET = 'set' as HeaderOperation;
const MAIN_FRAME = 'main_frame' as ResourceType;
const SCRIPT = 'script' as ResourceType;
const XHR = 'xmlhttprequest' as ResourceType;

const WHITELIST: Record<string, SiteRules> = {
  folhadespaulo: {
    xhrBlocking: [
      'http://paywall.folha.uol.com.br/status.php',
      'https://paywall.folha.uol.com.br/status.php',
    ],
  },
};

const BLOCKLIST: Record<string, SiteRules> = {
  brpolitico: {
    xhrBlocking: ['*://*.estadao.com.br/paywall/*'],
  },
  correio24horas: {
    scriptBlocking: [
      '*://correio-static.cworks.cloud/vendor/bower_components/paywall.js/paywall.js*',
    ],
  },
  correiopopular: {
    scriptBlocking: ['*://correio.rac.com.br/includes/js/novo_cp/fivewall.js*'],
  },
  diarinho: {
    xhrBlocking: ['*://*.diarinho.com.br/wp-admin/admin-ajax.php'],
  },
  diariodecanoas: {
    xhrBlocking: ['*://*.fivewall.com.br/*'],
  },
  diariopopular: {
    cookieBlocking: {
      urlFilter: '*://www.diariopopular.com.br/*',
      blockAll: true,
    },
  },
  elpais: {
    scriptBlocking: [
      '*://prisa-el-pais-brasil-prod.cdn.arcpublishing.com/arc/subs/p.js',
      '*://prisa-el-pais-prod.cdn.arcpublishing.com/arc/subs/p.js',
      '*://brasil.elpais.com/pf/resources/dist/js/article.js*',
    ],
  },
  exame: {
    scriptBlocking: [
      '*://exame.com/wp-content/themes/exame-new/js/pywll.js',
      '*://exame.com/wp-content/themes/exame-new/js/extd-acc.js?v=*',
    ],
  },
  folhadespaulo: {
    scriptBlocking: [
      '*://paywall.folha.uol.com.br/*',
      '*://static.folha.uol.com.br/paywall/*',
    ],
    xhrBlocking: [
      '*://paywall.folha.uol.com.br/*',
      '*://static.folha.uol.com.br/paywall/*',
    ],
  },
  folhadelondrina: {
    scriptBlocking: ['*://www.folhadelondrina.com.br/login.php*'],
    xhrBlocking: ['*://www.folhadelondrina.com.br/login.php*'],
  },
  gazetadopovo: {
    scriptBlocking: ['*://www.netdeal.com.br/*'],
  },
  gazetaonline: {
    cookieBlocking: {
      urlFilter: '*://www.gazetaonline.com.br/*',
      blockAll: true,
    },
  },
  gauchazh: {
    scriptBlocking: ['*://cdn.piano.io/api/tinypass*.min.js'],
  },
  jornalnh: {
    scriptBlocking: ['*://*.fivewall.com.br/*'],
  },
  jornalvs: {
    scriptBlocking: ['*://*.fivewall.com.br/*'],
  },
  jota: {
    headerInjection: {
      name: 'User-Agent',
      value:
        'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      urlFilter: '*://www.jota.info/*',
    },
  },
  nexo: {
    xhrBlocking: ['https://acesso.nexojornal.com.br/paywall/*'],
  },
  nsctotal: {
    xhrBlocking: ['https://paywall.nsctotal.com.br/behaviors'],
    scriptBlocking: ['*://*.tinypass.com/*'],
  },
  oestadodespaulo: {
    xhrBlocking: ['*://*.estadao.com.br/paywall/*'],
    scriptBlocking: [
      '*://*.estadao.com.br/paywall/*',
      '*://*.zephr.com/zephr-browser/*/zephr-browser.umd.js',
    ],
  },
  pioneiro: {
    scriptBlocking: ['*://www.rbsonline.com.br/cdn/scripts/SLoader.js'],
  },
  quatrorodas: {
    scriptBlocking: [
      'https://*.abril.com.br/wp-content/plugins/abril-plugins/abril-paywall/js/paywall.js*',
    ],
  },
  revistaoeste: {
    scriptBlocking: [
      '*://revistaoeste.com/wp-content/uploads/custom-css-js/248859.js?v=*',
      '*://revistaoeste.com/wp-content/themes/revistaoeste/assets/js/main.js?ver=*',
    ],
  },
  seudinheiro: {
    scriptBlocking: [
      'https://*.seudinheiro.com/app/themes/seudinheiro/src/js/lib/premium-home.js*',
      'https://*.seudinheiro.com/app/themes/seudinheiro/js/premium-production.js*',
    ],
  },
  superinteressante: {
    scriptBlocking: [
      'https://*.abril.com.br/wp-content/plugins/abril-plugins/abril-paywall/js/paywall.js*',
      'https://*.abril.com.br/wp-content/plugins/abril-plugins/abril-paywall/js/abril-firebase-auth/*paywall.js',
    ],
  },
  uol: {
    scriptBlocking: ['*://tm.jsuol.com.br/modules/content-gate.js'],
    headerInjection: {
      name: 'User-Agent',
      value:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25',
      urlFilter: '*://noticias.uol.com.br/midiaglobal/nytimes/*',
    },
  },
  valoreconomico: {
    scriptBlocking: ['*://static.infoglobo.com.br/paywall/js/*'],
  },
  veja: {
    scriptBlocking: [
      'https://*.abril.com.br/wp-content/plugins/abril-plugins/abril-paywall/js/paywall.js*',
    ],
  },
  observador: {
    scriptBlocking: ['*://*.tinypass.com/*'],
  },
  jornaldocomercio: {
    xhrBlocking: [
      '*://*.jornaldocomercio.com/_conteudo/_files/json/paywall.json*',
    ],
  },
};

function generateRules(
  enabledSites?: SiteStatus,
): chrome.declarativeNetRequest.Rule[] {
  const rules: chrome.declarativeNetRequest.Rule[] = [];
  let nextRuleId = 1;

  for (const item in BLOCKLIST) {
    if (enabledSites && enabledSites[item] === false) continue;

    const siteConfig = BLOCKLIST[item];

    if (siteConfig.scriptBlocking) {
      for (const url of siteConfig.scriptBlocking) {
        rules.push({
          id: nextRuleId++,
          priority: 1,
          action: { type: BLOCK },
          condition: {
            urlFilter: url,
            resourceTypes: [SCRIPT],
          },
        });
      }
    }

    if (siteConfig.xhrBlocking) {
      for (const url of siteConfig.xhrBlocking) {
        rules.push({
          id: nextRuleId++,
          priority: 1,
          action: { type: BLOCK },
          condition: {
            urlFilter: url,
            resourceTypes: [XHR],
          },
        });
      }
    }

    if (siteConfig.cookieBlocking) {
      const cookie = siteConfig.cookieBlocking;
      rules.push({
        id: nextRuleId++,
        priority: 1,
        action: {
          type: MODIFY_HEADERS,
          requestHeaders: [{ header: 'Cookie', operation: REMOVE }],
          responseHeaders: [{ header: 'Set-Cookie', operation: REMOVE }],
        },
        condition: {
          urlFilter: cookie.urlFilter,
          resourceTypes: [XHR, SCRIPT, MAIN_FRAME],
        },
      });
    }

    if (siteConfig.headerInjection) {
      const header = siteConfig.headerInjection;
      rules.push({
        id: nextRuleId++,
        priority: 1,
        action: {
          type: MODIFY_HEADERS,
          requestHeaders: [
            { header: header.name, operation: SET, value: header.value },
          ],
        },
        condition: {
          urlFilter: header.urlFilter,
          resourceTypes: [XHR, MAIN_FRAME],
        },
      });
    }
  }

  for (const item in WHITELIST) {
    if (enabledSites && enabledSites[item] === false) continue;

    const siteConfig = WHITELIST[item];
    if (siteConfig.xhrBlocking) {
      for (const url of siteConfig.xhrBlocking) {
        rules.push({
          id: nextRuleId++,
          priority: 2,
          action: { type: ALLOW },
          condition: {
            urlFilter: url,
            resourceTypes: [XHR],
          },
        });
      }
    }
  }

  return rules;
}

function apply(): void {
  chrome.storage.local.get('sites', async function (result) {
    const enabledSites: SiteStatus | undefined = result.sites;
    const newRules = generateRules(enabledSites);

    const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
    const oldRuleIds = oldRules.map((r) => r.id);

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: oldRuleIds,
      addRules: newRules,
    });
  });
}

const INJECTION_START: Record<string, Injection> = {
  crusoe: function () {
    document.cookie = 'crs_subscriber=1';
  },
  diariograndeabc: function () {
    const email = 'colaborador@dgabc.com.br';
    localStorage.emailNoticiaExclusiva = email;
    if (window.jQuery) {
      window
        .jQuery(
          '.NoticiaExclusivaNaoLogado, .NoticiaExclusivaLogadoSemPermissao',
        )
        .hide();
      window
        .jQuery('.linhaSuperBanner, .footer, .NoticiaExclusivaLogado')
        .show();
    } else {
      document
        .querySelectorAll<HTMLElement>(
          '.NoticiaExclusivaNaoLogado, .NoticiaExclusivaLogadoSemPermissao',
        )
        .forEach((el) => (el.style.display = 'none'));
      document
        .querySelectorAll<HTMLElement>(
          '.linhaSuperBanner, .footer, .NoticiaExclusivaLogado',
        )
        .forEach((el) => (el.style.display = 'block'));
    }
  },
  em: function () {
    window.id_acesso_noticia = 0;
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(
      document.createTextNode(
        '.news-blocked { display: none !important } .news-blocked-no-scroll { overflow: auto !important; width: auto !important; position: unset !important; } div[itemprop="articleBody"] { height: auto !important; }',
      ),
    );
    document.head.appendChild(style);
  },
  oglobo: function () {
    window.hasPaywall = false;
  },
  nexo: function () {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(
      document.createTextNode(
        'body { overflow: auto !important; } div[class*="PaywallBumper__wrap-container"], div[class*="Datawall__wrap-container"] { display: none !important; }',
      ),
    );
    document.head.appendChild(style);
  },
};

const ABRIL_CODE: Injection = function () {
  window.setTimeout(function () {
    const b = document.querySelector('body');
    if (b) b.classList.remove('disabledByPaywall');
    const o = document.querySelector('.piano-offer-overlay');
    if (o) o.remove();
    const p = document.querySelector('#piano_offer');
    if (p) p.remove();
  }, 10000);
};

const INJECTION: Record<string, Injection> = {
  correio24horas: function () {
    if (window.jQuery) {
      window.jQuery('[class^=paywall]').remove();
      window.jQuery('[class$=blocked]').removeClass();
      window.jQuery('[id^=paywall]').removeClass('hide is-active').remove();
      window
        .jQuery('.noticias-single__content__text')
        .attr('style', 'height:auto;');
    } else {
      document
        .querySelectorAll('[class^="paywall"]')
        .forEach((el) => el.remove());
      document
        .querySelectorAll('[class$="blocked"]')
        .forEach((el) => (el.className = ''));
      document.querySelectorAll('[id^="paywall"]').forEach((el) => {
        el.classList.remove('hide', 'is-active');
        el.remove();
      });
      document
        .querySelectorAll<HTMLElement>('.noticias-single__content__text')
        .forEach((el) => (el.style.height = 'auto'));
    }
  },
  diariodaregiao: function () {
    const texts = document.getElementsByClassName('noticia-texto');
    const el = texts[0] as HTMLElement | undefined;
    if (el) el.style.display = 'block';
    const row = document.querySelector<HTMLElement>('.conteudo > .row');
    if (row) row.style.display = 'none';
  },
  exame: ABRIL_CODE,
  folhadespaulo: function () {
    window.omtrClickUOL = function () {
      // Neutralizes the tracker the paywall calls before hiding the text.
    };
    function showText() {
      const btn = document.querySelector('#bt-read-more-content');
      if (btn) {
        const next = btn.nextElementSibling as HTMLElement | null;
        if (next) {
          next.style.display = 'block';
          const prev = next.previousElementSibling;
          if (prev) prev.remove();
        }
      }
    }
    setTimeout(showText, 100);
  },
  galileu: function () {
    const cleanGalileu = () => {
      const div = document.querySelector('#detecta-adblock');
      if (div) div.remove();
      document.body.style.overflow = 'initial';
    };
    cleanGalileu();
    setTimeout(cleanGalileu, 4000);
  },
  gauchazh: function () {
    interface ArticleComponent {
      html?: string;
      data: { embed: string };
    }
    type ArticleQuery = Record<
      string,
      { article_body_components?: ArticleComponent[] }
    >;

    (async () => {
      const raw = window.__ISOMORPHIC_DATA__;
      if (!raw) return;
      const state = JSON.parse(decodeURI(raw)).state;
      const query: ArticleQuery = state.apollo.ROOT_QUERY;
      const key = Object.keys(query).filter((k) => k.includes('article'))[0];
      if (!key) return;
      const components = query[key].article_body_components;
      if (!components) return;

      const parts = components.map((item) => {
        const html = item.html || item.data.embed;
        return `<div class="article-paragraph">${html}</div>`;
      });
      const content = parts.reduce((acc, curr) => acc + curr, '');

      for (; ;) {
        const article = document.querySelector('.article-paragraph');
        if (article === null) {
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }
        article.insertAdjacentHTML('afterend', content);
        document
          .querySelectorAll<HTMLElement>('.article-paragraph')
          .forEach((item) => {
            item.style.opacity = '1';
          });
        document.querySelectorAll('a').forEach((item) => {
          item.addEventListener('click', (e) => {
            e.stopImmediatePropagation();
            return false;
          });
        });
        const style = document.createElement('style');
        style.textContent = '.paid-content-template::before { display: none; }';
        document.head.appendChild(style);
        break;
      }
    })();
  },
  nexo: function () {
    const selectors = [
      "div[class*='PaywallBumper__wrap-container']",
      "div[class*='Datawall__wrap-container']",
    ];
    selectors.forEach((selector) => {
      const element = document.querySelector(selector);
      if (element) element.remove();
    });
  },
  seudinheiro: function () {
    const p = document.querySelector('#premium-paywall');
    if (p) p.remove();
    document.body.style.overflow = '';
  },
  superinteressante: ABRIL_CODE,
  valoreconomico: function () {
    const element = document.querySelector('[class*="paywall"]');
    if (element) element.remove();
  },
  veja: ABRIL_CODE,
  jota: function () {
    const p = document.getElementsByClassName('jota-paywall')[0];
    if (p) p.remove();
  },
  jornaldocomercio: function () {
    const unlock = () => {
      const carregando = document.querySelector('.paywall-carregando');

      const path = document.getElementById('ds_matia_path')?.textContent?.trim();
      const completa = document.querySelector('.materia-completa');
      if (
        completa &&
        path &&
        !completa.childElementCount &&
        typeof window.carregar_xml_materia === 'function'
      ) {
        carregando?.remove();
        window.carregar_xml_materia(path);
      }

      document.querySelector('.paywall-container')?.remove();
      document.querySelector('.paywall-limite')?.remove();
      document
        .querySelectorAll(
          '.paywall-v2, .paywall-v3, .paywall-login, .bg-overlay-paywall, .bg-overlay-paywall-dark',
        )
        .forEach((el) => el.remove());
      if (typeof window.paywallCustomEvent === 'function') {
        window.paywallCustomEvent('off');
      }
    };
    unlock();
    setTimeout(unlock, 500);
    setTimeout(unlock, 2000);
  },
  observador: function () {
    const p = document.querySelector('.piano-article-blocker');
    if (p) p.remove();
    const a = document.querySelector<HTMLElement>('.article-body-wrapper');
    if (a) a.style.maxHeight = 'inherit';
    const p2 = document.querySelector('.premium-article');
    if (p2) p2.classList.add('article-shown');
  },
};

chrome.runtime.onMessage.addListener((message: BackgroundMessage, sender) => {
  if (message === 'update') {
    apply();
    return;
  }

  if (message.action !== 'executeScript') return;

  const tabId = sender.tab?.id;
  if (tabId === undefined) return;

  const table = message.type === 'start' ? INJECTION_START : INJECTION;
  const func = table[message.site];
  if (!func) return;

  chrome.scripting
    .executeScript({
      target: { tabId: tabId },
      world: 'MAIN',
      func: func,
    })
    .catch((e) => console.error(e));
});

chrome.runtime.onInstalled.addListener(apply);
chrome.runtime.onStartup.addListener(apply);