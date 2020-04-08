'use strict';
const chromium = require('chrome-aws-lambda');
const path = require('path');
const puppeteer = chromium.puppeteer;
const cache = {};

module.exports.index = async (event, context) => {
  let browser = null;
  const template = event.queryStringParameters.template || 'index.html';
  const queryString = Object.keys(event.queryStringParameters)
    .map((key) => key + '=' + event.queryStringParameters[key])
    .join('&');
  const url = path.join('file://', __dirname, `${template}?${queryString}`);

  if (cache[queryString]) {
    return {
      statusCode: 200,
      body: cache[queryString],
      headers: {
        'Content-Type': 'image/png',
      },
      isBase64Encoded: true,
    };
  }

  try {
    browser = await puppeteer.launch({
      defaultViewport: { width: 1200, height: 630 },
      headless: true,
      executablePath: await chromium.executablePath,
      args: chromium.args,
    });

    const page = await browser.newPage();
    await page.goto(url);

    const image = await page.screenshot({
      clip: { x: 0, y: 0, width: 1200, height: 630 },
      encoding: 'base64',
    });

    cache[queryString] = image;

    return {
      statusCode: 200,
      body: image,
      headers: {
        'Content-Type': 'image/png',
      },
      isBase64Encoded: true,
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
