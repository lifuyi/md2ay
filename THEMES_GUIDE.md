# CSS Themes Guide

This guide provides detailed information about all available CSS themes and their specific features.

## Theme Categories

### 1. Standard Themes

#### `sample.css` - Modern Gradient Theme
- **Style**: Clean, modern with gradient headers
- **Colors**: Blue to purple gradients
- **Best for**: General content, presentations
- **Features**: 
  - Gradient title headers with rounded corners
  - Left-bordered section headers
  - Soft shadows and modern typography

#### `square.css` - Geometric Bold Theme  
- **Style**: Sharp edges, bold geometric design
- **Colors**: Strong contrast colors
- **Best for**: Technical content, bold statements
- **Features**:
  - Square-based design elements
  - Bold color scheme
  - Strong visual hierarchy

#### `yata.css` - Minimalist Theme
- **Style**: Clean, uncluttered design
- **Colors**: Light, subtle color scheme
- **Best for**: Reading-focused content
- **Features**:
  - Focus on content readability
  - Subtle styling elements
  - Clean typography

#### `custom.css` - Professional Modern Theme
- **Style**: Professional with gradient effects
- **Colors**: Blue, purple, pink gradients
- **Best for**: Business content, professional documents
- **Features**:
  - Gradient text effects for emphasis
  - Custom bullet points and numbered lists
  - Interactive hover effects
  - Professional color scheme

### 2. Chinese News Themes (Extracted)

#### `chinese_news_extracted.css` - Original News Layout
- **Style**: Card-based news layout
- **Colors**: Light gray background, white cards
- **Best for**: News articles, blog posts
- **Features**:
  - Card-based sections with rounded corners
  - Clean typography optimized for Chinese content
  - Enhanced section-card styling with visual independence
  - Hover effects and interactive elements

#### `chinese_news_dark.css` - Dark News Theme
- **Style**: Dark mode version of news layout
- **Colors**: Dark backgrounds (#1a1a1a, #2d2d2d)
- **Best for**: Night reading, modern dark interfaces
- **Features**:
  - Dark gray cards with light text
  - Blue accent links and green code highlights
  - Elegant dark color scheme
  - Reduced eye strain for dark environments

#### `chinese_news_colorful.css` - Vibrant News Theme
- **Style**: Colorful with gradients and glass-morphism
- **Colors**: Purple-blue gradients with vibrant accents
- **Best for**: Eye-catching presentations, creative content
- **Features**:
  - Glass-morphism effects with backdrop blur
  - Gradient backgrounds and colorful accents
  - Vibrant bullet points and interactive elements
  - Modern, trendy design aesthetic

#### `chinese_news_minimal.css` - Clean Minimal News
- **Style**: Newspaper-like, minimal design
- **Colors**: Pure white with subtle borders
- **Best for**: Academic papers, formal documents, print-friendly content
- **Features**:
  - No rounded corners, clean lines
  - Left-aligned headings for formal look
  - Larger fonts (16px) for better readability
  - Professional, print-ready styling

## Section Card Feature

### What are Section Cards?
Section cards are enhanced content areas that provide visual independence and special styling. They're activated when using the `dashseparator=true` parameter.

### How to Use Section Cards
1. Add `---` in your Markdown to separate sections
2. Set `dashseparator=true` in your API request
3. Each section after `---` becomes a `section-card`

### Section Card Enhancements
- **Visual Independence**: Strong borders, shadows, and spacing
- **Interactive Effects**: Hover animations with lift and glow
- **Enhanced Typography**: Gradient headings and special text effects
- **Custom Lists**: Colored bullet points and numbered circles
- **Clear Separation**: Dashed separators between cards

### Example Usage

```markdown
# Main Article Title
This content will be in a regular content-card.

---

## First Independent Section
This becomes a section-card with enhanced styling:
- Blue bullet points
- Gradient headings
- Interactive hover effects

---

## Second Independent Section
Another section-card with:
1. Numbered gradient circles
2. Special typography
3. Visual independence
```

## Theme Selection Guide

### For Different Content Types

| Content Type | Recommended Theme | Reason |
|--------------|-------------------|---------|
| News Articles | `chinese_news_extracted.css` | Optimized for news layout |
| Technical Docs | `square.css` or `chinese_news_minimal.css` | Clean, professional |
| Creative Content | `chinese_news_colorful.css` | Vibrant, eye-catching |
| Night Reading | `chinese_news_dark.css` | Reduced eye strain |
| Print Documents | `chinese_news_minimal.css` | Print-friendly |
| Presentations | `custom.css` or `sample.css` | Professional gradients |

### For Different Audiences

| Audience | Recommended Theme | Features |
|----------|-------------------|----------|
| General Public | `chinese_news_extracted.css` | Familiar news layout |
| Developers | `square.css` | Technical, geometric |
| Business | `custom.css` | Professional gradients |
| Academics | `chinese_news_minimal.css` | Clean, formal |
| Creative | `chinese_news_colorful.css` | Vibrant, modern |

## Customization Tips

### Creating Your Own Theme
1. Copy an existing CSS file as a starting point
2. Modify colors, fonts, and spacing to match your brand
3. Test with different content types
4. Ensure responsive design for mobile devices

### Key CSS Classes to Customize
- `.markdown-body` - Main container
- `.section-card` - Enhanced sections (when using dashseparator)
- `.content-card` - Regular content sections
- `h1, h2, h3, h4` - Headings
- `p` - Paragraphs
- `ul, ol, li` - Lists
- `pre, code` - Code blocks

### Responsive Design
All themes include responsive breakpoints:
- Desktop: Full features
- Tablet (768px): Adjusted spacing and fonts
- Mobile (480px): Optimized for small screens

## API Integration

### Using Themes with WeChat
```json
{
  "style": "chinese_news_extracted.css",
  "dashseparator": true
}
```

### Theme Testing
Use the web interface at `http://localhost:5002` to preview themes before using them in production.

## Best Practices

1. **Choose themes based on content type and audience**
2. **Use dashseparator for multi-section articles**
3. **Test themes with your actual content**
4. **Consider mobile users when selecting themes**
5. **Use section cards for better content organization**
6. **Match theme colors to your brand when possible**