# tator

JavaScript client for [Tator](https://github.com/cvisionai/tator).

## Building

```shell
make js-bindings
```

This will generate code using the schema at https://cloud.tator.io. If you are a tator developer, call `make js-bindings` from the main `tator` project (for which this project is a submodule) and it will use the schema from the local backend image.

## Run examples

```shell
cd pkg
node examples/setup-project.js -h
```

Note that example scripts must be run from the build directory `pkg` as they use relative imports.

## Authors

Tator and tator-js are developed by [CVision AI](https://www.cvisionai.com).
