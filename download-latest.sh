#!/bin/bash

set -e

# Remove temp dir
rm -fr chrome-aws-lambda

# Clone chrome-aws-lambda
git clone --depth=1 https://github.com/alixaxel/chrome-aws-lambda.git && \

# Change directory
cd chrome-aws-lambda && \

# Pack it
make ../layer/chrome.zip
echo 'Layer created successfully!'
