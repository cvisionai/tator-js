const yargs = require('yargs');

const Tator = require('..');

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

function createStateRangeTypes(tatorApi, projectId, videoTypeId) {
  return Promise.all([
    tatorApi.createStateType(projectId, {
      "name": "Single Range 0",
      "description": "Test event 0 information",
      "dtype": "state",
      "interpolation": "attr_style_range",
      "association": "Frame",
      "visible": true,
      "grouping_default": false,
      "media_types": [videoTypeId],
      "attribute_types": [
          {
              "name": "Start Frame",
              "dtype": "int",
              "default": -1,
              "minimum": -1,
              "style": "start_frame",
          },
          {
              "name": "End Frame",
              "dtype": "int",
              "default": -1,
              "minimum": -1,
              "style": "end_frame",
          },
          {
              "name": "Notes Area",
              "dtype": "string",
              "default": "",
              "style": "long_string",
          },
          {
              "name": "Disabled Notes Area",
              "dtype": "string",
              "default": "Not verified",
              "style": "disabled long_string"
          },
          {
              "name": "Disabled Field 1",
              "dtype": "int",
              "style": "disabled",
          },
          {
              "name": "Disabled Field 2",
              "dtype": "string",
              "style": "disabled",
          },
      ]
    }),
    tatorApi.createStateType(projectId, {
      "name": "Single Range (Endchecks) 0",
      "description": "Test event 0 information",
      "dtype": "state",
      "interpolation": "attr_style_range",
      "association": "Frame",
      "visible": true,
      "grouping_default": false,
      "media_types": [videoTypeId],
      "attribute_types": [
          {
              "name": "Start Frame",
              "dtype": "int",
              "default": -1,
              "minimum": -1,
              "style": "start_frame",
          },
          {
              "name": "End Frame",
              "dtype": "int",
              "default": -1,
              "minimum": -1,
              "style": "end_frame",
          },
          {
              "name": "Starts In This Video",
              "dtype": "bool",
              "default": true,
              "style": "start_frame_check"
          },
          {
              "name": "Ends In This Video",
              "dtype": "bool",
              "default": true,
              "style": "end_frame_check"
          },
          {
              "name": "Notes Area",
              "dtype": "string",
              "default": "",
              "style": "long_string",
          },
          {
              "name": "Disabled Notes Area",
              "dtype": "string",
              "default": "Not verified",
              "style": "disabled long_string"
          },
          {
              "name": "Disabled Field 1",
              "dtype": "int",
              "style": "disabled",
          },
          {
              "name": "Disabled Field 2",
              "dtype": "string",
              "style": "disabled",
          },
      ]
    }),
    tatorApi.createStateType(projectId, {
      "name": "Test Multirange 0",
      "description": "Test event 0 information",
      "dtype": "state",
      "interpolation": "attr_style_range",
      "association": "Frame",
      "visible": true,
      "grouping_default": false,
      "media_types": [videoTypeId],
      "attribute_types": [
          {
              "name": "Range2",
              "default": "Range2 Start Frame|Range2 End Frame|Range2 In Video",
              "dtype": "string",
              "style": "range_set",
              "order": -2,
          },
          {
              "name": "Range 3",
              "default": "Range3 Start Frame|Range3 End Frame|Range3 In Video",
              "dtype": "string",
              "style": "range_set",
              "order": -3,
          },
          {
              "name": "Range 1",
              "default": "Range1 Start Frame|Range1 End Frame|Range1 In Video",
              "dtype": "string",
              "style": "range_set",
              "order": -1,
          },
          {
              "name": "Range1 In Video",
              "dtype": "bool",
              "default": false,
              "style": "in_video_check",
          },
          {
              "name": "Range1 Start Frame",
              "dtype": "int",
              "default": -1,
              "minimum": -1,
              "style": "start_frame",
          },
          {
              "name": "Range1 End Frame",
              "dtype": "int",
              "default": -1,
              "minimum": -1,
              "style": "end_frame",
          },
          {
              "name": "Range2 In Video",
              "dtype": "bool",
              "default": false,
              "style": "in_video_check",
          },
          {
              "name": "Range2 Start Frame",
              "dtype": "int",
              "default": -1,
              "minimum": -1,
              "style": "start_frame",
          },
          {
              "name": "Range2 End Frame",
              "dtype": "int",
              "default": -1,
              "minimum": -1,
              "style": "end_frame",
          },
          {
              "name": "Range3 In Video",
              "dtype": "bool",
              "default": false,
              "style": "in_video_check",
          },
          {
              "name": "Range3 Start Frame",
              "dtype": "int",
              "default": -1,
              "minimum": -1,
              "style": "start_frame",
          },
          {
              "name": "Range3 End Frame",
              "dtype": "int",
              "default": -1,
              "minimum": -1,
              "style": "end_frame",
          },
          {
              "name": "Notes Area",
              "dtype": "string",
              "default": "",
              "style": "long_string",
          },
          {
              "name": "Disabled Notes Area",
              "dtype": "string",
              "default": "Not verified",
              "style": "disabled long_string"
          },
          {
              "name": "Disabled Field 1",
              "dtype": "int",
              "style": "disabled",
          },
          {
              "name": "Disabled Field 2",
              "dtype": "string",
              "style": "disabled",
          },
      ]
    })
  ]).then(
      ([singleRangeResp, singleRangeEndchecksResp, multiRangeResp]) => {
        console.log(singleRangeResp.message);
        console.log(singleRangeEndchecksResp.message);
        console.log(multiRangeResp.message);
        return [singleRangeResp.id, singleRangeEndchecksResp.id, multiRangeResp.id];
      },
      logAndExit
    );
}

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

var tatorApi = Tator.Utils.getApi(argv.host, argv.token);

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
          createStateRangeTypes(tatorApi, projectId, videoTypeId);
        }

        if (argv.createTrackType) {
          createTrackType(tatorApi, projectId, videoTypeId);
        }
      }
    );
  }
);



