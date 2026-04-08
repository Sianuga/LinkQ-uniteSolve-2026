#!/bin/bash
# EC2 bootstrap — installs Docker, creates deploy script.
# Runs once on first boot via cloud-init.
set -ex

# --- Install Docker ---
dnf update -y
dnf install -y docker
systemctl enable docker
systemctl start docker
usermod -aG docker ec2-user

# --- Generate a persistent secret key (survives redeploys) ---
SECRET_FILE="/home/ec2-user/.linkq_secret"
if [ ! -f "$SECRET_FILE" ]; then
  openssl rand -hex 32 > "$SECRET_FILE"
  chown ec2-user:ec2-user "$SECRET_FILE"
fi

# --- Create deploy script (called by GitHub Actions via SSH) ---
cat > /home/ec2-user/deploy.sh << 'DEPLOY_SCRIPT'
#!/bin/bash
set -ex

REGION="${aws_region}"
ECR_URL="${ecr_url}"
CORS_ORIGIN="${cors_origin}"
SECRET_KEY=$(cat /home/ec2-user/.linkq_secret)

# Authenticate to ECR
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$ECR_URL"

# Pull latest image
docker pull "$ECR_URL:latest"

# Stop old container (ignore if not running)
docker stop linkq-backend 2>/dev/null || true
docker rm linkq-backend 2>/dev/null || true

# Start new container
docker run -d \
  --name linkq-backend \
  --restart unless-stopped \
  -p 8000:8000 \
  -e LINKQ_SECRET_KEY="$SECRET_KEY" \
  -e LINKQ_CORS_ORIGINS="$CORS_ORIGIN,http://localhost:5173,http://localhost:3000" \
  "$ECR_URL:latest"

# Wait for health check
for i in $(seq 1 30); do
  if curl -sf http://localhost:8000/health > /dev/null; then
    echo "Backend is healthy"
    exit 0
  fi
  sleep 2
done

echo "ERROR: Backend failed health check after 60s"
docker logs linkq-backend
exit 1
DEPLOY_SCRIPT

chmod +x /home/ec2-user/deploy.sh
chown ec2-user:ec2-user /home/ec2-user/deploy.sh

echo "EC2 bootstrap complete"
