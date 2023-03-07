tator-openapi-schema.yaml:
	curl -s -L https://cloud.tator.io/schema > tator-openapi-schema.yaml

pkg/src/index.js: tator-openapi-schema.yaml templates/index.mustache
	rm -rf pkg
	mkdir pkg
	mkdir pkg/src
	./codegen.py tator-openapi-schema.yaml
	docker run --rm \
		-v $(shell pwd):/pwd \
		openapitools/openapi-generator-cli:v6.1.0 \
		generate -c /pwd/config.json \
		-i /pwd/tator-openapi-schema.yaml \
		-g javascript -o /pwd/pkg -t /pwd/templates
	docker run --rm \
		-v $(shell pwd):/pwd \
		openapitools/openapi-generator-cli:v6.1.0 \
		chmod -R 777 /pwd/pkg
	cp -r examples pkg/examples
	cp -r utils pkg/src/utils
	cp -r annotator pkg/src/annotator
	cp README.md pkg/.
	rm -rf pkg/test && cp -r test pkg/test
	cd pkg && npm uninstall mocha
	cd pkg && npm install
	cd pkg && npm install -D @playwright/test isomorphic-fetch fetch-retry \
		spark-md5 uuid
	# Add dependencies for 
	cd pkg && npm install querystring \
	                      webpack \
												webpack-cli@^5.0.1 \
												libtess@1.2.0 \
                        hls.js@1.2.3 \
												mp4box@0.4.9 \
												underwater-image-color-correction@1.0.3\
												--save-dev

pkg/dist/tator.js: pkg/src/index.js $(shell find annotator -name "*.js") $(shell find utils -name "*.js")
	cp webpack.dev.js pkg/.
	cd pkg && npx webpack --config webpack.dev.js

pkg/dist/tator.min.js: pkg/src/index.js $(shell find annotator -name "*.js") $(shell find utils -name "*.js")
	cp webpack.prod.js pkg/.
	cd pkg && npx webpack --config webpack.prod.js

.PHONY: all
all: pkg/dist/tator.js pkg/dist/tator.min.js

.PHONY: clean
clean:
	rm -rf pkg
	rm -f tator-openapi-schema.yaml
