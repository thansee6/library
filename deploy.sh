#!/bin/bash
# ═══════════════════════════════════════════════════════════════════
#  Library Management System — AWS EC2 Deployment Script (No Docker)
#  Run this on a fresh Ubuntu 22.04 / Amazon Linux 2023 EC2 instance
# ═══════════════════════════════════════════════════════════════════

set -e

echo "══════════════════════════════════════════"
echo "  Library Management System — EC2 Setup"
echo "══════════════════════════════════════════"

# ── Step 1: System Updates ────────────────────────────────
echo "[1/7] Updating system packages..."
sudo apt update && sudo apt upgrade -y

# ── Step 2: Install Node.js 22 ────────────────────────────
echo "[2/7] Installing Node.js 22..."
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
echo "Node.js $(node -v) installed"

# ── Step 3: Install PostgreSQL 16 ─────────────────────────
echo "[3/7] Installing PostgreSQL 16..."
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE library_db;" 2>/dev/null || echo "Database already exists"
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'your-strong-password-here';"

echo "PostgreSQL installed and configured"

# ── Step 4: Install Nginx ─────────────────────────────────
echo "[4/7] Installing Nginx..."
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# ── Step 5: Install PM2 (Process Manager) ─────────────────
echo "[5/7] Installing PM2..."
sudo npm install -g pm2

# ── Step 6: Clone and Setup Application ───────────────────
echo "[6/7] Setting up application..."
cd /home/ubuntu

# If cloning from git:
# git clone <your-repo-url> library
# cd library

# ── Backend Setup ──
cd /home/ubuntu/library/backend
npm ci --only=production

# Create production .env
cat > .env << 'EOF'
DB_HOST=localhost
DB_PORT=5432
DB_NAME=library_db
DB_USER=postgres
DB_PASSWORD=your-strong-password-here

JWT_SECRET=CHANGE-THIS-TO-A-RANDOM-64-CHAR-STRING
JWT_EXPIRE=24h

PORT=5000
NODE_ENV=production
FRONTEND_URL=http://YOUR-EC2-PUBLIC-IP

# Uncomment for email notifications:
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
EOF

echo "Backend configured"

# ── Frontend Setup ──
cd /home/ubuntu/library/frontend

# Create production env (empty = uses Nginx proxy)
echo "" > .env

npm ci
npm run build
echo "Frontend built"

# ── Step 7: Configure Nginx ───────────────────────────────
echo "[7/7] Configuring Nginx..."

sudo tee /etc/nginx/sites-available/library > /dev/null << 'NGINX'
server {
    listen 80;
    server_name _;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    # Frontend — serve built static files
    root /home/ubuntu/library/frontend/dist;
    index index.html;

    # Cache static assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Node.js backend
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket proxy for Socket.IO
    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Uploaded book covers
    location /uploads/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        expires 7d;
        add_header Cache-Control "public";
    }
}
NGINX

# Enable the site
sudo ln -sf /etc/nginx/sites-available/library /etc/nginx/sites-enabled/library
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo "Nginx configured"

# ── Start Backend with PM2 ────────────────────────────────
cd /home/ubuntu/library/backend
pm2 start index.js --name "library-api" --max-memory-restart 500M
pm2 save
pm2 startup | tail -1 | sudo bash

echo ""
echo "══════════════════════════════════════════"
echo "  ✅ Deployment Complete!"
echo "══════════════════════════════════════════"
echo ""
echo "  App:      http://YOUR-EC2-PUBLIC-IP"
echo "  API:      http://YOUR-EC2-PUBLIC-IP/api"
echo "  Backend:  pm2 status | pm2 logs library-api"
echo ""
echo "  Next steps:"
echo "  1. Update YOUR-EC2-PUBLIC-IP in .env and nginx config"
echo "  2. Change DB_PASSWORD and JWT_SECRET"
echo "  3. Set up HTTPS with: sudo certbot --nginx"
echo "══════════════════════════════════════════"
