# Serverless OpenGraph Image Generator

[Demo - Click](https://4kp64zg64b.execute-api.us-east-1.amazonaws.com/dev/og-image?title=Hello,%20this%20is%20a%20test...&fontSize=4em)

### Usage

1. Open `index.html` and edit it as you like.

2. Run:
```sh
npm predeploy # Will clone latest chromium and zip it for AWS Lambda Layer
sls deploy # Deploy Serverless stack and push Lambda layer with Puppeteer

curl <DEPLOYED_ENDPOINT>?title=This is awesome!
```

By default, Puppeteer will render `index.html` file but you can also use `template` parameter to open another HTML file, like so:

```
https://5618scdg33.execute-api.us-east-1.amazonaws.com/dev/screenshot?template=twiddb.html?title=ANOTHER%20TEMPLATE
```

### Todo
- [ ] Add S3 caching

### Author

👤 **Dynobase**

- Twitter: [@Dynobase](https://twitter.com/dynobase)
- Github: [@Dynobase](https://github.com/Dynobase)

### Show your support

Give a ⭐️ if this project helped you!
