# md2any

Convert Markdown to any format with customizable CSS styling and send directly to WeChat Official Account drafts.

## Features

- Convert Markdown files to HTML with CSS styling
- Real-time preview in web-based editor
- Multiple CSS themes for different styling options
- Send formatted content directly to WeChat Official Account drafts
- Docker support for easy deployment
- Responsive design that works on desktop and mobile

## Files

- `api_server.py`: Backend API server with Markdown rendering and WeChat integration
- `frontend.html`: Main frontend interface with editor and preview
- `frontend.js`: Frontend JavaScript with real-time preview and WeChat functionality
- `wxcss.py`: CSS processing utilities
- `requirements.txt`: Python dependencies
- `Dockerfile`: Docker configuration
- `docker-compose.yml`: Docker Compose setup
- `sample.css`, `square.css`, `yata.css`: CSS themes for styling output

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
docker run -d -p 5002:5002 lifuyi/md2wechat:latest
```

Or use the slimmer version (recommended):
```bash
docker pull lifuyi/md2wechat:slim
docker run -d -p 5002:5002 lifuyi/md2wechat:slim
```

### Building from Source

Build and run with Docker:
```bash
docker-compose up
```

## WeChat Integration

The application can send formatted Markdown content directly to WeChat Official Account drafts:

1. Configure your WeChat Official Account credentials in the web interface
2. Write your content in Markdown format
3. Click "Send to WeChat Draft" to publish directly to your WeChat account

## Usage

1. Write or paste your Markdown content in the editor panel
2. Select a CSS theme from the dropdown
3. Preview the formatted output in real-time
4. Download as HTML or PNG, or send directly to WeChat