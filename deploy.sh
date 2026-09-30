#!/usr/bin/env bash
# ============================================================================
# LLOYDS METALS & ENERGY LIMITED - AUTOMATED LINUX DEPLOYMENT SCRIPT
# Repository: https://github.com/lloyds-it/worker-onboarding.git
# ============================================================================

set -e

APP_DIR="/var/www/worker-onboarding"
SERVICE_NAME="worker-onboarding"

echo "=========================================================="
echo "🚀 Starting Deployment of Worker Onboarding System"
echo "=========================================================="

# 1. Navigate to application directory
cd "$APP_DIR" || { echo "Directory $APP_DIR does not exist!"; exit 1; }

# 2. Pull latest code from GitHub
echo "📥 Fetching latest code from GitHub repository..."
git pull origin main

# 3. Ensure production environment file exists
if [ ! -f ".env" ]; then
    echo "⚠️  WARNING: .env file missing in $APP_DIR! Copying from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your Microsoft Fabric and Azure credentials!"
fi

# 4. Install dependencies
echo "📦 Installing npm dependencies..."
npm ci --silent

# 5. Build React production bundle
echo "🔨 Building frontend application with Vite..."
npm run build

# 6. Restart Service
if command -v systemctl &> /dev/null && systemctl is-active --quiet "$SERVICE_NAME"; then
    echo "🔄 Restarting systemd service ($SERVICE_NAME)..."
    sudo systemctl restart "$SERVICE_NAME"
    sudo systemctl status "$SERVICE_NAME" --no-pager
elif command -v pm2 &> /dev/null; then
    echo "🔄 Reloading application via PM2..."
    pm2 restart "$SERVICE_NAME" || pm2 start server/server.js --name "$SERVICE_NAME"
else
    echo "ℹ️  Starting server directly in background..."
    nohup npm start > server.log 2>&1 &
fi

echo "=========================================================="
echo "✅ Deployment completed successfully!"
echo "🌐 App is running at http://localhost:5000"
echo "=========================================================="
