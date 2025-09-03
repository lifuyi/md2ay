# One-Line Docker Commands for md2any

## 🚀 **Quick Start Commands**

### **1. Basic Run (No WeChat)**
```bash
docker run -d -p 5002:5002 --name md2any lifuyi/md2any:latest
```

### **2. With Themes Mapping**
```bash
docker run -d -p 5002:5002 -v $(pwd)/themes:/app/themes --name md2any lifuyi/md2any:latest
```

### **3. With WeChat Integration**
```bash
docker run -d -p 5002:5002 -e WECHAT_APPID=your_appid -e WECHAT_SECRET=your_secret --name md2any lifuyi/md2any:latest
```

### **4. Full Production Setup**
```bash
docker run -d -p 5002:5002 -v $(pwd)/themes:/app/themes -e WECHAT_APPID=your_appid -e WECHAT_SECRET=your_secret --restart unless-stopped --name md2any-prod lifuyi/md2any:latest
```

### **5. Production with Custom Themes Directory**
```bash
docker run -d -p 5002:5002 -v /path/to/your/themes:/app/themes -e WECHAT_APPID=your_appid -e WECHAT_SECRET=your_secret --restart unless-stopped --name md2any-prod lifuyi/md2any:latest
```

### **6. Test Run (Auto-remove after stop)**
```bash
docker run --rm -p 5002:5002 -v $(pwd)/themes:/app/themes lifuyi/md2any:latest
```

### **7. Production with Logging**
```bash
docker run -d -p 5002:5002 -v $(pwd)/themes:/app/themes -v $(pwd)/logs:/app/logs -e WECHAT_APPID=your_appid -e WECHAT_SECRET=your_secret --restart unless-stopped --name md2any-prod lifuyi/md2any:latest
```

## 🔧 **Management Commands**

### **Stop & Remove**
```bash
docker stop md2any && docker rm md2any
```

### **Update to Latest**
```bash
docker stop md2any && docker rm md2any && docker pull lifuyi/md2any:latest && docker run -d -p 5002:5002 -v $(pwd)/themes:/app/themes -e WECHAT_APPID=your_appid -e WECHAT_SECRET=your_secret --restart unless-stopped --name md2any lifuyi/md2any:latest
```

### **View Logs**
```bash
docker logs -f md2any
```

### **Health Check**
```bash
docker exec md2any wget -qO- http://localhost:5002/health
```

## 🎯 **Most Common Use Cases**

### **For Development/Testing:**
```bash
docker run --rm -p 5002:5002 -v $(pwd)/themes:/app/themes lifuyi/md2any:latest
```

### **For Production:**
```bash
docker run -d -p 5002:5002 -v $(pwd)/themes:/app/themes -e WECHAT_APPID=your_appid -e WECHAT_SECRET=your_secret --restart unless-stopped --name md2any-prod lifuyi/md2any:latest
```

## 📝 **Parameter Explanation**

- `-d` = Run in background (detached)
- `-p 5002:5002` = Map port 5002 from container to host
- `-v $(pwd)/themes:/app/themes` = Mount local themes folder
- `-e WECHAT_APPID=...` = Set environment variable
- `--restart unless-stopped` = Auto-restart on failure
- `--name md2any` = Give container a name
- `--rm` = Auto-remove container when stopped
- `-f` = Follow logs in real-time

## ✅ **After Running**

Access your application at:
- **Web Interface**: http://localhost:5002
- **Health Check**: http://localhost:5002/health
- **API**: http://localhost:5002/render