BUILD_DIR="$TRAVIS_BUILD_DIR/gh-pages/"
mkdir -p $BUILD_DIR

REPO=linneudm/burlesco
FIREFOX_ID=linneudm@burles.co

cat > $BUILD_DIR/chromium.xml <<EOL
<?xml version='1.0' encoding='UTF-8'?>
<gupdate xmlns='http://www.google.com/update2/response' protocol='2.0'>
  <app appid='magjmaimhngoidhmklnpihkdjkggbpnp'>
    <updatecheck codebase='https://github.com/$REPO/releases/download/$TRAVIS_TAG/burlesco-chromium.crx' version='${TRAVIS_TAG:1}' />
  </app>
</gupdate>
EOL

FIREFOX_XPI="$(basename "$(ls "$TRAVIS_BUILD_DIR"/dist/firefox/*.xpi)")"

cat > $BUILD_DIR/firefox.json <<EOL
{
  "addons": {
    "$FIREFOX_ID": {
      "updates": [
        {
          "version": "${TRAVIS_TAG:1}",
          "update_link": "https://github.com/$REPO/releases/download/$TRAVIS_TAG/$FIREFOX_XPI"
        }
      ]
    }
  }
}
EOL
