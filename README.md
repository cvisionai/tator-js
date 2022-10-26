# tator

JavaScript client for [Tator](https://github.com/cvisionai/tator).

## Installation

```shell
npm install tator
```

## Usage

### Node

```js
let tator = require('tator');
let api = tator.getApi('https://cloud.tator.io', TOKEN);

// For ES6 class object output
api.getMediaList(PROJECT).then(medias => console.log(medias));

// For raw JSON output
api.getMediaListWithHttpInfo(PROJECT).then(info => console.log(info.response.body));
```

### Browser

```js
import { getApi } from 'tator';
let api = getApi('https://cloud.tator.io', TOKEN);

// For ES6 class object output
api.getMediaList(PROJECT).then(medias => console.log(medias));

// For raw JSON output
api.getMediaListWithHttpInfo(PROJECT).then(info => console.log(info.response.body));
```

This will generate code using the schema at https://cloud.tator.io. If you are a tator developer, call `make js-bindings` from the main `tator` project (for which this project is a submodule) and it will use the schema from the local backend image.

## Building (developers only)

```shell
make build
```

## Run examples (developers only)

```shell
cd pkg
node examples/setup-project.js -h
```

Note that example scripts must be run from the build directory `pkg` as they use relative imports.

## Run tests (developers only)

```shell
HOST=https://local.tator.io TOKEN=yourtoken make test
```

## Authors

Tator and tator-js are developed by [CVision AI](https://www.cvisionai.com).
