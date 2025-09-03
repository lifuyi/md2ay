#!/bin/bash

# Quick Production Deployment Script for md2any
# Usage: ./quick-deploy.sh [domain] [email] [wechat_appid] [wechat_secret]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Get parameters
DOMAIN=${1:-"localhost"}
EMAIL=${2:-"admin@example.com"}
WECHAT_APPID=${3:-""}
WECHAT_SECRET=${4:-""}

print_status "Starting md2any production deployment..."
print_status "Domain: $DOMAIN"
print_status "Email: $EMAIL"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create application directory
APP_DIR="/opt/md2any"
print_status "Creating application directory: $APP_DIR"
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR
cd $APP_DIR

# Create subdirectories
mkdir -p themes logs ssl nginx-conf

# Create environment file
print_status "Creating environment configuration..."
cat > .env.prod << EOF
# WeChat Configuration
WECHAT_APPID=$WECHAT_APPID
WECHAT_SECRET=$WECHAT_SECRET

# Application Configuration
FLASK_ENV=production
PORT=5002

# Domain Configuration
DOMAIN=$DOMAIN

# Security
FLASK_SECRET_KEY=$(openssl rand -base64 32)
EOF

chmod 600 .env.prod

# Download production docker-compose file
print_status "Creating Docker Compose configuration..."
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  md2any:
    image: lifuyi/md2any:latest
    container_name: md2any-prod
    restart: unless-stopped
    ports:
      - "127.0.0.1:5002:5002"
    volumes:
      - ./themes:/app/themes:ro
      - ./logs:/app/logs
    environment:
      - WECHAT_APPID=${WECHAT_APPID}
      - WECHAT_SECRET=${WECHAT_SECRET}
      - FLASK_ENV=production
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:5002/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - md2any-network
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'

  nginx:
    image: nginx:alpine
    container_name: md2any-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-conf/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - md2any
    networks:
      - md2any-network

networks:
  md2any-network:
    driver: bridge
EOF

# Create Nginx configuration
print_status "Creating Nginx configuration..."
cat > nginx-conf/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent"';
    access_log /var/log/nginx/access.log main;

    sendfile on;
    keepalive_timeout 65;
    client_max_body_size 10M;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    upstream md2any_backend {
        server md2any:5002;
    }

    server {
        listen 80;
        server_name _;
        
        location /health {
            proxy_pass http://md2any_backend;
        }
        
        location / {
            return 301 https://$host$request_uri;
        }
    }

    server {
        listen 443 ssl http2;
        server_name _;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_session_timeout 1d;
        ssl_session_cache shared:SSL:50m;
        ssl_protocols TLSv1.2 TLSv1.3;

        add_header Strict-Transport-Security "max-age=63072000" always;

        location / {
            proxy_pass http://md2any_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }
    }
}
EOF

# Download default themes
print_status "Downloading default themes..."
cd themes
wget -q https://raw.githubusercontent.com/lifuyi/md2any/main/themes/sample.css || echo "/* Default theme */" > sample.css
wget -q https://raw.githubusercontent.com/lifuyi/md2any/main/themes/chinese_news_extracted.css || true
cd ..

# Setup SSL certificate
if [[ "$DOMAIN" != "localhost" ]]; then
    print_status "Setting up SSL certificate for $DOMAIN..."
    
    # Check if certbot is installed
    if command -v certbot &> /dev/null; then
        # Stop any running web server
        sudo systemctl stop nginx 2>/dev/null || true
        sudo systemctl stop apache2 2>/dev/null || true
        
        # Generate certificate
        sudo certbot certonly --standalone \
            --preferred-challenges http \
            -d $DOMAIN \
            --email $EMAIL \
            --agree-tos \
            --non-interactive || {
            print_warning "Let's Encrypt failed, creating self-signed certificate..."
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout ssl/key.pem \
                -out ssl/cert.pem \
                -subj "/C=US/ST=State/L=City/O=Organization/CN=$DOMAIN"
        }
        
        # Copy Let's Encrypt certificates if they exist
        if [[ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]]; then
            sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/cert.pem
            sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/key.pem
            sudo chown $USER:$USER ssl/*.pem
        fi
    else
        print_warning "Certbot not found, creating self-signed certificate..."
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout ssl/key.pem \
            -out ssl/cert.pem \
            -subj "/C=US/ST=State/L=City/O=Organization/CN=$DOMAIN"
    fi
else
    print_status "Creating self-signed certificate for localhost..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/key.pem \
        -out ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
fi

chmod 600 ssl/*.pem

# Pull latest image
print_status "Pulling latest Docker image..."
docker pull lifuyi/md2any:latest

# Start services
print_status "Starting production services..."
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Wait for services to start
print_status "Waiting for services to start..."
sleep 10

# Health check
print_status "Performing health check..."
if curl -s http://localhost:5002/health | grep -q "ok"; then
    print_status "✅ Application is healthy!"
else
    print_error "❌ Health check failed!"
    print_status "Checking logs..."
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi

# Create management scripts
print_status "Creating management scripts..."

# Monitor script
cat > monitor.sh << 'EOF'
#!/bin/bash
echo "=== MD2ANY Production Status ==="
echo "Date: $(date)"
echo ""
echo "Container Status:"
docker-compose -f docker-compose.prod.yml ps
echo ""
echo "Health Check:"
curl -s http://localhost:5002/health || echo "Health check failed"
echo ""
echo "Recent Logs:"
docker-compose -f docker-compose.prod.yml logs --tail 10
EOF

# Backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/md2any"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR
echo "Creating backup: $DATE"
tar -czf $BACKUP_DIR/md2any_$DATE.tar.gz themes/ .env.prod docker-compose.prod.yml nginx-conf/ ssl/
echo "Backup completed: $BACKUP_DIR/md2any_$DATE.tar.gz"
EOF

# Update script
cat > update.sh << 'EOF'
#!/bin/bash
echo "Updating md2any to latest version..."
docker pull lifuyi/md2any:latest
docker-compose -f docker-compose.prod.yml up -d --no-deps md2any
echo "Update completed!"
EOF

chmod +x monitor.sh backup.sh update.sh

# Final status
print_status "🎉 Deployment completed successfully!"
print_status ""
print_status "Application URLs:"
print_status "  HTTP:  http://$DOMAIN"
print_status "  HTTPS: https://$DOMAIN"
print_status "  Health: https://$DOMAIN/health"
print_status ""
print_status "Management commands:"
print_status "  Monitor: ./monitor.sh"
print_status "  Backup:  ./backup.sh"
print_status "  Update:  ./update.sh"
print_status ""
print_status "Application directory: $APP_DIR"
print_status "Logs: docker-compose -f docker-compose.prod.yml logs -f"
print_status ""

if [[ -n "$WECHAT_APPID" && -n "$WECHAT_SECRET" ]]; then
    print_status "WeChat integration configured with provided credentials."
else
    print_warning "WeChat credentials not provided. Update .env.prod and restart:"
    print_warning "  docker-compose -f docker-compose.prod.yml restart md2any"
fi

print_status "🚀 Your md2any application is now running in production!"