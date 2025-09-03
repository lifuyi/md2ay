# Multi-Architecture Docker Commands

## ✅ **Multi-Architecture Support Confirmed!**

The Docker image `lifuyi/md2any:latest` now supports both AMD64 and ARM64 architectures.

## 🚀 **Platform-Specific Commands**

### **Auto-Detection (Recommended):**
```bash
# Docker automatically selects the right architecture
docker run -d -p 5002:5002 --name md2any lifuyi/md2any:latest
```

### **Explicit Platform Selection:**

#### **For AMD64 (Intel/AMD servers):**
```bash
docker pull --platform linux/amd64 lifuyi/md2any:latest
docker run -d -p 5002:5002 --platform linux/amd64 --name md2any lifuyi/md2any:latest
```

#### **For ARM64 (Apple Silicon, AWS Graviton):**
```bash
docker pull --platform linux/arm64 lifuyi/md2any:latest
docker run -d -p 5002:5002 --platform linux/arm64 --name md2any lifuyi/md2any:latest
```

## 🎯 **Production Commands (Platform-Aware)**

### **AMD64 Production Setup:**
```bash
docker run -d -p 5002:5002 \
  --platform linux/amd64 \
  -v $(pwd)/themes:/app/themes \
  -e WECHAT_APPID=your_appid \
  -e WECHAT_SECRET=your_secret \
  --restart unless-stopped \
  --name md2any-prod \
  lifuyi/md2any:latest
```

### **ARM64 Production Setup:**
```bash
docker run -d -p 5002:5002 \
  --platform linux/arm64 \
  -v $(pwd)/themes:/app/themes \
  -e WECHAT_APPID=your_appid \
  -e WECHAT_SECRET=your_secret \
  --restart unless-stopped \
  --name md2any-prod \
  lifuyi/md2any:latest
```

## 🔍 **Verification Commands**

### **Check Architecture:**
```bash
# AMD64 systems should show: x86_64
# ARM64 systems should show: aarch64
docker run --rm lifuyi/md2any:latest uname -m
```

### **Check Platform-Specific:**
```bash
# Force AMD64
docker run --rm --platform linux/amd64 lifuyi/md2any:latest uname -m

# Force ARM64  
docker run --rm --platform linux/arm64 lifuyi/md2any:latest uname -m
```

### **Inspect Multi-Arch Manifest:**
```bash
docker buildx imagetools inspect lifuyi/md2any:latest
```

## 📋 **Platform Compatibility**

### **✅ Supported Platforms:**
- **linux/amd64** - Intel/AMD x86_64 processors
  - Most cloud providers (AWS EC2, Google Cloud, Azure)
  - Traditional servers and workstations
  - Docker Desktop on Intel/AMD

- **linux/arm64** - ARM64 processors  
  - Apple Silicon Macs (M1, M2, M3)
  - AWS Graviton instances
  - Raspberry Pi 4/5
  - Docker Desktop on Apple Silicon

## 🚨 **Troubleshooting Platform Issues**

### **Warning: Platform Mismatch**
If you see: `WARNING: The requested image's platform (linux/arm64) does not match the detected host platform (linux/amd64)`

**Solution 1 - Specify Platform:**
```bash
docker run --platform linux/amd64 -d -p 5002:5002 lifuyi/md2any:latest
```

**Solution 2 - Let Docker Auto-Select:**
```bash
# Remove existing image and let Docker re-select
docker rmi lifuyi/md2any:latest
docker run -d -p 5002:5002 lifuyi/md2any:latest
```

### **Force Platform Re-Detection:**
```bash
# Clear local cache and re-pull
docker system prune -f
docker pull lifuyi/md2any:latest
```

## 🎯 **Recommended Usage**

### **For Most Users (Auto-Detection):**
```bash
docker run -d -p 5002:5002 \
  -v $(pwd)/themes:/app/themes \
  -e WECHAT_APPID=your_appid \
  -e WECHAT_SECRET=your_secret \
  --restart unless-stopped \
  --name md2any \
  lifuyi/md2any:latest
```

### **For Production (Explicit Platform):**
```bash
# On AMD64 servers
docker run -d -p 5002:5002 \
  --platform linux/amd64 \
  -v $(pwd)/themes:/app/themes \
  -e WECHAT_APPID=your_appid \
  -e WECHAT_SECRET=your_secret \
  --restart unless-stopped \
  --name md2any-prod \
  lifuyi/md2any:latest

# On ARM64 servers  
docker run -d -p 5002:5002 \
  --platform linux/arm64 \
  -v $(pwd)/themes:/app/themes \
  -e WECHAT_APPID=your_appid \
  -e WECHAT_SECRET=your_secret \
  --restart unless-stopped \
  --name md2any-prod \
  lifuyi/md2any:latest
```

## ✅ **Verification Results**

- **✅ AMD64 image**: Confirmed working (`x86_64`)
- **✅ ARM64 image**: Confirmed working (`aarch64`)  
- **✅ Multi-arch manifest**: Successfully created
- **✅ Docker Hub**: Updated with both architectures
- **✅ Auto-selection**: Working correctly

## 🎉 **Ready for All Platforms!**

The md2any Docker image now works seamlessly across all major server architectures. Docker will automatically select the correct version for your platform, or you can explicitly specify it for production deployments.