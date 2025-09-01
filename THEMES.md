# CSS Themes Documentation

This application includes several CSS themes that can be applied to your Markdown content to change its appearance. Each theme provides a different visual style for your formatted content.

## Available Themes

### sample.css
A clean, modern theme with gradient headers and a light background. Features:
- Gradient title headers with rounded corners
- Left-bordered section headers with gradient borders
- Soft shadows and rounded containers
- Responsive design for mobile devices

### square.css
A geometric theme with sharp edges and bold colors. Features:
- Square-based design elements
- Bold color scheme
- Strong visual hierarchy
- Clean typography

### yata.css
Yet Another Theme Attempt - A minimalist theme focused on readability. Features:
- Clean, uncluttered design
- Focus on content readability
- Subtle styling elements
- Light color scheme

### test.css
A testing theme with experimental styles. Features:
- Various experimental CSS features
- Used for testing new design concepts
- May contain unfinished or unstable styles

## Using Themes

Themes can be selected in the web interface using the theme dropdown menu. The selected theme will be applied to the preview and any downloaded content.

## Customizing Themes

To customize a theme:
1. Copy one of the existing CSS files to create a new theme
2. Modify the CSS rules to change colors, fonts, spacing, etc.
3. Save the file with a `.css` extension in the application directory
4. The new theme will automatically appear in the theme selector

## Creating New Themes

When creating new themes, consider the following:
1. Maintain the core structure classes (`.markdown-body`, `.section-card`, etc.)
2. Use responsive design principles
3. Ensure good contrast for readability
4. Test on both desktop and mobile devices

## CSS Classes Reference

### Core Classes
- `.markdown-body`: The main container for the content
- `.section-card`: Individual sections when using the split feature
- `h1`, `h2`, `h3`, `h4`: Header elements with specific styling
- `p`: Paragraph elements
- `ul`, `ol`: List elements
- `pre`, `code`: Code block elements
- `hr`: Horizontal rules
- `img.rich_pages`: Image elements

### Responsive Design
All themes should include a media query for mobile devices:
```css
@media (max-width: 768px) {
    /* Mobile-specific styles */
}
```