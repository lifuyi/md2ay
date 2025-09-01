# WeChat Integration Guide

This guide explains how to integrate your Markdown content with WeChat's draft box system using the enhanced API endpoints.

## Overview

The WeChat integration allows you to:
- Convert Markdown to WeChat-compatible HTML
- Apply professional CSS themes
- Split content into visually independent sections
- Send directly to WeChat draft box
- Manage WeChat access tokens

## Quick Start

### 1. Get WeChat Credentials
- **AppID**: Your WeChat application ID
- **Secret**: Your WeChat application secret
- **Media ID** (optional): For article thumbnails

### 2. Basic API Call

```bash
curl -X POST http://localhost:5002/wechat/send_draft \
  -H "Content-Type: application/json" \
  -d '{
    "appid": "YOUR_WECHAT_APPID",
    "secret": "YOUR_WECHAT_SECRET",
    "markdown": "# Your Article Title\n\nYour content here...",
    "style": "chinese_news_extracted.css"
  }'
```

## API Endpoints

### `/wechat/send_draft` (Recommended)
Complete workflow: Markdown → HTML → WeChat Draft

**Parameters:**
- `appid` (required): WeChat app ID
- `secret` (required): WeChat app secret
- `markdown` (required): Markdown content
- `style` (optional): CSS theme (default: "sample.css")
- `dashseparator` (optional): Enable section splitting (default: false)
- `thumb_media_id` (optional): Thumbnail media ID

**Example:**
```json
{
  "appid": "wx1234567890abcdef",
  "secret": "your-secret-key",
  "markdown": "# News Title\n\nContent here...\n\n---\n\n## Section 2\n\nMore content...",
  "style": "chinese_news_extracted.css",
  "dashseparator": true,
  "thumb_media_id": "media123"
}
```

### `/wechat/access_token`
Get WeChat access token for manual operations.

**Parameters:**
- `appid` (required): WeChat app ID
- `secret` (required): WeChat app secret

### `/wechat/draft`
Send pre-rendered HTML to WeChat draft box.

**Parameters:**
- `access_token` (required): WeChat access token
- `title` (optional): Article title
- `content` (required): HTML content
- `author` (optional): Author name
- `thumb_media_id` (optional): Thumbnail media ID

## Dash Separator Feature

### What is Dash Separator?
The `dashseparator` feature allows you to split your Markdown content into visually independent sections using `---` as separators.

### How It Works
1. Set `dashseparator: true` in your API request
2. Use `---` in your Markdown to separate sections
3. First section → regular `content-card` styling
4. Subsequent sections → enhanced `section-card` styling

### Example Markdown
```markdown
# Main Article Title

This is the introduction and main content. It will be styled as a regular content card.

Some additional introductory information here.

---

## First Independent Section

This section will have enhanced styling with:
- Special visual borders and shadows
- Gradient headings
- Interactive hover effects
- Custom bullet points

**Important information** will be highlighted with gradients.

---

## Second Independent Section

Another independent section with:

1. Numbered lists with gradient circles
2. Enhanced typography
3. Visual separation from other sections

> Blockquotes will have special styling in section cards.

---

## Final Section

The last independent section with its own distinct visual treatment.

```python
# Code blocks also get enhanced styling
def example_function():
    return "Enhanced section card styling"
```
```

### Visual Results
- **Section 1**: Regular card styling
- **Section 2**: Enhanced section-card with gradients, borders, hover effects
- **Section 3**: Another enhanced section-card, visually separated
- **Section 4**: Final enhanced section-card

## CSS Themes for WeChat

### Recommended Themes

#### For News Content
- **`chinese_news_extracted.css`**: Original news layout, professional
- **`chinese_news_dark.css`**: Dark mode for modern appeal
- **`chinese_news_colorful.css`**: Vibrant for engaging content

#### For Business Content
- **`custom.css`**: Professional with gradients
- **`chinese_news_minimal.css`**: Clean, formal appearance

### Theme Features Comparison

| Theme | Background | Cards | Headings | Best For |
|-------|------------|-------|----------|----------|
| `chinese_news_extracted` | Light gray | White rounded | Gradient | General news |
| `chinese_news_dark` | Dark | Dark cards | Light text | Night reading |
| `chinese_news_colorful` | Gradient | Glass effect | Colorful | Creative content |
| `chinese_news_minimal` | White | Bordered | Left-aligned | Formal docs |

## Error Handling

### Common Errors

#### Invalid Credentials
```json
{
  "errcode": 40013,
  "errmsg": "invalid appid"
}
```
**Solution**: Verify your WeChat AppID and Secret

#### Missing Parameters
```json
{
  "errcode": 400,
  "errmsg": "缺少Markdown内容"
}
```
**Solution**: Ensure all required parameters are provided

#### WeChat API Limits
```json
{
  "errcode": 45009,
  "errmsg": "reach max api daily quota limit"
}
```
**Solution**: Wait for quota reset or upgrade your WeChat plan

## Best Practices

### Content Organization
1. **Use clear headings** for better structure
2. **Split long articles** with `---` separators
3. **Include engaging introductions** in the first section
4. **Use section cards** for different topics or themes

### Styling Tips
1. **Choose themes** based on your audience
2. **Test with actual content** before publishing
3. **Use dashseparator** for multi-topic articles
4. **Consider mobile readers** when selecting themes

### Performance
1. **Keep content reasonable** in length
2. **Optimize images** before including
3. **Test API calls** in development first
4. **Handle errors gracefully** in production

## Integration Examples

### Python Integration
```python
import requests

def send_to_wechat(markdown_content, theme="chinese_news_extracted.css"):
    url = "http://localhost:5002/wechat/send_draft"
    data = {
        "appid": "your-appid",
        "secret": "your-secret",
        "markdown": markdown_content,
        "style": theme,
        "dashseparator": True
    }
    
    response = requests.post(url, json=data)
    return response.json()

# Usage
content = """
# Breaking News

Main story content here...

---

## Analysis Section

Detailed analysis with enhanced styling...
"""

result = send_to_wechat(content)
print(result)
```

### JavaScript Integration
```javascript
async function sendToWeChat(markdownContent, theme = 'chinese_news_extracted.css') {
    const response = await fetch('http://localhost:5002/wechat/send_draft', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            appid: 'your-appid',
            secret: 'your-secret',
            markdown: markdownContent,
            style: theme,
            dashseparator: true
        })
    });
    
    return await response.json();
}

// Usage
const content = `
# Article Title

Main content...

---

## Enhanced Section

Section with special styling...
`;

sendToWeChat(content).then(result => {
    console.log('Success:', result);
}).catch(error => {
    console.error('Error:', error);
});
```

## Security Considerations

1. **Keep credentials secure**: Never expose AppID/Secret in client-side code
2. **Use environment variables**: Store credentials securely
3. **Validate input**: Sanitize Markdown content before processing
4. **Rate limiting**: Implement rate limiting for production use
5. **HTTPS**: Use HTTPS in production environments

## Troubleshooting

### Content Not Appearing Correctly
- Check Markdown syntax
- Verify CSS theme exists
- Test with simple content first

### WeChat API Errors
- Verify credentials are correct
- Check WeChat API documentation for error codes
- Ensure proper permissions are set

### Styling Issues
- Test themes in web interface first
- Check responsive design on mobile
- Verify CSS file exists and is valid

## Support

For additional help:
1. Check the main README.md for general setup
2. Review THEMES_GUIDE.md for styling options
3. Test with the web interface at `http://localhost:5002`
4. Check server logs for detailed error messages