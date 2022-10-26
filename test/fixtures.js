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
  // Organization ID for created organization
  organization: async ({host, token}, use) => {
    const api = tator.getApi(host, token);
    const date = new Date();
    const dateStr = date.toString();
    const name = `test_project_${dateStr}`;
    const id = await api.createOrganization({'name': name})
                     .then(returnIdPrintMessage);
    use(id);
    if (!base.test.keep) {
      await api.deleteOrganization(id);
    }
  },
});
exports.expect = base.expect;
