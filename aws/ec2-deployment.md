# EC2 Deployment Guide for Employee Service Backend

This guide explains how to deploy your FastAPI + PostgreSQL backend to an AWS EC2 instance using Docker, based on your project setup.

Use this approach for development / small production deployments. For production at scale, consider ECS/EKS/Elastic Beanstalk, Load Balancers and autoscaling.

## 1. Launch an EC2 Instance
- Go to AWS EC2 Console > Instances > Launch Instance
- Choose Amazon Linux 2 or Ubuntu (latest LTS)
- Instance type: t2.micro (free tier) or as needed
- Key pair: Create/download for SSH access
- Network settings:
  - Allow SSH (port 22) from your IP
  - Allow HTTP (port 80) and custom TCP (port 8000) from 0.0.0.0/0 (for testing; restrict for production)

Example Dockerfile (backend)

<<<<<<< HEAD
```dockerfile
# Use an official Python runtime as a parent image
FROM python:3.11-slim

WORKDIR /app

# install system deps
RUN apt-get update && apt-get install -y build-essential gcc libpq-dev --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# copy requirements and install
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

## 2. Connect to Your EC2 Instance
```
ssh -i <your-key.pem> ec2-user@<EC2_PUBLIC_IP>
```
- For Ubuntu, use `ubuntu@18.191.110.29`

---

## 3. Install Docker
Amazon Linux 2:
```
sudo yum update -y
sudo amazon-linux-extras install docker
sudo service docker start
sudo usermod -a -G docker ec2-user
```
Ubuntu:
```
sudo apt update
sudo apt install docker.io -y
sudo systemctl start docker
sudo usermod -aG docker ubuntu
```
- Log out and back in to apply Docker group changes.

---

## 4. Clone Your Project
```
git clone https://github.com/saugatpahari123/employee-service
cd employee-service/backend/postgres/app
```

---

## 5. Set Environment Variables
- Use your RDS connection string for the backend:
```
export DATABASE_URL='postgresql://postgres:password@database-1.ctioemwy2xd8.us-east-2.rds.amazonaws.com:5432/employees'
```

---

## 6. Build and Run Docker Container
```
docker build -t employee-backend .
docker run -p 8000:8000 -e DATABASE_URL="$DATABASE_URL" employee-backend
```
- The backend will be available at `http://<EC2_PUBLIC_IP>:8000/api/employees`

---

## 7. (Optional) Run in Background
```
docker run -d -p 8000:8000 -e DATABASE_URL="$DATABASE_URL" employee-backend
```

---

## 8. Security Group Reminder
- Ensure your EC2 security group allows inbound traffic on port 8000 (and 80 if needed).
- Restrict to trusted IPs for production.

---

## 9. Update Frontend API Base
- Set `REACT_APP_API_BASE` in your React app to `http://<EC2_PUBLIC_IP>:8000/api/employees` before building and uploading to S3.

---

**Summary:**
- Launch EC2, install Docker, clone project
- Set environment variables, build and run backend
- Open port 8000 in security group
- Point frontend to backend API endpoint
```
sudo apt update
sudo apt install docker.io -y
sudo systemctl start docker
sudo usermod -aG docker ubuntu
```
- Log out and back in to apply Docker group changes.

---

## 4. Clone Your Project
```
git clone https://github.com/saugatpahari123/employee-service
cd employee-service/backend/postgres/app
>>>>>>> 21c78e4 (Update deployment and setup docs for project)
```

Example `.env` (store secrets securely in production — see RDS/Secrets Manager)

<<<<<<< HEAD
```
DATABASE_URL=postgresql://postgres:password@your-rds-host:5432/employees
SECRET_KEY=replace-me
```

Nginx reverse proxy (basic)

Save as `/etc/nginx/sites-available/employee-service` and symlink to `sites-enabled`.

```nginx
server {
    listen 80;
    server_name your.domain.name; # or EC2 public DNS

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

EC2 user-data script (automate bootstrap)

The following cloud-init script will install docker, docker-compose, clone your repo and run docker-compose (adjust repo URL and paths):

```bash
#!/bin/bash
set -e

# install docker
apt-get update
apt-get install -y ca-certificates curl gnupg lsb-release
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# add ubuntu user to docker (optional)
usermod -aG docker ubuntu || true

# clone the app
cd /opt
git clone https://github.com/your-org/employee-service.git app || true
cd app/frontend/react-ui || true

# If you prefer building and serving via docker-compose in repo root
cd /opt/app
docker compose up -d --build

# ensure docker-compose restart
=======
## 5. Set Environment Variables
- Use your RDS connection string for the backend:
```
export DATABASE_URL='postgresql://postgres:password@database-1.ctioemwy2xd8.us-east-2.rds.amazonaws.com:5432/employees'
>>>>>>> 21c78e4 (Update deployment and setup docs for project)
```

Manual deployment steps
1. SSH to EC2: ssh -i <key.pem> ubuntu@<ec2-ip>
2. Install Docker (or use above user-data). See https://docs.docker.com/engine/install/ubuntu/.
3. Copy your project or git clone into the instance.
4. Ensure `.env` has `DATABASE_URL` pointing to your RDS (or set up environment in systemd/docker-compose).
5. Build and run the container:

<<<<<<< HEAD
```bash
docker build -t employee-service:latest .
docker run -d --name employee-service -p 8000:8000 --env-file .env employee-service:latest
```

Or with docker-compose:

```bash
docker compose up -d --build
=======
## 6. Build and Run Docker Container
```
docker build -t employee-backend .
docker run -p 8000:8000 -e DATABASE_URL="$DATABASE_URL" employee-backend
>>>>>>> 21c78e4 (Update deployment and setup docs for project)
```
- The backend will be available at `http://<EC2_PUBLIC_IP>:8000/api/employees`

<<<<<<< HEAD
Healthchecks and process management
- Use `docker compose` with `restart: always` or configure a systemd service that runs `docker compose up -d` on boot.
- Monitor logs: `docker logs -f employee-service` or `docker compose logs -f`.
=======
---

## 7. (Optional) Run in Background
```
docker run -d -p 8000:8000 -e DATABASE_URL="$DATABASE_URL" employee-backend
```
>>>>>>> 21c78e4 (Update deployment and setup docs for project)

Security notes
- Do NOT store secrets in the image. Use environment variables or AWS Secrets Manager.
- If exposing the app to the public internet, enable HTTPS via Certbot (Let's Encrypt) or place a CloudFront/ALB in front.

<<<<<<< HEAD
Next steps / production hardening
- Place the app behind a load balancer (ALB) and use autoscaling groups.
- Use ECS/EKS for container orchestration, or Elastic Beanstalk for simpler deployments.
- Use AWS Certificate Manager + an ALB or CloudFront for TLS termination.
Deploy FastAPI using Docker + Uvicorn on EC2.
=======
## 8. Security Group Reminder
- Ensure your EC2 security group allows inbound traffic on port 8000 (and 80 if needed).
- Restrict to trusted IPs for production.

---

## 9. Update Frontend API Base
- Set `REACT_APP_API_BASE` in your React app to `http://<EC2_PUBLIC_IP>:8000/api/employees` before building and uploading to S3.

---

**Summary:**
- Launch EC2, install Docker, clone project
- Set environment variables, build and run backend
- Open port 8000 in security group
- Point frontend to backend API endpoint
>>>>>>> 21c78e4 (Update deployment and setup docs for project)
