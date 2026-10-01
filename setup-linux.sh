#!/usr/bin/env bash
# ============================================================================
# LLOYDS METALS & ENERGY — LINUX AUTO-SETUP SCRIPT
# Domain: https://taskai.lloyds.in/onboarding/
# ============================================================================

set -e

# Must run as root or with sudo
if [ "$EUID" -ne 0 ]; then
  echo "❌ Please run this script with sudo or as root: sudo bash setup-linux.sh"
  exit 1
fi

TARGET_USER="${SUDO_USER:-$USER}"
APP_DIR="/var/www/worker-onboarding"
SERVICE_FILE="/etc/systemd/system/worker-onboarding.service"
NGINX_CONF_AVAILABLE="/etc/nginx/sites-available/worker-onboarding"
NGINX_CONF_ENABLED="/etc/nginx/sites-enabled/worker-onboarding"
TASKAI_CONF="/etc/nginx/sites-available/taskai.lloyds.in"

echo "=========================================================="
echo "🚀 1/6: Installing System Prerequisites (Node 20, Git, Nginx)"
echo "=========================================================="

apt update -y
apt install -y curl git build-essential nginx

if ! command -v node &> /dev/null || [ "$(node -v | cut -d'.' -f1 | tr -d 'v')" -lt 20 ]; then
    echo "📦 Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi

echo "Node version: $(node -v)"
echo "NPM version:  $(npm -v)"

echo "=========================================================="
echo "📥 2/6: Setting Up Application Directory & Repository"
echo "=========================================================="

mkdir -p "$APP_DIR"

if [ ! -d "$APP_DIR/.git" ]; then
    echo "Cloning repository from GitHub..."
    git clone https://github.com/lloyds-it/worker-onboarding.git "$APP_DIR"
else
    echo "Repository already present. Pulling latest main branch..."
    cd "$APP_DIR"
    git pull origin main
fi

cd "$APP_DIR"

echo "=========================================================="
echo "⚙️ 3/6: Setting Up Production Environment (.env)"
echo "=========================================================="

if [ ! -f "$APP_DIR/.env" ]; then
    cp "$APP_DIR/.env.example" "$APP_DIR/.env"
    echo "Created .env from .env.example. Please review and ensure your credentials are set."
fi

echo "=========================================================="
echo "🔨 4/6: Installing Dependencies & Building React Frontend"
echo "=========================================================="

npm ci
npm run build

echo "=========================================================="
echo "🔄 5/6: Configuring and Starting Systemd Service"
echo "=========================================================="

cp "$APP_DIR/.deployment/worker-onboarding.service" "$SERVICE_FILE"
systemctl daemon-reload
systemctl enable worker-onboarding
systemctl restart worker-onboarding

echo "Checking backend status..."
systemctl status worker-onboarding --no-pager --lines=5 || true

echo "=========================================================="
echo "🌐 6/6: Configuring Nginx Reverse Proxy"
echo "=========================================================="

# If taskai.lloyds.in config already exists, check if /workeronboarding/ is already configured
if [ -f "$TASKAI_CONF" ]; then
    if ! grep -q "location /workeronboarding/" "$TASKAI_CONF"; then
        echo "Appending /workeronboarding/ route into $TASKAI_CONF..."
        # Insert before the last closing brace
        sed -i '$e cat '"$APP_DIR/.deployment/nginx.conf" "$TASKAI_CONF"
    else
        echo "/workeronboarding/ location block already present in $TASKAI_CONF"
    fi
else
    # Install as standalone site
    cp "$APP_DIR/.deployment/nginx.conf" "$NGINX_CONF_AVAILABLE"
    ln -sf "$NGINX_CONF_AVAILABLE" "$NGINX_CONF_ENABLED"
fi

# Set proper permissions: current user owns files, www-data has group access
CURRENT_USER="${SUDO_USER:-$USER}"
chown -R "$CURRENT_USER:www-data" "$APP_DIR"
chmod -R 775 "$APP_DIR"

nginx -t
systemctl reload nginx

echo "=========================================================="
echo "🎉 SETUP COMPLETED SUCCESSFULLY!"
echo "=========================================================="
echo "🌐 Web Application: https://taskai.lloyds.in/workeronboarding/"
echo "⚡ Backend REST API: http://127.0.0.1:5000/api/"
echo "📁 Deploy Directory: /var/www/worker-onboarding"
echo "=========================================================="
