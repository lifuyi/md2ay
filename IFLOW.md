# IFLOW.md - 项目上下文说明

## 项目概述

这是一个名为 **md2any** 的项目，用于将 Markdown 文档转换为各种格式，并支持自定义 CSS 样式。该项目特别集成了微信公众号功能，可以直接将格式化的内容发送到微信公众号草稿箱。

### 核心功能

1. **Markdown 转换**: 将 Markdown 文件转换为带 CSS 样式的 HTML
2. **实时预览**: 提供基于 Web 的编辑器，支持实时预览
3. **多 CSS 主题**: 提供多种 CSS 主题用于不同样式的选项
4. **微信集成**: 可以直接将格式化内容发送到微信公众号草稿箱
5. **分段显示**: 使用 `---` 分隔符将内容分割成视觉上独立的部分
6. **CSS 提取**: 可以从现有 HTML 文件中提取并重建 CSS
7. **Docker 支持**: 提供 Docker 部署支持

### 技术栈

- **后端**: Python + Flask
- **前端**: HTML + JavaScript (原生)
- **依赖库**: 
  - Flask (Web 框架)
  - markdown (Markdown 解析)
  - pymdown-extensions (Markdown 扩展)
  - beautifulsoup4 (HTML 解析)
  - requests (HTTP 请求)
  - css_inline (CSS 内联)
  - Flask-Cors (跨域支持)
- **部署**: Docker + Docker Compose

## 项目结构

```
.
├── api_server.py          # 后端 API 服务器
├── frontend.html          # 前端界面
├── frontend.js            # 前端 JavaScript
├── wxcss.py               # CSS 处理工具
├── requirements.txt       # Python 依赖
├── Dockerfile             # 开发环境 Docker 配置
├── Dockerfile.prod        # 生产环境 Docker 配置
├── docker-compose.yml     # 开发环境 Docker Compose 配置
├── docker-compose.prod.yml # 生产环境 Docker Compose 配置
├── themes/                # CSS 主题目录
├── README.md              # 项目说明文档
└── 其他文档文件            # 各种指南和说明文档
```

## 构建和运行

### 本地运行

1. **安装依赖**:
   ```bash
   pip install -r requirements.txt
   ```

2. **运行 API 服务器**:
   ```bash
   python api_server.py
   ```

3. **打开前端界面**:
   在浏览器中打开 `frontend.html`

### Docker 运行

#### 使用预构建镜像

```bash
# 拉取并运行最新镜像
docker pull lifuyi/md2any:latest
docker run -d -p 5002:5002 --name md2any lifuyi/md2any:latest
```

#### 从源码构建

**开发环境**:
```bash
docker-compose up -d
```

**生产环境**:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

#### 带微信配置的运行

```bash
docker run -d -p 5002:5002 \
  -e WECHAT_APPID=your_wechat_appid \
  -e WECHAT_SECRET=your_wechat_secret \
  --name md2any \
  lifuyi/md2any:latest
```

## 微信集成

项目提供强大的微信集成功能：

### 基本用法

```bash
curl -X POST http://localhost:5002/wechat/send_draft \
  -H "Content-Type: application/json" \
  -d '{
    "appid": "YOUR_WECHAT_APPID",
    "secret": "YOUR_WECHAT_SECRET",
    "markdown": "# Your Title\n\nContent...\n\n---\n\n## Section 2\n\nMore content...",
    "style": "chinese_news_extracted.css",
    "dashseparator": true
  }'
```

## 开发约定

### 代码风格

- 后端使用 Python Flask 框架
- 前端使用原生 JavaScript，无框架依赖
- CSS 主题文件组织在 `themes/` 目录下

### 主题开发

主题文件位于 `themes/` 目录中，每个主题都是一个独立的 CSS 文件。可以添加新的 CSS 文件来创建自定义主题。

### API 端点

- `/` - 前端界面
- `/health` - 健康检查
- `/styles` - 获取可用样式列表
- `/render` - Markdown 渲染
- `/wechat/send_draft` - 发送到微信草稿箱
- `/extract_css` - 从微信文章提取 CSS

## 部署说明

### 生产环境部署

使用 `Dockerfile.prod` 和 `docker-compose.prod.yml` 进行生产环境部署，使用 Gunicorn 作为 WSGI 服务器。

### 环境变量

- `WECHAT_APPID` - 微信 App ID
- `WECHAT_SECRET` - 微信 App Secret
- `FLASK_ENV` - Flask 环境 (development/production)