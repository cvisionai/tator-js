.PHONY: js-bindings
js-bindings:
	rm -f tator-openapi-schema.yaml
	rm -rf pkg
	mkdir pkg
	mkdir pkg/src
	curl -s -L https://cloud.tator.io/schema > tator-openapi-schema.yaml
	./codegen.py tator-openapi-schema.yaml
	docker run -it --rm \
		-v $(shell pwd):/pwd \
		openapitools/openapi-generator-cli:v6.1.0 \
		generate -c /pwd/config.json \
		-i /pwd/tator-openapi-schema.yaml \
		-g javascript -o /pwd/pkg -t /pwd/templates
	docker run -it --rm \
		-v $(shell pwd):/pwd \
		openapitools/openapi-generator-cli:v6.1.0 \
		chmod -R 777 /pwd/pkg
	cp -r examples pkg/examples
	cp -r utils pkg/src/utils
	cp webpack* pkg/.
	cp README.md pkg/.
	rm -rf pkg/test && cp -r test pkg/test
	cd pkg && npm uninstall mocha
	cd pkg && npm install
	cd pkg && npm install -D @playwright/test
	cd pkg && npm install querystring webpack webpack-cli --save-dev
	cd pkg && npx webpack --config webpack.prod.js
	mv pkg/dist/tator.min.js pkg/.
	cd pkg && npx webpack --config webpack.dev.js
	mv pkg/tator.min.js pkg/dist/.

.PHONY: test
test:
	cd pkg && npx playwright test test/* --workers=1
