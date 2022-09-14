const synthetics = require('Synthetics');
const log = require('SyntheticsLogger');

// from https://docs.aws.amazon.com/cdk/api/v2/docs/aws-synthetics-alpha-readme.html
const pageLoadBlueprint = async function () {
  const webUrl = process.env.WEB_URL;
  if (!webUrl) throw new Error('WEB_URL not set');

  // Configure the stage of the API using environment variables
  const page = await synthetics.getPage();
  const response = await page.goto(webUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  // Wait for page to render. Increase or decrease wait time based on endpoint being monitored.
  await page.waitFor(15000);
  // This will take a screenshot that will be included in test output artifacts.
  await synthetics.takeScreenshot('loaded', 'loaded');
  const pageTitle = await page.title();
  log.info('Page title: ' + pageTitle);
  if (response.status() !== 200) {
    throw 'Failed to load page!';
  }
};

exports.handler = async () => {
  return await pageLoadBlueprint();
};
