# Deployment Guide for Debian Production Environment

## Prerequisites
- Debian server with SSH access
- Domain name (optional, but recommended for SSL)

## 1. Set up Debian server environment

First, ensure your Debian server is updated and has the basic tools:

```bash
# Update package list and upgrade system
sudo apt update && sudo apt upgrade -y

# Install basic tools
sudo apt install -y curl wget git vim nano
```

## 2. Install required dependencies

Install all required dependencies for the application:

```bash
# Install Python 3 and pip
sudo apt install -y python3 python3-pip

# Install virtualenv for Python dependency isolation
sudo apt install -y python3-venv

# Install build dependencies for Python packages
sudo apt install -y build-essential

# Install Nginx for reverse proxy
sudo apt install -y nginx

# Install Certbot for SSL certificates
sudo apt install -y certbot python3-certbot-nginx
```

## 3. Configure the application for production

Set up the application directory and install dependencies:

```bash
# Create application directory
sudo mkdir -p /var/www/md2any

# Create a user for running the application
sudo useradd -r -s /bin/false md2any

# Set proper ownership
sudo chown -R md2any:md2any /var/www/md2any
```

Transfer your application files to the server:

```bash
# If using git (recommended)
sudo -u md2any git clone https://github.com/lifuyi/md2ay.git /var/www/md2any

# Or transfer files manually with scp
# scp -r /path/to/local/files user@server:/var/www/md2any
```

Set up the Python virtual environment and install dependencies:

```bash
# Create a virtual environment
sudo -u md2any python3 -m venv /var/www/md2any/venv

# Activate virtual environment and install dependencies
sudo -u md2any /var/www/md2any/venv/bin/pip install -r /var/www/md2any/requirements.txt

# Set proper ownership again after installing dependencies
sudo chown -R md2any:md2any /var/www/md2any
```

## 4. Set up reverse proxy with Nginx

Create an Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/md2any
```

Add the following configuration (replace `your_domain.com` with your actual domain or server IP):

```nginx
server {
    listen 80;
    server_name your_domain.com;  # Replace with your domain or server IP

    location / {
        proxy_pass http://127.0.0.1:5002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site and restart Nginx:

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/md2any /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## 5. Configure systemd service for automatic startup

Create a systemd service file:

```bash
sudo nano /etc/systemd/system/md2any.service
```

Add the following content:

```ini
[Unit]
Description=Markdown to Anything Converter
After=network.target

[Service]
User=md2any
Group=md2any
WorkingDirectory=/var/www/md2any
ExecStart=/var/www/md2any/venv/bin/python api_server.py
Restart=always
RestartSec=10
Environment=FLASK_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
# Reload systemd daemon
sudo systemctl daemon-reload

# Enable the service to start on boot
sudo systemctl enable md2any

# Start the service
sudo systemctl start md2any

# Check service status
sudo systemctl status md2any
```

## 6. Set up SSL certificate with Let's Encrypt

If you have a domain name, set up SSL with Let's Encrypt:

```bash
# Obtain SSL certificate
sudo certbot --nginx -d your_domain.com

# Follow the prompts to complete the setup
```

If you don't have a domain name and want to use the server's IP address, you can skip this step or use a self-signed certificate:

```bash
# Generate self-signed certificate (for testing only)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/nginx-selfsigned.key -out /etc/ssl/certs/nginx-selfsigned.crt
```

## 7. Test the deployment

Test that everything is working:

```bash
# Check if the service is running
sudo systemctl status md2any

# Check if Nginx is running
sudo systemctl status nginx

# Test the application
curl http://localhost
```

Access your application through your domain name or server IP address in a web browser.

## WeChat Integration Configuration

To use the WeChat integration feature:

1. Register a WeChat Official Account
2. Obtain your AppID and AppSecret from the WeChat Official Account platform
3. Configure these credentials in the web interface after deployment
4. (Optional) Upload a thumbnail image to WeChat and obtain its media_id for use with articles

## Additional Security Considerations

1. Set up a firewall:
```bash
sudo apt install ufw
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

2. Consider setting up log rotation for your application logs.

3. Regularly update your system and application dependencies.

4. For production use with WeChat integration, ensure your server has SSL enabled as WeChat requires HTTPS for API calls.

## Troubleshooting

- Check application logs: `sudo journalctl -u md2any -f`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Restart services if needed: `sudo systemctl restart md2any nginx`

If you encounter issues with the WeChat integration:
- Verify your AppID and AppSecret are correct
- Ensure your server has internet access to reach WeChat's API endpoints
- Check that your WeChat Official Account has the necessary permissions enabled