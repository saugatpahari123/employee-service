## Host React app on S3 (static hosting) + optional CloudFront

This guide shows how to build the React frontend and host the result in an S3 bucket (static website) and front it with CloudFront for production-friendly caching and HTTPS.

1) Build the React app

From the `frontend/react-ui` folder:

```bash
npm install
npm run build
# build output will be in frontend/react-ui/build
```

2) Create an S3 bucket

Set a globally unique bucket name and pick the AWS region.

```bash
BUCKET_NAME=employee-service-frontend-<your-unique-suffix>
aws s3 mb s3://$BUCKET_NAME --region us-east-1
```

3) Configure bucket for website hosting (development quickstart)

Enable static website hosting (index and 404 pages) via console or:

```bash
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html
```

Make the bucket contents public (NOT recommended for production without CloudFront + OAI). Example public-read policy (replace $BUCKET_NAME):

```json
{
  "Version":"2012-10-17",
  "Statement":[{
    "Sid":"PublicReadGetObject",
    "Effect":"Allow",
    "Principal": "*",
    "Action":["s3:GetObject"],
    "Resource":["arn:aws:s3:::$BUCKET_NAME/*"]
  }]
}
```

Apply policy with:

```bash
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://policy.json
```

4) Upload build files

Use `aws s3 sync` to upload and set proper content types and cache control headers:

```bash
aws s3 sync build/ s3://$BUCKET_NAME/ --acl public-read --delete --content-type "text/html" --cache-control "max-age=0, no-cache, no-store, must-revalidate"
# For other files, aws cli will set content-type automatically based on extension
```

5) Use CloudFront (recommended for HTTPS & better caching)

Create a CloudFront distribution that uses your S3 bucket as origin. For production, use an origin access identity (OAI) and restrict S3 bucket access to CloudFront.

Quick CLI example (very basic):

```bash
aws cloudfront create-distribution --origin-domain-name $BUCKET_NAME.s3.amazonaws.com
```

To invalidate cached assets after a deployment:

```bash
DISTRIBUTION_ID=E12345EXAMPLE
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"
```

6) DNS and HTTPS

- Point your domain to the CloudFront distribution by setting a CNAME (in Route53, add an A/ALIAS record to the CloudFront distribution).
- Provision an SSL certificate using AWS Certificate Manager (us-east-1 for CloudFront) and attach it to your CloudFront distribution.

7) CI/CD automation (recommended)

Add a pipeline step (GitHub Actions / CodeBuild) that runs `npm ci && npm run build` then `aws s3 sync build/ s3://$BUCKET_NAME/ --delete` and then `aws cloudfront create-invalidation ...`.

Notes and security
- For production, don't set the bucket to public; instead:
  - Create an Origin Access Control (OAC) / Origin Access Identity (OAI) for CloudFront and restrict the bucket to CloudFront.
  - Enable HTTPS via CloudFront & ACM.
- Set cache-control headers appropriately to minimize CloudFront invalidations.

Troubleshooting
- If you see a 403, ensure the bucket policy allows CloudFront (or public access if used) and that objects are uploaded with correct ACLs.
- If React app routing doesn't work (client-side routing), set `error-document` to `index.html` so the app can handle routes client-side.
Build React app and deploy to AWS S3 static hosting.