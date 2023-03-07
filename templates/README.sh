# This will extract all templates into a directory called out
docker run -v `pwd`:/pwd  openapitools/openapi-generator-cli:v6.1.0 author template -g javascript -o /pwd/out
docker run -v `pwd`:/pwd  --entrypoint chmod openapitools/openapi-generator-cli:v6.1.0 777 /pwd/out