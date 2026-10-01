#!/usr/bin/env bash
# ============================================================================
# LLOYDS WORKER ONBOARDING SOFTWARE — PRODUCTION ROUTE UPDATER
# Automatically configures https://taskai.lloyds.in/workeronboarding/
# ============================================================================

set -e

APP_DIR="/var/www/worker-onboarding"

if [ ! -d "$APP_DIR" ]; then
    echo "❌ Error: $APP_DIR does not exist. Please run inside the deployment directory."
    exit 1
fi

cd "$APP_DIR"

echo "=========================================================="
echo "🚀 1/4: Pulling Latest Code from GitHub (main)"
echo "=========================================================="
git pull origin main

echo "=========================================================="
echo "🔨 2/4: Building Frontend Production Bundle"
echo "=========================================================="
npm run build

echo "=========================================================="
echo "🔄 3/4: Restarting Worker Onboarding Backend Service"
echo "=========================================================="
sudo systemctl restart worker-onboarding
sudo systemctl status worker-onboarding --no-pager --lines=4 || true

echo "=========================================================="
echo "🌐 4/4: Updating Nginx Reverse Proxy Configuration"
echo "=========================================================="

# Search for the configuration file defining taskai.lloyds.in
CONF_FILE=""
for candidate in \
    "/etc/nginx/sites-available/taskai.lloyds.in" \
    "/etc/nginx/sites-available/bhq-hemm" \
    "/etc/nginx/sites-enabled/taskai.lloyds.in" \
    "/etc/nginx/sites-enabled/bhq-hemm" \
    "/etc/nginx/sites-available/default" \
    "/etc/nginx/sites-enabled/default"
do
    if [ -f "$candidate" ] && grep -q "taskai.lloyds.in" "$candidate"; then
        CONF_FILE="$candidate"
        break
    fi
done

if [ -z "$CONF_FILE" ]; then
    CONF_FILE=$(grep -rl "taskai.lloyds.in" /etc/nginx/sites-available/ /etc/nginx/sites-enabled/ 2>/dev/null | head -n 1 || true)
fi

if [ -z "$CONF_FILE" ]; then
    CONF_FILE="/etc/nginx/sites-available/taskai.lloyds.in"
fi

echo "Active Nginx configuration file: $CONF_FILE"

# Check if /workeronboarding/ is already configured
if grep -q "location /workeronboarding/" "$CONF_FILE" 2>/dev/null; then
    echo "✓ /workeronboarding/ route already present in $CONF_FILE"
else
    echo "Adding /workeronboarding/ configuration blocks to $CONF_FILE..."
    # If file exists, insert right before the last closing curly brace
    if [ -f "$CONF_FILE" ]; then
        sudo cp "$CONF_FILE" "${CONF_FILE}.bak.$(date +%s)"
        # Use python or awk or sed to insert before last }
        python3 -c "
with open('$CONF_FILE', 'r') as f:
    content = f.read()

with open('$APP_DIR/.deployment/nginx.conf', 'r') as f:
    snippet = f.read()

# Find last closing brace
last_brace = content.rfind('}')
if last_brace != -1:
    new_content = content[:last_brace] + '\n' + snippet + '\n}\n'
    with open('$CONF_FILE', 'w') as f:
        f.write(new_content)
    print('Successfully inserted snippet before last closing brace.')
else:
    print('Warning: No closing brace found.')
"
    else
        echo "Creating new site config at $CONF_FILE..."
        sudo cp "$APP_DIR/.deployment/nginx.conf" "$CONF_FILE"
    fi
fi

# Ensure permissions
sudo chown -R $USER:www-data "$APP_DIR"
sudo chmod -R 775 "$APP_DIR"

echo "Validating Nginx configuration syntax..."
sudo nginx -t

echo "Reloading Nginx server..."
sudo systemctl reload nginx

echo "=========================================================="
echo "🎉 DEPLOYMENT UPDATED SUCCESSFULLY!"
echo "=========================================================="
echo "🌐 Software URL: https://taskai.lloyds.in/workeronboarding/"
echo "⚡ Tab Title:    Worker Onboarding Software"
echo "=========================================================="
