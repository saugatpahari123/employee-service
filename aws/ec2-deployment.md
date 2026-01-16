## Deploy FastAPI (Docker + Uvicorn) to a single EC2 instance

This guide shows a simple, repeatable way to run the backend on an EC2 Ubuntu instance using Docker (or docker-compose). It includes a Dockerfile, optional `docker-compose.yml`, an Nginx reverse-proxy example, and an EC2 user-data script to bootstrap an instance.

Use this approach for development / small production deployments. For production at scale, consider ECS/EKS/Elastic Beanstalk, Load Balancers and autoscaling.

Prerequisites
- An AWS account and an SSH key pair for EC2.
- An EC2 instance (Ubuntu 22.04+ recommended) with a security group that allows inbound TCP 22 (SSH) and 80 (HTTP) and 443 (HTTPS) from your desired IPs. If using RDS, allow outbound to the RDS port (5432 by default) or set RDS SG to accept connections from the EC2 SG.

Example Dockerfile (backend)

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

# copy application
COPY backend/ ./backend/
WORKDIR /app/backend/postgres/app

ENV PYTHONUNBUFFERED=1

# default command (uvicorn)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
```

Optional docker-compose.yml (to run the app container)

```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "8000:8000"
    env_file: .env
    restart: always
    depends_on: [] # if you're using local services like redis, postgres container etc.

  # Example pg service if you prefer a local postgres (RDS is recommended for production)
  # db:
  #   image: postgres:15
  #   environment:
  #     POSTGRES_USER: postgres
  #     POSTGRES_PASSWORD: password
  #     POSTGRES_DB: employees
  #   volumes:
  #     - pgdata:/var/lib/postgresql/data

#volumes:
#  pgdata:
```

Example `.env` (store secrets securely in production — see RDS/Secrets Manager)

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
```

Manual deployment steps
1. SSH to EC2: ssh -i <key.pem> ubuntu@<ec2-ip>
2. Install Docker (or use above user-data). See https://docs.docker.com/engine/install/ubuntu/.
3. Copy your project or git clone into the instance.
4. Ensure `.env` has `DATABASE_URL` pointing to your RDS (or set up environment in systemd/docker-compose).
5. Build and run the container:

```bash
docker build -t employee-service:latest .
docker run -d --name employee-service -p 8000:8000 --env-file .env employee-service:latest
```

Or with docker-compose:

```bash
docker compose up -d --build
```

Healthchecks and process management
- Use `docker compose` with `restart: always` or configure a systemd service that runs `docker compose up -d` on boot.
- Monitor logs: `docker logs -f employee-service` or `docker compose logs -f`.

Security notes
- Do NOT store secrets in the image. Use environment variables or AWS Secrets Manager.
- If exposing the app to the public internet, enable HTTPS via Certbot (Let's Encrypt) or place a CloudFront/ALB in front.

Next steps / production hardening
- Place the app behind a load balancer (ALB) and use autoscaling groups.
- Use ECS/EKS for container orchestration, or Elastic Beanstalk for simpler deployments.
- Use AWS Certificate Manager + an ALB or CloudFront for TLS termination.
Deploy FastAPI using Docker + Uvicorn on EC2.