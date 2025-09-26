# md2any

A tool to convert Markdown documents to various formats with custom CSS styling. This tool provides a web-based editor with real-time preview and supports multiple CSS themes.

## Features

- Convert Markdown to HTML with custom CSS styling
- Real-time preview in web editor
- Multiple CSS themes for different styling options
- WeChat integration to send formatted content directly to WeChat Official Account drafts
- Section splitting using `---` separator for visually distinct sections
- CSS extraction from existing HTML files
- Docker support for easy deployment

## Quick Start with uv

This project uses `uv` for Python dependency management. To get started:

### Development Mode (with auto-reload)
```bash
# One command setup and start
./start_dev.sh
```

### Production Mode (optimized)
```bash
# One command setup and start
./start_prod.sh
```

### Manual Setup
1. Install uv (if not already installed):
   ```bash
   pip install uv
   ```

2. Create a virtual environment:
   ```bash
   uv venv
   ```

3. Activate the virtual environment:
   ```bash
   source .venv/bin/activate
   ```

4. Install dependencies:
   ```bash
   uv pip install -r requirements.txt
   ```

5. Run the API server:
   ```bash
   # Development mode (auto-reload enabled)
   python api_server.py --dev
   
   # Production mode (optimized)
   python api_server.py
   ```

6. Open `frontend.html` in your browser to use the editor.

## Alternative Installation Methods

### Using pip

1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the API server:
   ```bash
   python api_server.py
   ```

## Docker Deployment

### Using Pre-built Images

```bash
# Pull and run the latest image
docker pull lifuyi/md2any:latest
docker run -d -p 5002:5002 --name md2any lifuyi/md2any:latest
```

### Building from Source

**Development Environment:**
```bash
docker-compose up -d
```

**Production Environment:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Running with WeChat Configuration

```bash
docker run -d -p 5002:5002 \
  -e WECHAT_APPID=your_wechat_appid \
  -e WECHAT_SECRET=your_wechat_secret \
  --name md2any \
  lifuyi/md2any:latest
```

## API Endpoints

- `/` - Frontend interface
- `/health` - Health check
- `/styles` - Get available styles list
- `/render` - Markdown rendering
- `/wechat/send_draft` - Send to WeChat draft
- `/extract_css` - Extract CSS from WeChat articles

## WeChat Integration

The project provides powerful WeChat integration:

### Basic Usage

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

## Development

### Startup Scripts

The project includes convenient startup scripts for different environments:

| Script | Mode | Features | Use Case |
|--------|------|----------|----------|
| `./start_dev.sh` | Development | Auto-reload, debug mode | Development & testing |
| `./start_prod.sh` | Production | Optimized, no debug | Production deployment |

#### Development Mode Features:
- 🔥 **Auto-reload**: Server restarts automatically on file changes
- 🐛 **Debug mode**: Enhanced error messages and debugging
- 📁 **File watching**: Static files served with latest changes

#### Production Mode Features:
- 🚀 **Optimized**: `PYTHONOPTIMIZE=1` for better performance
- 🔒 **Secure**: Debug mode disabled
- 🛡️ **Stable**: No file watching overhead

### Adding New Themes

Theme files are located in the `themes/` directory. Each theme is a separate CSS file. You can add new CSS files to create custom themes.

### Project Structure

```
.
├── api_server.py          # Backend API server
├── frontend.html          # Frontend interface
├── frontend.js            # Frontend JavaScript
├── wxcss.py               # CSS processing utilities
├── requirements.txt       # Python dependencies
├── Dockerfile             # Development Docker configuration
├── Dockerfile.prod        # Production Docker configuration
├── docker-compose.yml     # Development Docker Compose configuration
├── docker-compose.prod.yml # Production Docker Compose configuration
├── themes/                # CSS theme directory
└── docs/                  # Documentation files
```

## License

MIT