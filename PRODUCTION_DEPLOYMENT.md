# Production Deployment Guide for md2any

## 🚀 **Production-Ready Docker Setup**

### **1. Production Image**
```bash
# Pull the latest production image
docker pull lifuyi/md2any:latest

# Verify image details
docker images lifuyi/md2any:latest
```

### **2. Production Environment Variables**
Create `.env.prod`:
```bash
# WeChat Configuration
WECHAT_APPID=your_production_wechat_appid
WECHAT_SECRET=your_production_wechat_secret

# Server Configuration
PORT=5002
FLASK_ENV=production

# Optional: Custom domain
DOMAIN=your-domain.com
```

### **3. Production Docker Compose**
Create `docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  md2any:
    image: lifuyi/md2any:latest
    container_name: md2any-prod
    restart: unless-stopped
    ports:
      - "5002:5002"
    volumes:
      - ./themes:/app/themes
      - ./logs:/app/logs
    environment:
      - WECHAT_APPID=${WECHAT_APPID}
      - WECHAT_SECRET=${WECHAT_SECRET}
      - FLASK_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5002/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - md2any-network

  # Optional: Nginx reverse proxy
  nginx:
    image: nginx:alpine
    container_name: md2any-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - md2any
    networks:
      - md2any-network

networks:
  md2any-network:
    driver: bridge
```

### **4. Nginx Configuration**
Create `nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    upstream md2any {
        server md2any:5002;
    }

    server {
        listen 80;
        server_name your-domain.com;
        
        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";

        location / {
            proxy_pass http://md2any;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Increase timeout for WeChat API calls
            proxy_read_timeout 60s;
            proxy_connect_timeout 60s;
        }
    }
}
```

## 🔧 **Production Deployment Steps**

### **Step 1: Server Setup**
```bash
# Create production directory
mkdir -p /opt/md2any-prod
cd /opt/md2any-prod

# Create required directories
mkdir -p themes logs ssl

# Set proper permissions
chmod 755 themes logs
```

### **Step 2: Environment Configuration**
```bash
# Copy your themes
cp -r /path/to/your/themes/* ./themes/

# Create environment file
cat > .env.prod << EOF
WECHAT_APPID=your_actual_appid
WECHAT_SECRET=your_actual_secret
FLASK_ENV=production
EOF

# Secure the environment file
chmod 600 .env.prod
```

### **Step 3: Deploy with Docker Compose**
```bash
# Deploy the application
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d

# Verify deployment
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs
```

### **Step 4: Health Check**
```bash
# Test application health
curl http://localhost:5002/health

# Test themes loading
curl http://localhost:5002/styles

# Test markdown rendering
curl -X POST http://localhost:5002/render \
  -H "Content-Type: application/json" \
  -d '{"md": "# Production Test", "style": "sample.css"}'
```

## 🔒 **Security Considerations**

### **1. Environment Variables**
- Store sensitive data in `.env.prod`
- Never commit secrets to version control
- Use Docker secrets for enhanced security

### **2. Network Security**
```bash
# Create isolated network
docker network create md2any-secure

# Run with custom network
docker run -d --network md2any-secure \
  -p 5002:5002 \
  -v $(pwd)/themes:/app/themes \
  --name md2any-prod \
  lifuyi/md2any:latest
```

### **3. SSL/TLS Setup**
```bash
# Generate SSL certificates (Let's Encrypt example)
certbot certonly --standalone -d your-domain.com

# Copy certificates
cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/cert.pem
cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/key.pem
```

## 📊 **Monitoring & Logging**

### **1. Container Monitoring**
```bash
# Monitor container stats
docker stats md2any-prod

# Check container health
docker inspect md2any-prod | grep Health -A 10

# View logs
docker logs -f md2any-prod
```

### **2. Application Monitoring**
```bash
# Health check endpoint
curl http://localhost:5002/health

# Monitor WeChat API calls
tail -f logs/app.log | grep wechat
```

## 🔄 **Updates & Maintenance**

### **1. Update Application**
```bash
# Pull latest image
docker pull lifuyi/md2any:latest

# Recreate container with new image
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

### **2. Backup Strategy**
```bash
# Backup themes
tar -czf themes-backup-$(date +%Y%m%d).tar.gz themes/

# Backup configuration
cp .env.prod .env.prod.backup
cp docker-compose.prod.yml docker-compose.prod.yml.backup
```

## 🚨 **Troubleshooting**

### **Common Issues**
1. **Port conflicts**: Change port mapping in docker-compose
2. **Permission issues**: Check file permissions on themes folder
3. **WeChat API errors**: Verify credentials and network connectivity
4. **Memory issues**: Add memory limits to docker-compose

### **Debug Commands**
```bash
# Enter container for debugging
docker exec -it md2any-prod sh

# Check container logs
docker logs md2any-prod --tail 100

# Test internal connectivity
docker exec md2any-prod curl http://localhost:5002/health
```

## 📈 **Performance Optimization**

### **1. Resource Limits**
```yaml
services:
  md2any:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

### **2. Scaling**
```bash
# Scale horizontally
docker-compose -f docker-compose.prod.yml up -d --scale md2any=3

# Load balancer configuration needed for multiple instances
```

## ✅ **Production Checklist**

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Firewall rules configured
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Health checks working
- [ ] WeChat integration tested
- [ ] Performance testing completed
- [ ] Security audit passed
- [ ] Documentation updated