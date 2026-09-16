#!/usr/bin/env bash
set -euo pipefail

ROOT="${GITHUB_WORKSPACE:-.}"
TAG="${RELEASE_TAG:-${GITHUB_REF_NAME:-}}"

if [ -z "$TAG" ]; then
  echo "missing release tag (set RELEASE_TAG or push a v* tag)"
  exit 1
fi

VERSION="${TAG#v}"
BUILD_DIR="$ROOT/gh-pages/"
mkdir -p "$BUILD_DIR"

REPO=burlescong/burlescong
FIREFOX_ID=linneudm@burles.co

cat > "$BUILD_DIR/chromium.xml" <<EOL
<?xml version='1.0' encoding='UTF-8'?>
<gupdate xmlns='http://www.google.com/update2/response' protocol='2.0'>
  <app appid='magjmaimhngoidhmklnpihkdjkggbpnp'>
    <updatecheck codebase='https://github.com/$REPO/releases/download/$TAG/burlesco-chromium.crx' version='$VERSION' />
  </app>
</gupdate>
EOL

FIREFOX_XPI="$(basename "$(ls "$ROOT"/dist/firefox/*.xpi)")"

cat > "$BUILD_DIR/firefox.json" <<EOL
{
  "addons": {
    "$FIREFOX_ID": {
      "updates": [
        {
          "version": "$VERSION",
          "update_link": "https://github.com/$REPO/releases/download/$TAG/$FIREFOX_XPI"
        }
      ]
    }
  }
}
EOL
