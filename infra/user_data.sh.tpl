#!/bin/bash
# EC2 bootstrap script — runs once at first launch as root
# Terraform substitutes: ${github_repo}, ${aws_region}, ${project}
set -euo pipefail

APP_DIR="/var/www/nyp-demo"

# ── System ────────────────────────────────────────────────────────
dnf update -y
dnf install -y git nginx

# ── Node.js 20 via NodeSource ─────────────────────────────────────
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs

# ── App directory ─────────────────────────────────────────────────
mkdir -p "$APP_DIR"
chown ec2-user:ec2-user "$APP_DIR"

# ── Clone repository ──────────────────────────────────────────────
sudo -u ec2-user git clone https://github.com/${github_repo}.git "$APP_DIR"

# ── Install production dependencies ───────────────────────────────
sudo -u ec2-user bash -c "cd '$APP_DIR/server' && npm install --omit=dev"

# ── Systemd service ───────────────────────────────────────────────
# Terraform has already substituted ${aws_region} and ${project} above;
# the resulting values are plain strings by the time bash runs this.
cat > /etc/systemd/system/nyp-demo.service << EOF
[Unit]
Description=NYP Demo Node.js Server
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/var/www/nyp-demo/server
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=AWS_REGION=${aws_region}
Environment=SSM_PREFIX=/${project}
ExecStart=/usr/bin/node server.js
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# ── Nginx reverse proxy ───────────────────────────────────────────
# Single-quoted heredoc so bash leaves nginx $variables untouched
cat > /etc/nginx/conf.d/nyp-demo.conf << 'NGINX_CONF'
server {
    listen 80 default_server;
    server_name _;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_read_timeout 30s;
    }
}
NGINX_CONF

rm -f /etc/nginx/conf.d/default.conf

# ── Start services ────────────────────────────────────────────────
systemctl daemon-reload
systemctl enable --now nyp-demo
systemctl enable --now nginx

# ── SSM agent ─────────────────────────────────────────────────────
# AL2023 ships with the agent pre-installed; restart after user_data
# finishes so the IAM role is fully in effect before first registration.
systemctl enable amazon-ssm-agent
systemctl restart amazon-ssm-agent
