const yargs = require('../pkg/node_modules/yargs');

const Tator = require('../pkg');

const argv = yargs
  .option('host', {
    alias: 's',
    description: 'Tator host URL',
    type: 'string',
    default: 'https://www.tatorapp.com'
  })
  .option('token', {
    alias: 't',
    description: 'Your API token',
    type: 'string',
    demandOption: true
  })
  .option('name', {
    alias: 'n',
    description: "New project's name",
    type: 'string',
    demandOption: true
  })
  .option('create-state-latest-type', {
    description: "Create a state type with latest interpolation/frame association attributes"
  })
  .option('create-state-range-type', {
    description: "Create state types with attr_style_range interpolation/frame association"
  })
  .option('create-track-type', {
    description: "Create a state type with localization association"
  })
  .help()
  .alias('help', 'h')
  .argv;

function getApi(host='https://www.tatorapp.com', token=process.env.TATOR_TOKEN) {
  var defaultClient = Tator.ApiClient.instance;
  var TokenAuth = defaultClient.authentications['TokenAuth'];
  TokenAuth.apiKey = token;
  TokenAuth.apiKeyPrefix = "Token";
  defaultClient.basePath = host;
  return new Tator.TatorApi()
}

function logAndExit(error) {
  console.log(error);
  return process.exit(1);
}

function logMessageReturnId(resp) {
  console.log(resp.message);
  return resp.id;
}

function createMediaTypes(tatorApi, projectId) {
  return Promise.all([
    // Create image type.
    tatorApi.createMediaType(projectId, {
      "name": "Test Images",
      "description": "A test image type.",
      "dtype": "image",
      "attribute_types": [
          {
            "name": "Test Bool",
            "dtype": "bool",
            "order": 0,
            "default": false
          },
          {
            "name": "Test Int",
            "dtype": "int",
            "order": 1,
            "default": 0,
            "minimum": 0,
            "maximum": 1000
          },
          {
            "name": "Test Float",
            "dtype": "float",
            "order": 2,
            "default": 0.0,
            "minimum": -1000.0,
            "maximum": 1000.0
          },
          {
            "name": "Test String",
            "dtype": "string",
            "order": 3
          },
          {
            "name": "Test Enum",
            "dtype": "enum",
            "order": 4,
            "choices": ["Test Choice 1", "Test Choice 2", "Test Choice 3"],
            "labels": ["Test Choice 1", "Test Choice 2", "Test Choice 3"],
            "default": "Test Choice 1"
          },
          {
            "name": "Test Datetime",
            "dtype": "datetime",
            "order": 5,
            "use_current": true
          },
          {
            "name": "Test Geoposition",
            "dtype": "geopos",
            "order": 6,
            "default": [-71.05674, 42.35866]
          }
      ]
    }),
    // Create video type.
    tatorApi.createMediaType(projectId, {
      "name": "Test Videos",
      "description": "A test video type.",
      "dtype": "video",
      "default_volume": 50,
      "attribute_types": [
          {
            "name": "Test Bool",
            "dtype": "bool",
            "order": 0,
            "default": false
          },
          {
            "name": "Test Int",
            "dtype": "int",
            "order": 1,
            "default": 0,
            "minimum": 0,
            "maximum": 1000
          },
          {
            "name": "Test Float",
            "dtype": "float",
            "order": 2,
            "default": 0.0,
            "minimum": -1000.0,
            "maximum": 1000.0
          },
          {
            "name": "Test String",
            "dtype": "string",
            "order": 3
          },
          {
            "name": "Test Enum",
            "dtype": "enum",
            "order": 4,
            "choices": ["Test Choice 1", "Test Choice 2", "Test Choice 3"],
            "labels": ["Test Choice 1", "Test Choice 2", "Test Choice 3"],
            "default": "Test Choice 1"
          },
          {
            "name": "Test Datetime",
            "dtype": "datetime",
            "order": 5,
            "use_current": true
          },
          {
            "name": "Test Geoposition",
            "dtype": "geopos",
            "order": 6,
            "default": [-71.05674, 42.35866]
          }
      ]
    }),
    // Create multi type
    tatorApi.createMediaType(projectId, {
      "name": "Test Multi Video",
      "description": "A test multi video type.",
      "dtype": "multi",
      "attribute_types": [
          {
            "name": "Test String",
            "dtype": "string",
            "style": "long_string",
            "order": 0
          },
      ]
    })
  ]).then(
    ([imageType, videoType, multiType]) => {
      console.log(imageType.message);
      console.log(videoType.message);
      console.log(multiType.message);
      return [imageType.id, videoType.id, multiType.id];
    },
    logAndExit
  );
}

function createLocalizationTypes(tatorApi, projectId, imageTypeId, videoTypeId, versionColorMap) {
  return Promise.all([
    // Create box type.
    tatorApi.createLocalizationType(projectId, {
      "name": "Test Boxes",
      "description": "A test box type.",
      "dtype": "box",
      "media_types": [imageTypeId, videoTypeId],
      "colorMap": {
        "default": [255, 0, 0],
        "key": "Test Enum",
        "map": {
            "Test Choice 1": [0, 255, 0],
            "Test Choice 2": [0, 0, 255]
        }
      },
      "attribute_types": [
          {
            "name": "Test Bool",
            "dtype": "bool",
            "order": 0,
            "default": false
          },
          {
            "name": "Test Int",
            "dtype": "int",
            "order": 1,
            "default": 0,
            "minimum": 0,
            "maximum": 1000
          },
          {
            "name": "Test Float",
            "dtype": "float",
            "order": 2,
            "default": 0.0,
            "minimum": -1000.0,
            "maximum": 1000.0
          },
          {
            "name": "Test String",
            "dtype": "string",
            "order": 3
          },
          {
            "name": "Test Enum",
            "dtype": "enum",
            "order": 4,
            "choices": ["Test Choice 1", "Test Choice 2", "Test Choice 3"],
            "labels": ["Test Choice 1", "Test Choice 2", "Test Choice 3"],
            "default": "Test Choice 1"
          },
          {
            "name": "Test Datetime",
            "dtype": "datetime",
            "order": 5,
            "use_current": true
          },
          {
            "name": "Test Geoposition",
            "dtype": "geopos",
            "order": 6,
            "default": [-71.05674, 42.35866]
          }
      ]
    }),
    // Create line type.
    tatorApi.createLocalizationType(projectId, {
      "name": "Test Lines",
      "description": "A test line type.",
      "dtype": "line",
      "media_types": [imageTypeId, videoTypeId],
      "attribute_types": [
          {
            "name": "Test Bool",
            "dtype": "bool",
            "order": 0,
            "default": false
          },
          {
            "name": "Test Int",
            "dtype": "int",
            "order": 1,
            "default": 0,
            "minimum": 0,
            "maximum": 1000
          },
          {
            "name": "Test Float",
            "dtype": "float",
            "order": 2,
            "default": 0.0,
            "minimum": -1000.0,
            "maximum": 1000.0
          },
          {
            "name": "Test String",
            "dtype": "string",
            "order": 3
          },
          {
            "name": "Test Enum",
            "dtype": "enum",
            "order": 4,
            "choices": ["Test Choice 1", "Test Choice 2", "Test Choice 3"],
            "labels": ["Test Choice 1", "Test Choice 2", "Test Choice 3"],
            "default": "Test Choice 1"
          },
          {
            "name": "Test Datetime",
            "dtype": "datetime",
            "order": 5,
            "use_current": true
          },
          {
            "name": "Test Geoposition",
            "dtype": "geopos",
            "order": 6,
            "default": [-71.05674, 42.35866]
          }
      ]
    }),
    // Create dot type.
    tatorApi.createLocalizationType(projectId, {
      "name": "Test Dots",
        "description": "A test dot type.",
        "dtype": "dot",
        "media_types": [imageTypeId, videoTypeId],
        "colorMap": {
          "default": [255, 0, 0],
          "version": versionColorMap
        },
        "attribute_types": [
            {
              "name": "Test Bool",
              "dtype": "bool",
              "order": 0,
              "default": false
            },
            {
              "name": "Test Int",
              "dtype": "int",
              "order": 1,
              "default": 0,
              "minimum": 0,
              "maximum": 1000
            },
            {
              "name": "Test Float",
              "dtype": "float",
              "order": 2,
              "default": 0.0,
              "minimum": -1000.0,
              "maximum": 1000.0
            },
            {
              "name": "Test String",
              "dtype": "string",
              "order": 3
            },
            {
              "name": "Test Enum",
              "dtype": "enum",
              "order": 4,
              "choices": ["Test Choice 1", "Test Choice 2", "Test Choice 3"],
              "labels": ["Test Choice 1", "Test Choice 2", "Test Choice 3"],
              "default": "Test Choice 1"
            },
            {
              "name": "Test Datetime",
              "dtype": "datetime",
              "order": 5,
              "use_current": true
            },
            {
              "name": "Test Geoposition",
              "dtype": "geopos",
              "order": 6,
              "default": [-71.05674, 42.35866]
            }
        ]
    }),
  ]).then(
    ([boxType, lineType, dotType]) => {
      console.log(boxType.message);
      console.log(lineType.message);
      console.log(dotType.message);
      return [boxType.id, lineType.id, dotType.id];
    },
    logAndExit
  );
}

function createStateLatestTypes(tatorApi, projectId, videoTypeId, multiTypeId) {
  tatorApi.createStateType(projectId, {
    "name": "Test State",
    "description": "Test latest/frame state",
    "dtype": "state",
    "interpolation": "latest",
    "association": "Frame",
    "visible": true,
    "grouping_default": true,
    "media_types": [videoTypeId, multiTypeId],
    "attribute_types": [
        {
            "name": "Activity 1",
            "dtype": "bool",
            "default": false,
            "order": 0,
        },
        {
            "name": "Activity 2",
            "dtype": "bool",
            "default": false,
            "order": 1,
        },
    ]
  }).then(logMessageReturnId, logAndExit);
}

// TODO: Ask Jon about this
// function createStateRangeTypes(tatorApi, projectId, videoTypeId) {
//   tatorApi.createStateType(projectId, {
//     "name": "Test State",
//     "description": "Test latest/frame state",
//     "dtype": "state",
//     "interpolation": "latest",
//     "association": "Frame",
//     "visible": true,
//     "grouping_default": true,
//     "media_types": [videoTypeId, multiTypeId],
//     "attribute_types": [
//         {
//             "name": "Activity 1",
//             "dtype": "bool",
//             "default": false,
//             "order": 0,
//         },
//         {
//             "name": "Activity 2",
//             "dtype": "bool",
//             "default": false,
//             "order": 1,
//         },
//     ]
//   }).then(
//     (createStateTypeResp) => {
//       console.log(createStateTypeResp.message);
//       return createStateTypeResp.id;
//     },
//     logAndExit
//   )
// }

function createTrackType(tatorApi, projectId, videoTypeId) {
  tatorApi.createStateType(projectId, {
    "name": "Test Track",
    "description": "Test track using localizations as detections",
    "interpolation": "none",
    "association": "Localization",
    "visible": true,
    "grouping_default": true,
    "media_types": [videoTypeId],
    "attribute_types": [
      {
        "name": "Label",
        "dtype": "string",
        "order": 0,
        "default": "",
      },
      {
        "name": "Confidence",
        "dtype": "float",
        "order": 1,
        "default": 0.0,
      },
    ]
  }).then(logMessageReturnId, logAndExit);
}

var tatorApi = getApi(argv.host, argv.token);

// Create test organization (reuse project name)
tatorApi.createOrganization(
  {"name": argv.name}
).then(
  logMessageReturnId, logAndExit
).then(
  (orgId) => {
    // Create the test project
    return tatorApi.createProject(
      {
        "name": argv.name,
        "summary": 'A test project.',
        "organization": orgId
      }
    ).then(logMessageReturnId, logAndExit);
  },
  logAndExit
).then(
  (projectId) => {
    tatorApi.getVersionList(projectId).then(
      (versionList) => {
        // Get the baseline version
        return versionList[0].id;
      },
      logAndExit
    ).then(
      (baselineVersionId) => {
        // Create another version that is based off the baseline
        tatorApi.createVersion(projectId, {
          "name": "Test Version",
          "description": "A test version.",
          "show_empty": true,
          "bases": [baselineVersionId]
        }).then(
          (createVersionResp) => {
            console.log(createVersionResp.message)
          }
        );
      },
      logAndExit
    );

    createMediaTypes(tatorApi, projectId).then(
      ([imageTypeId, videoTypeId, multiTypeId]) => {
        versionColorMap = {
          "baselineVersion": [0, 255, 0],
          "version": [0, 0, 255]
        };
        // Create the localization types
        createLocalizationTypes(tatorApi, projectId, imageTypeId, videoTypeId, versionColorMap);

        // Create the state types if asked
        if (argv.createStateLatestType) {
          createStateLatestTypes(tatorApi, projectId, videoTypeId, multiTypeId);
        }

        if (argv.createStateRangeType) {
          console.log("Would have createStateRangeType here.")
        }

        if (argv.createTrackType) {
          createTrackType(tatorApi, projectId, videoTypeId);
        }
      }
    );
  }
);



