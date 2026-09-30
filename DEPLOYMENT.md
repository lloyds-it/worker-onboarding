# Linux Deployment Guide — Lloyds Metals Worker Onboarding System

This guide explains how to deploy and host the **Lloyds Metals & Energy Limited Worker Onboarding & Camp Management System** on any modern Linux server (Ubuntu 22.04/24.04 LTS, Debian 12, RHEL 9, Rocky Linux, AWS EC2, or Azure VM).

---

## 📋 System Prerequisites

Ensure your Linux server has:
- **OS**: Ubuntu 20.04+, Debian 11+, or RHEL/CentOS/Rocky 8+
- **Node.js**: v20.x or v22.x LTS ([nodesource installation](https://github.com/nodesource/distributions))
- **Git**: Installed (`sudo apt install git` or `sudo dnf install git`)
- **Nginx**: Installed as reverse proxy (`sudo apt install nginx`)
- **Memory**: Minimum 1 GB RAM (2 GB recommended)

### Quick Server Setup (Ubuntu / Debian)
```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 20 LTS & Build tools
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx curl build-essential

# 3. Verify installation
node -v   # Should show v20.x.x
npm -v    # Should show 10.x.x
git --version
```

---

## 🚀 Step 1: Clone Repository from GitHub

```bash
# Create directory for web application
sudo mkdir -p /var/www/worker-onboarding
sudo chown -R $USER:$USER /var/www/worker-onboarding

# Clone the repository
git clone https://github.com/lloyds-it/worker-onboarding.git /var/www/worker-onboarding
cd /var/www/worker-onboarding
```

---

## ⚙️ Step 2: Configure Environment Variables

```bash
# Copy the template to .env
cp .env.example .env

# Edit .env with your actual Microsoft Fabric and Azure Service Principal credentials
nano .env
```

Ensure the following variables are set in `.env`:
```env
PORT=5000
FABRIC_SERVER=2xv4ddeoefeuhhgixzuzuy3udm-s2pfycav32ku5anvzm7d4vfmqi.database.fabric.microsoft.com
FABRIC_DATABASE=Worker_onboarding-ef0fbf2a-a528-4ed3-ae76-4fcc1f9e531a
FABRIC_PORT=1433
FABRIC_AUTH_TYPE=azure-active-directory-service-principal-secret

AZURE_TENANT_ID=8cc1ebd5-218e-4349-9cc8-be699a63741b
AZURE_CLIENT_ID=ab0981e7-bc93-4d13-81b2-4f7d08871064
AZURE_CLIENT_SECRET=your-secret-here
FABRIC_WORKSPACE="Software Databases"
```

---

## 📦 Step 3: Install Dependencies & Build Application

```bash
cd /var/www/worker-onboarding

# Install dependencies
npm ci

# Build the production React bundle (outputs to /dist)
npm run build
```

---

## 🔄 Step 4: Configure Background Service (Choose Option A or B)

### Option A: Using Systemd (Recommended for Standard Linux Servers)

1. Copy the systemd service file:
```bash
sudo cp /var/www/worker-onboarding/worker-onboarding.service /etc/systemd/system/
```

2. Adjust user permissions if needed:
```bash
# If running as www-data or your current user:
sudo sed -i "s/User=www-data/User=$USER/g" /etc/systemd/system/worker-onboarding.service
```

3. Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable worker-onboarding
sudo systemctl start worker-onboarding

# Check service status
sudo systemctl status worker-onboarding
```

4. View live logs:
```bash
sudo journalctl -u worker-onboarding -f
```

---

### Option B: Using PM2 (Alternative Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start the application with PM2
cd /var/www/worker-onboarding
pm2 start server/server.js --name "worker-onboarding"

# Save PM2 process list to restart automatically on server reboot
pm2 save
pm2 startup
```

---

## 🌐 Step 5: Configure Nginx Reverse Proxy (Port 80 / 443)

1. Copy the Nginx configuration:
```bash
sudo cp /var/www/worker-onboarding/nginx.conf /etc/nginx/sites-available/worker-onboarding

# Enable the site
sudo ln -s /etc/nginx/sites-available/worker-onboarding /etc/nginx/sites-enabled/

# Remove default site if present
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration syntax
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

2. Verify that traffic to your server IP or domain displays the Worker Onboarding portal.

---

## 🔒 Step 6: Enable HTTPS / SSL (Let's Encrypt Certbot)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain and install SSL Certificate automatically
sudo certbot --nginx -d onboarding.lloyds.in

# Certbot sets up automatic renewal out-of-the-box
sudo certbot renew --dry-run
```

---

## 🐳 Alternative: Run via Docker / Docker Compose

If your Linux host has Docker and Docker Compose installed:

```bash
cd /var/www/worker-onboarding

# Build and start container in background
docker compose up -d --build

# View container logs
docker compose logs -f

# Stop container
docker compose down
```

---

## 🔄 Routine Updates & Redeployment

Whenever updates are pushed to `https://github.com/lloyds-it/worker-onboarding.git`:

```bash
cd /var/www/worker-onboarding

# Run the automated deployment script
chmod +x deploy.sh
./deploy.sh
```
