# Production Server Deployment Guide

## 🚀 **Complete Production Deployment with Docker**

This guide covers deploying md2any to a production server using Docker with best practices.

## 📋 **Prerequisites**

### **Server Requirements**
- Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- 2GB+ RAM, 20GB+ disk space
- Docker & Docker Compose installed
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)

### **Local Requirements**
- SSH access to production server
- WeChat Official Account credentials
- Custom themes (if any)

## 🔧 **Step 1: Server Setup**

### **1.1 Connect to Your Server**
```bash
# SSH into your production server
ssh root@your-server-ip
# or
ssh your-username@your-server-ip
```

### **1.2 Install Docker (if not installed)**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group (optional)
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker-compose --version
```

### **1.3 Create Production Directory**
```bash
# Create application directory
sudo mkdir -p /opt/md2any
cd /opt/md2any

# Create required subdirectories
sudo mkdir -p themes logs ssl nginx-conf

# Set proper ownership
sudo chown -R $USER:$USER /opt/md2any
```

## 📁 **Step 2: Production Files Setup**

### **2.1 Create Environment File**
```bash
# Create production environment file
cat > .env.prod << 'EOF'
# WeChat Configuration
WECHAT_APPID=your_actual_wechat_appid
WECHAT_SECRET=your_actual_wechat_secret

# Application Configuration
FLASK_ENV=production
PORT=5002

# Domain Configuration (optional)
DOMAIN=your-domain.com

# Security
FLASK_SECRET_KEY=your-super-secret-key-here
EOF

# Secure the environment file
chmod 600 .env.prod
```

### **2.2 Create Production Docker Compose**
```bash
cat > docker-compose.prod.yml << 'EOF'
version: '3.8'

services:
  md2any:
    image: lifuyi/md2any:latest
    container_name: md2any-prod
    restart: unless-stopped
    ports:
      - "127.0.0.1:5002:5002"  # Bind to localhost only
    volumes:
      - ./themes:/app/themes:ro  # Read-only themes
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
        reservations:
          memory: 256M
          cpus: '0.25'

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
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 5s
      retries: 3

networks:
  md2any-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

volumes:
  md2any-logs:
    driver: local
EOF
```

### **2.3 Create Nginx Configuration**
```bash
cat > nginx-conf/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    upstream md2any_backend {
        server md2any:5002;
        keepalive 32;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name _;
        
        # Health check endpoint (allow HTTP)
        location /health {
            proxy_pass http://md2any_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
        
        # Redirect all other traffic to HTTPS
        location / {
            return 301 https://$host$request_uri;
        }
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name _;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_session_timeout 1d;
        ssl_session_cache shared:SSL:50m;
        ssl_session_tickets off;

        # Modern SSL configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # HSTS
        add_header Strict-Transport-Security "max-age=63072000" always;

        # Main application
        location / {
            proxy_pass http://md2any_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeouts for WeChat API calls
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
            
            # Buffer settings
            proxy_buffering on;
            proxy_buffer_size 4k;
            proxy_buffers 8 4k;
        }

        # Static files caching
        location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
            proxy_pass http://md2any_backend;
            proxy_set_header Host $host;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
EOF
```

## 🔐 **Step 3: SSL Certificate Setup**

### **3.1 Using Let's Encrypt (Recommended)**
```bash
# Install Certbot
sudo apt install certbot -y

# Stop any running web server temporarily
sudo systemctl stop nginx 2>/dev/null || true

# Generate SSL certificate
sudo certbot certonly --standalone \
  --preferred-challenges http \
  -d your-domain.com \
  --email your-email@example.com \
  --agree-tos \
  --non-interactive

# Copy certificates to our directory
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem

# Set proper permissions
sudo chown $USER:$USER ssl/*.pem
chmod 600 ssl/*.pem
```

### **3.2 Using Self-Signed Certificate (Development)**
```bash
# Generate self-signed certificate (for testing only)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=your-domain.com"

chmod 600 ssl/*.pem
```

## 📦 **Step 4: Deploy Themes**

### **4.1 Upload Your Themes**
```bash
# From your local machine, upload themes
scp -r themes/* your-username@your-server-ip:/opt/md2any/themes/

# Or download default themes
cd themes
wget https://raw.githubusercontent.com/lifuyi/md2any/main/themes/sample.css
wget https://raw.githubusercontent.com/lifuyi/md2any/main/themes/chinese_news_extracted.css
# ... download other themes as needed
```

### **4.2 Set Proper Permissions**
```bash
# On the server
chmod 644 themes/*.css
chown $USER:$USER themes/*.css
```

## 🚀 **Step 5: Deploy Application**

### **5.1 Pull Latest Image**
```bash
# Pull the latest production image
docker pull lifuyi/md2any:latest

# Verify image
docker images lifuyi/md2any:latest
```

### **5.2 Start Production Services**
```bash
# Load environment variables and start services
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## ✅ **Step 6: Verification & Testing**

### **6.1 Health Checks**
```bash
# Test application health
curl http://localhost:5002/health
curl https://your-domain.com/health

# Test themes loading
curl https://your-domain.com/styles

# Test basic rendering
curl -X POST https://your-domain.com/render \
  -H "Content-Type: application/json" \
  -d '{"md": "# Production Test", "style": "sample.css"}'
```

### **6.2 WeChat Integration Test**
```bash
# Test with your real WeChat credentials
curl -X POST https://your-domain.com/wechat/send_draft \
  -H "Content-Type: application/json" \
  -d '{
    "appid": "your_real_appid",
    "secret": "your_real_secret",
    "markdown": "# Production Deployment Test\n\nSuccessfully deployed to production server!",
    "style": "chinese_news_extracted.css"
  }'
```

## 🔧 **Step 7: Production Maintenance**

### **7.1 Monitoring Setup**
```bash
# Create monitoring script
cat > monitor.sh << 'EOF'
#!/bin/bash
# Simple monitoring script

echo "=== MD2ANY Production Status ==="
echo "Date: $(date)"
echo ""

echo "Container Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "Health Check:"
curl -s http://localhost:5002/health || echo "Health check failed"

echo ""
echo "Disk Usage:"
df -h /opt/md2any

echo ""
echo "Memory Usage:"
docker stats --no-stream md2any-prod

echo ""
echo "Recent Logs:"
docker-compose -f docker-compose.prod.yml logs --tail 10
EOF

chmod +x monitor.sh
```

### **7.2 Backup Script**
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/md2any"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "Creating backup: $DATE"

# Backup themes
tar -czf $BACKUP_DIR/themes_$DATE.tar.gz themes/

# Backup configuration
cp .env.prod $BACKUP_DIR/env_$DATE.backup
cp docker-compose.prod.yml $BACKUP_DIR/compose_$DATE.backup
cp nginx-conf/nginx.conf $BACKUP_DIR/nginx_$DATE.backup

# Backup SSL certificates
tar -czf $BACKUP_DIR/ssl_$DATE.tar.gz ssl/

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.backup" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR"
EOF

chmod +x backup.sh
```

### **7.3 Auto-renewal for SSL**
```bash
# Add to crontab for automatic SSL renewal
(crontab -l 2>/dev/null; echo "0 3 * * * /usr/bin/certbot renew --quiet && docker-compose -f /opt/md2any/docker-compose.prod.yml restart nginx") | crontab -
```

## 🔄 **Step 8: Updates & Scaling**

### **8.1 Application Updates**
```bash
# Update to latest version
docker pull lifuyi/md2any:latest
docker-compose -f docker-compose.prod.yml up -d --no-deps md2any

# Verify update
docker-compose -f docker-compose.prod.yml logs md2any
```

### **8.2 Scaling (if needed)**
```bash
# Scale application horizontally
docker-compose -f docker-compose.prod.yml up -d --scale md2any=3

# Update nginx upstream configuration for load balancing
# (requires nginx.conf modification)
```

## 🚨 **Troubleshooting**

### **Common Issues & Solutions**

1. **Port 80/443 already in use**:
   ```bash
   sudo netstat -tlnp | grep :80
   sudo systemctl stop apache2  # or nginx
   ```

2. **SSL certificate issues**:
   ```bash
   # Check certificate validity
   openssl x509 -in ssl/cert.pem -text -noout
   
   # Regenerate if needed
   sudo certbot renew --force-renewal
   ```

3. **Container won't start**:
   ```bash
   # Check logs
   docker-compose -f docker-compose.prod.yml logs
   
   # Check resources
   docker system df
   docker system prune -f
   ```

4. **WeChat API timeouts**:
   ```bash
   # Test connectivity
   docker exec md2any-prod wget -qO- https://api.weixin.qq.com
   
   # Check firewall
   sudo ufw status
   ```

## 📊 **Performance Optimization**

### **System Optimization**
```bash
# Increase file limits
echo "fs.file-max = 65536" >> /etc/sysctl.conf
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf

# Apply changes
sysctl -p
```

### **Docker Optimization**
```bash
# Configure Docker daemon
cat > /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
EOF

# Restart Docker
sudo systemctl restart docker
```

## ✅ **Production Checklist**

- [ ] Server setup completed
- [ ] Docker & Docker Compose installed
- [ ] SSL certificates configured
- [ ] Environment variables set
- [ ] Themes uploaded
- [ ] Application deployed
- [ ] Health checks passing
- [ ] WeChat integration tested
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Firewall configured
- [ ] Domain DNS configured
- [ ] SSL auto-renewal setup

## 🎯 **Final Verification**

Your production deployment is complete when:

1. ✅ `https://your-domain.com/health` returns `{"status":"ok"}`
2. ✅ `https://your-domain.com/styles` lists all themes
3. ✅ WeChat integration works with real credentials
4. ✅ SSL certificate is valid and auto-renewing
5. ✅ Monitoring and backups are functional

**🎉 Congratulations! Your md2any application is now running in production!**