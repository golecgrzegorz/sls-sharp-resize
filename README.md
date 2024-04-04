# Resize image on upload to S3 bucket using Sharp

This service demonstrate how to use AWS S3 triggers to invoke lambda function on file upload to specific bucket.
Invoked lambda function is responsible for resizing images to specific size and format using [Sharp](https://github.com/lovell/sharp) library. 
I will store Sharp as a lambda layer and reuse it in other lambdas. Service is creating two buckets one for 
file uploading another for file serving. Resized image is copied to publicly available bucket to act as static asset. 

I have implemented 2 approaches for providing input for Sharp library one is buffer based another is stream based. 
So you can decide which one is better for your needs.

## Overview

Check `serverless.yml` for details.  

### How to deploy

I have multiple AWS credentials defined locally that's why Iam using serverless.js `profile` option to select preferred credentials.

To deploy just run:

```bash
    npm run deploy:dev
```
OR

```bash
    npm run deploy:prod
```
