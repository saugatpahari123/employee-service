## AWS RDS (PostgreSQL) setup for Employee Service

This document shows how to create an RDS PostgreSQL instance, configure networking/security, and connect your FastAPI app using a DATABASE_URL.

Security overview
- Create a security group for RDS that allows inbound from your EC2 instance security group on port 5432 only.
- Prefer private subnets for the RDS instance (not publicly accessible). If you need public access for dev, set `--publicly-accessible` to `true` but avoid this in production.

Create subnet group (if you have a VPC with multiple subnets)

```bash
aws rds create-db-subnet-group \
  --db-subnet-group-name employee-subnets \
  --db-subnet-group-description "Subnets for employee-service RDS" \
  --subnet-ids subnet-abc subnet-def subnet-ghi
```

Create an RDS security group (example using AWS console is fine). Make sure inbound rule allows PostgreSQL (5432) from the EC2 SG.

Create the RDS instance (example using AWS CLI)

```bash
aws rds create-db-instance \
  --db-instance-identifier employee-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --allocated-storage 20 \
  --master-username postgres \
  --master-user-password 'ReplaceWithStrongPassword' \
  --vpc-security-group-ids sg-0123456789abcdef0 \
  --db-subnet-group-name employee-subnets \
  --backup-retention-period 7 \
  --no-publicly-accessible \
  --engine-version 15.3
```

Notes
- Replace `sg-...` and subnet IDs with values from your VPC.
- `--no-publicly-accessible` ensures the DB is private; if you're testing from your laptop, either temporarily make it publicly accessible (not recommended) or connect via an EC2 bastion host in the same VPC.

Wait for the DB to become available:

```bash
aws rds wait db-instance-available --db-instance-identifier employee-db
```

Get the endpoint hostname and port:

```bash
aws rds describe-db-instances --db-instance-identifier employee-db --query "DBInstances[0].Endpoint" --output json
```

Create database and run migrations
- You can connect from an EC2 instance inside the same VPC (or via bastion) with psql to create additional schemas or run migrations.

Example connect from EC2 (install `postgresql-client` on the instance):

```bash
psql "host=<endpoint> port=5432 user=postgres password='ReplaceWithStrongPassword' dbname=postgres"
CREATE DATABASE employees;
\q
```

Connection string for your app

Set `DATABASE_URL` in your `.env` or secret store:

```
DATABASE_URL=postgresql://postgres:ReplaceWithStrongPassword@<endpoint>:5432/employees
```

Use AWS Secrets Manager (recommended) to store DB credentials

Create a secret:

```bash
aws secretsmanager create-secret --name employee-db-credentials --secret-string '{"username":"postgres","password":"ReplaceWithStrongPassword"}'
```

Retrieve secret (example):

```bash
aws secretsmanager get-secret-value --secret-id employee-db-credentials --query SecretString --output text
```

If you use Secrets Manager, retrieve secrets at app startup (or via environment injection) and construct `DATABASE_URL` accordingly.

Backups, maintenance and high availability
- Configure `backup-retention-period` and preferred maintenance window.
- For production, enable Multi-AZ and read replicas if needed.

Troubleshooting
- If you cannot connect, verify:
  - EC2 and RDS are in the same VPC (or peered VPCs).
  - RDS SG allows inbound from EC2 SG on 5432.
  - No network ACL blocks traffic.
Create PostgreSQL database using AWS RDS.