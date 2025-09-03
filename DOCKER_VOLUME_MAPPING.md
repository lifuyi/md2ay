# Docker Volume Mapping for md2any Themes

## ✅ **Themes Folder Mapping Successfully Implemented!**

You can now map your local themes folder to the Docker container, allowing you to:

- **Add custom themes** without rebuilding the image
- **Modify existing themes** in real-time
- **Persist theme changes** across container restarts
- **Share themes** between multiple instances

## 🚀 **Usage Examples**

### 1. Basic Themes Mapping
```bash
docker run -d -p 5002:5002 \
  -v $(pwd)/themes:/app/themes \
  --name md2any \
  lifuyi/md2any:latest
```

### 2. Custom Themes Directory
```bash
docker run -d -p 5002:5002 \
  -v /path/to/your/custom/themes:/app/themes \
  --name md2any \
  lifuyi/md2any:latest
```

### 3. With WeChat Configuration
```bash
docker run -d -p 5002:5002 \
  -v $(pwd)/themes:/app/themes \
  -e WECHAT_APPID=your_appid \
  -e WECHAT_SECRET=your_secret \
  --name md2any \
  lifuyi/md2any:latest
```

### 4. Using Docker Compose
Create `docker-compose.override.yml`:
```yaml
version: '3.8'
services:
  md2any:
    volumes:
      - ./themes:/app/themes
```

Then run:
```bash
docker-compose up -d
```

## 📁 **Directory Structure**

Your local themes folder should contain `.css` files:
```
themes/
├── sample.css
├── chinese_news_extracted.css
├── forest.css
├── ocean.css
├── your_custom_theme.css
└── ...
```

## 🔄 **Live Theme Updates**

1. **Add a new theme**: Simply drop a `.css` file into your local `themes/` folder
2. **Modify existing theme**: Edit any `.css` file in your local `themes/` folder
3. **Refresh themes list**: The API automatically detects new files
4. **No restart needed**: Changes are immediately available

## 🧪 **Testing Volume Mapping**

Test if volume mapping is working:
```bash
# Check available themes
curl http://localhost:5002/styles

# Add a test theme
echo "/* My custom theme */" > themes/my_theme.css

# Verify it appears in the list
curl http://localhost:5002/styles
```

## 📊 **Current Available Themes**

The following themes are included by default:
- `sample.css` - Basic styling
- `chinese_news_extracted.css` - Professional news layout
- `chinese_news_colorful.css` - Vibrant gradients
- `forest.css` - Nature-inspired green theme
- `ocean.css` - Blue ocean theme
- `sunset.css` - Warm sunset colors
- `pastel.css` - Soft pastel colors
- `jewel.css` - Rich jewel tones
- `earthy.css` - Earth tone colors
- `breakfast_news.css` - Morning news style
- `square.css` - Geometric design
- `yata.css` - Clean modern style
- `yarta.css` - Alternative modern style

## 🔧 **API Endpoints**

- `GET /styles` - List all available themes
- `GET /styles/{theme_name}` - Download specific theme
- `POST /styles/refresh` - Force refresh themes cache
- `POST /render` - Render markdown with selected theme

## 💡 **Pro Tips**

1. **Backup themes**: Keep your custom themes in version control
2. **Theme naming**: Use descriptive names like `company_brand.css`
3. **CSS validation**: Test themes before deploying to production
4. **Performance**: Smaller CSS files load faster
5. **Responsive design**: Ensure themes work on mobile devices

## 🐛 **Troubleshooting**

If themes don't appear:
1. Check file permissions: `chmod 644 themes/*.css`
2. Verify volume mount: `docker exec container_name ls -la /app/themes/`
3. Check container logs: `docker logs container_name`
4. Refresh themes: `curl -X POST http://localhost:5002/styles/refresh`

## 📈 **Image Size Optimization**

- **Base image**: Alpine Linux (minimal footprint)
- **Current size**: ~243MB
- **Volume mapping**: Themes don't increase image size
- **Build optimization**: Multi-stage build removes build dependencies