const base = require('@playwright/test');
const tator = require('..');

function returnIdPrintMessage(response) {
  console.log(response.message);
  return response.id;
}

// Host and token env vars
exports.test = base.test.extend({
  host: process.env.HOST,
  token: process.env.TOKEN,
  keep: process.env.KEEP === '1',
});

// Organization ID for created organization
exports.test = base.test.extend({
  organization: [async (use, workerInfo) => {
    const api = tator.Utils.getApi(base.test.host, base.test.token);
    const date = new Date();
    const dateStr = date.toString();
    const name = `test_project_${dateStr}`;
    const id = await api.createOrganization(organizationSpec={'name': name})
                     .then(returnIdPrintMessage);
    use(id);
    if (!base.test.keep) {
      await api.deleteOrganization(id);
    }
  }, { scope: 'worker', auto: true }],
});
exports.expect = base.expect;
