#!/usr/bin/env bash
# ============================================================================
# LLOYDS METALS & ENERGY — WORKER ONBOARDING REDEPLOYMENT SCRIPT
# Location: /var/www/worker-onboarding
# Domain: https://taskai.lloyds.in/onboarding/
# ============================================================================

set -e

APP_DIR="/var/www/worker-onboarding"
SERVICE_NAME="worker-onboarding"

echo "=========================================================="
echo "🚀 Redeploying Worker Onboarding on taskai.lloyds.in"
echo "=========================================================="

cd "$APP_DIR" || { echo "❌ Directory $APP_DIR not found"; exit 1; }

# 1. Fetch latest code from GitHub
echo "📥 1. Pulling latest code from GitHub..."
git pull origin main

# 2. Check production environment file
if [ ! -f ".env" ]; then
    echo "⚠️ .env file missing! Creating from .env.example..."
    cp .env.example .env
    echo "⚠️ Please edit .env with your Microsoft Fabric credentials before proceeding."
fi

# 3. Install production dependencies
echo "📦 2. Installing dependencies..."
npm ci --silent

# 4. Build React frontend for production
echo "🔨 3. Building React frontend..."
npm run build

# 5. Set proper file ownership and permissions for www-data
echo "🔒 4. Updating permissions for current user and www-data..."
CURRENT_USER="${SUDO_USER:-$USER}"
sudo chown -R "$CURRENT_USER:www-data" "$APP_DIR"
sudo chmod -R 775 "$APP_DIR"

# 6. Restart systemd backend service
echo "🔄 5. Restarting backend service ($SERVICE_NAME)..."
sudo systemctl restart "$SERVICE_NAME"
sudo systemctl status "$SERVICE_NAME" --no-pager

# 7. Reload Nginx
echo "🌐 6. Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo "=========================================================="
echo "✅ Deployment completed successfully!"
echo "🌐 URL: https://taskai.lloyds.in/onboarding/"
echo "⚡ API: https://taskai.lloyds.in/onboarding/api/"
echo "=========================================================="
