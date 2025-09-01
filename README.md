# md2any

Convert Markdown to any format with customizable CSS styling.

## Features

- Convert Markdown files to HTML
- Apply custom CSS styles
- Simple API server for processing
- Web-based frontend interface

## Files

- `api_server.py`: Backend API server
- `frontend.html`: Main frontend interface
- `frontend.js`: Frontend JavaScript
- `wxcss.py`: CSS processing utilities
- `requirements.txt`: Python dependencies
- `Dockerfile`: Docker configuration
- `docker-compose.yml`: Docker Compose setup

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

Build and run with Docker:
```
docker-compose up
```