# Hosting React Frontend on AWS S3

This guide explains how to host your React frontend (from `frontend/react-ui`) on AWS S3 for your employee-service project.

## 1. Build the React App

From your project root:

```
cd frontend/react-ui
REACT_APP_API_BASE="http://18.191.110.29:8000/api/employees" npm run build
```

This creates a `build/` directory with static files.

## 2. Create and Configure S3 Bucket

- Go to AWS S3 Console.
- Create a bucket (e.g., `static-files-react-employees`).
- Uncheck "Block all public access" (for public hosting).
- Enable static website hosting in the bucket properties.
  - Index document: `index.html`
  - Error document: `index.html` (for SPA routing)

## 3. Set Bucket Policy for Public Read

Go to the Permissions tab and add this policy (replace with your bucket name):

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::static-files-react-employees/*"
    }
  ]
}
```

## 4. Upload Build Files

- In the S3 Console, go to your bucket.
- Click "Upload" and select all files and folders inside `build/`.
- Or use AWS CLI:
  ```
  aws s3 sync build/ s3://static-files-react-employees
  ```

## 5. Access Your Site

- Go to the "Static website hosting" endpoint URL in the S3 bucket properties.
- Your React app will load and connect to your FastAPI backend at `http://18.191.110.29:8000/api/employees`.

## 6. CORS and API

- Your FastAPI backend must allow CORS from your S3 site (already configured in your project).
- Make sure the backend is accessible from the public internet (EC2 security group allows port 8000).

---

**Summary:**
- Build React app
- Upload `build/` to S3
- Set bucket for static hosting and public read
- Use the S3 website endpoint to access your frontend


