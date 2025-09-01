# md2any

Convert Markdown to any format with customizable CSS styling and send directly to WeChat Official Account drafts.

## Features

- Convert Markdown files to HTML with CSS styling
- Real-time preview in web-based editor
- Multiple CSS themes for different styling options (including extracted Chinese news themes)
- **WeChat Integration**: Send formatted content directly to WeChat Official Account drafts
- **Dash Separator**: Split content into visually independent sections using `---`
- **Enhanced Section Cards**: Special styling for separated content sections with hover effects
- **CSS Extraction**: Extract and recreate CSS from existing HTML files
- Docker support for easy deployment
- Responsive design that works on desktop and mobile
- API endpoints for programmatic access

## Files

- `api_server.py`: Backend API server with Markdown rendering and WeChat integration
- `frontend.html`: Main frontend interface with editor and preview
- `frontend.js`: Frontend JavaScript with real-time preview and WeChat functionality
- `wxcss.py`: CSS processing utilities
- `requirements.txt`: Python dependencies
- `Dockerfile`: Docker configuration
- `docker-compose.yml`: Docker Compose setup
- `sample.css`, `square.css`, `yata.css`, `custom.css`: Standard CSS themes
- `chinese_news_*.css`: Extracted Chinese news themes (original, dark, colorful, minimal)
- `THEMES_GUIDE.md`: Comprehensive guide to all available themes
- `WECHAT_INTEGRATION.md`: Complete WeChat integration documentation

## Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the API server:
   ```
   python api_server.py
   ```

3. Open `frontend.html` in a web browser

## Docker

### Using Pre-built Images

Pull and run the latest image from Docker Hub:
```bash
docker pull lifuyi/md2wechat:latest
docker run -d -p 5002:5002 \
  --name md2wechat \
  lifuyi/md2wechat:latest
```

Or use the slimmer version (recommended for production):
```bash
docker pull lifuyi/md2wechat:slim
docker run -d -p 5002:5002 \
  --name md2wechat-slim \
  lifuyi/md2wechat:slim
```

### Building from Source

Development build:
```bash
docker-compose up -d
```

Production build:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### With WeChat Configuration
```bash
docker run -d -p 5002:5002 \
  -e WECHAT_APPID=your_wechat_appid \
  -e WECHAT_SECRET=your_wechat_secret \
  --name md2wechat \
  lifuyi/md2wechat:latest
```

For detailed deployment options, see [DEPLOYMENT.md](DEPLOYMENT.md)

## WeChat Integration

The application provides powerful WeChat integration with enhanced features:

### Quick Start
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

### Key Features
- **Direct Publishing**: Send Markdown directly to WeChat draft box
- **Multiple Themes**: Choose from 8+ professional CSS themes
- **Section Separation**: Use `---` to create visually independent sections
- **Enhanced Styling**: Special section-card styling with gradients and hover effects

### Available Themes
- `chinese_news_extracted.css` - Original news layout with section cards
- `chinese_news_dark.css` - Dark mode version
- `chinese_news_colorful.css` - Vibrant gradients and glass effects
- `chinese_news_minimal.css` - Clean, minimal newspaper style
- `custom.css` - Professional modern theme
- Standard themes: `sample.css`, `square.css`, `yata.css`

For detailed documentation, see [WECHAT_INTEGRATION.md](WECHAT_INTEGRATION.md)

## Usage

### Web Interface
1. Open your browser and navigate to `http://localhost:5002`
2. Write or paste your Markdown content in the editor panel
3. Select a CSS theme from the dropdown
4. Preview the formatted output in real-time
5. Download as HTML or PNG, or send directly to WeChat

### API Usage
```bash
# Basic conversion
curl -X POST http://localhost:5002/render \
  -H "Content-Type: application/json" \
  -d '{"md": "# Hello World", "style": "chinese_news_extracted.css"}'

# WeChat integration with section separation
curl -X POST http://localhost:5002/wechat/send_draft \
  -H "Content-Type: application/json" \
  -d '{
    "appid": "your-appid",
    "secret": "your-secret", 
    "markdown": "# Title\n\nContent...\n\n---\n\n## Section 2\n\nMore...",
    "style": "chinese_news_extracted.css",
    "dashseparator": true
  }'
```

### Dash Separator Feature
Use `---` in your Markdown to create visually independent sections:

```markdown
# Main Article
Main content here...

---

## Independent Section 1
This gets enhanced section-card styling.

---

## Independent Section 2  
Another visually separated section.
```

## API Endpoints

### Core Endpoints
- `GET /` - Main web application
- `POST /render` - Convert Markdown to HTML
- `GET /styles` - List available themes
- `GET /health` - Health check

### WeChat Endpoints  
- `POST /wechat/send_draft` - Complete Markdown to WeChat workflow (recommended)
- `POST /wechat/access_token` - Get WeChat access token
- `POST /wechat/draft` - Send HTML to WeChat draft

### Parameters for `/wechat/send_draft`
- `appid` (required) - WeChat app ID
- `secret` (required) - WeChat app secret
- `markdown` (required) - Markdown content
- `style` (optional) - CSS theme (default: "sample.css")
- `dashseparator` (optional) - Enable section splitting (default: false)
- `thumb_media_id` (optional) - Thumbnail media ID

## Documentation

- **[THEMES_GUIDE.md](THEMES_GUIDE.md)** - Complete guide to all CSS themes and styling options
- **[WECHAT_INTEGRATION.md](WECHAT_INTEGRATION.md)** - Detailed WeChat integration documentation
- **[THEMES.md](THEMES.md)** - Basic theme information
- **[Option.md](Option.md)** - API usage examples