'use strict';
const chromium = require('chrome-aws-lambda');
const path = require('path');
const { S3 } = require('aws-sdk');
const puppeteer = chromium.puppeteer;
const cache = {};
const s3 = new S3();

const returnImageFromS3 = async (key) => {
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: key,
  };

  try {
    const item = await s3.getObject(params).promise();
    return item.Body;
  } catch (error) {
    return undefined;
  }
};

const saveImageToS3 = async (buffer, key) => {
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: key,
    Body: buffer,
  };

  try {
    await s3.upload(params).promise();
  } catch (error) {
    console.error('Failed to upload image to S3', { error });
  }
};

module.exports.index = async (event, context) => {
  let browser = null;
  const template = event.queryStringParameters.template || 'index.html';
  const queryString = Object.keys(event.queryStringParameters)
    .map((key) => key + '=' + event.queryStringParameters[key])
    .join('&');
  const url = path.join('file://', __dirname, `${template}?${queryString}`);

  const width = event.queryStringParameters.width
    ? parseInt(event.queryStringParameters.width, 10)
    : 1200;
  const height = event.queryStringParameters.height
    ? parseInt(event.queryStringParameters.height, 10)
    : 630;

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

  const s3Key = `${event.queryStringParameters.title}-${template}`;
  const s3Item = await returnImageFromS3(s3Key);

  if (s3Item) {
    return {
      statusCode: 200,
      body: s3Item,
      headers: {
        'Content-Type': 'image/png',
      },
      isBase64Encoded: true,
    };
  }

  try {
    browser = await puppeteer.launch({
      defaultViewport: { width, height },
      headless: true,
      executablePath: await chromium.executablePath,
      args: chromium.args,
    });

    const page = await browser.newPage();
    await page.goto(url);

    const image = await page.screenshot({
      clip: { x: 0, y: 0, width, height },
      encoding: 'base64',
    });

    cache[queryString] = image;

    await saveImageToS3(image, s3Key);

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
