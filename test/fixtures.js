const base = require('@playwright/test');
const http = require('http');
const fs = require('fs');

const tator = require('..');

// Host and token env vars
exports.test = base.test.extend({
  host: process.env.HOST,
  token: process.env.TOKEN,
  keep: process.env.KEEP === '1',
  // Organization ID for created organization
  organization: async ({host, token}, use) => {
    const api = tator.getApi(host, token);
    const date = new Date();
    const dateStr = date.toString();
    const name = `test_org_${dateStr}`;
    const organization = await api.createOrganization({'name': name});
    await use(organization.id);
    if (!base.test.keep) {
      await api.deleteOrganization(organization.id);
    }
  },
  // Project ID
  project: async ({host, token, organization}, use) => {
    const api = tator.getApi(host, token);
    const date = new Date();
    const dateStr = date.toString();
    const name = `test_project_${dateStr}`;
    const project = await api.createProject({
      name: name,
      summary: `Test project created by tator-js unit tests on {dateStr}`,
      organization: organization,
    });
    await use(project.id);
    if (!base.test.keep) {
      await api.deleteProject(project.id);
    }
  },
  // Video URL
  videoUrl: 'http://www.ballastmedia.com/wp-content/uploads/AudioVideoSyncTest_BallastMedia.mp4',
});
exports.expect = base.expect;
