SHELL:=/bin/bash
BROWSERS=chromium firefox
DIST_DIR=dist
BUILD_DIR=build
CRX3_KEY=burlesco-pkcs8-key.pem
STATIC=icon.png options.html LICENSE.txt
TSC=node node_modules/typescript/bin/tsc
ESLINT=node node_modules/eslint/bin/eslint.js
.PHONY: all clean lint pre-build build
all: clean lint pre-build
clean:
	rm -rf "$(DIST_DIR)" "$(BUILD_DIR)"
lint:
	set -e ; \
	node scripts/check-json.js ; \
	$(TSC) --noEmit ; \
	$(ESLINT) --ext .ts src;
pre-build: clean
	set -e ; \
	for i in $(BROWSERS) ; do \
		SRC_DIR="$(DIST_DIR)/$$i/src" ; \
		mkdir -p "$$SRC_DIR" ; \
		$(TSC) --outDir "$$SRC_DIR" ; \
		for f in $(STATIC) ; do cp "src/$$f" "$$SRC_DIR" ; done ; \
		if [ $$i != "firefox" ]; then \
			perl -0pe 's/,\s+"browser_specific_settings": \{(.*?\}){2}//s' \
				src/manifest.json > "$$SRC_DIR/manifest.json" ; \
		else \
			perl -0pe 's/,\s+"update_url": "https:\/\/burlesco.github.io\/burlesco-update\/chromium.xml"//s' \
				src/manifest.json > "$$SRC_DIR/manifest.json" ; \
		fi ; \
	done
build: pre-build
	set -e ; \
	for i in $(BROWSERS) ; do \
		echo $$i; \
		DIR="$(DIST_DIR)/$$i" ; \
		FILE=burlesco-$$i.zip ; \
		if  [ $$i = "chromium" ]; then \
			zip -jr9X "$$DIR/$$FILE" $$DIR/src/* ; \
			cat "$$DIR/$$FILE" | npx crx3 --crxPath="$$DIR/burlesco-chromium.crx" \
				--keyPath="$(CRX3_KEY)" ; \
		else \
			zip -j "$$DIR/$$FILE" $$DIR/src/* ; \
			npx web-ext sign --source-dir="$$DIR/src/" \
				--artifacts-dir="$$DIR/" \
				--api-key="$$mozilla_api_key" \
				--api-secret="$$mozilla_api_secret" \
				-v ; \
			mv "$$(ls $$DIR/burlesco*.xpi)" "$$DIR/burlesco-$$i.xpi" ; \
		fi ; \
	done
