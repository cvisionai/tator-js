.PHONY: js-bindings
js-bindings:
	rm -f tator-openapi-schema.yaml
	rm -rf pkg
	curl -s -L https://www.tatorapp.com/schema > tator-openapi-schema.yaml
	./codegen.py tator-openapi-schema.yaml
	docker run -it --rm \
		-v $(shell pwd):/pwd \
		openapitools/openapi-generator-cli:v5.0.0-beta3 \
		generate -c /pwd/config.json \
		-i /pwd/tator-openapi-schema.yaml \
		-g javascript -o /pwd/pkg -t /pwd/templates
	cp -r examples pkg/examples
	cp -r utils pkg/src/utils
	cd pkg && npm install && npm run build