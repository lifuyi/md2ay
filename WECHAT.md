# WeChat Integration Guide

This application includes integration with WeChat Official Accounts, allowing you to send formatted Markdown content directly to your WeChat drafts.

## Prerequisites

1. A WeChat Official Account (Subscription Account or Service Account)
2. AppID and AppSecret from the WeChat Official Platform
3. (Optional) Media ID for a thumbnail image

## Configuration

### Getting Your AppID and AppSecret

1. Log in to the [WeChat Official Platform](https://mp.weixin.qq.com/)
2. Navigate to "Settings and Development" > "Basic Configuration"
3. Your AppID will be displayed
4. Click "Reset" or "View" to get your AppSecret (note: this will be shown only once, so save it securely)

### Configuring in the Application

1. Open the web interface
2. Click the "Send to WeChat Draft" button
3. Select "Configure WeChat Information"
4. Enter your AppID and AppSecret
5. (Optional) Enter a Media ID for a thumbnail image
6. Click OK to save

The configuration is stored in your browser's local storage and will persist between sessions.

## Usage

### Sending Content to WeChat

1. Write or paste your Markdown content in the editor
2. Select your desired theme
3. Preview the content to ensure it looks correct
4. Click the "Send to WeChat Draft" button
5. If configured correctly, your content will be sent to your WeChat Official Account drafts

### How It Works

1. The application uses your AppID and AppSecret to obtain an access token from WeChat
2. Your Markdown content is converted to HTML with the selected theme
3. The HTML content is sent to WeChat's draft API
4. WeChat returns a media ID for the draft, which is displayed in the confirmation message

## Thumbnail Images

To add a thumbnail image to your articles:

1. Upload an image to WeChat through their media management API or platform
2. Obtain the media ID for the uploaded image
3. Enter this media ID in the WeChat configuration dialog
4. All subsequent articles will use this thumbnail

## Troubleshooting

### Common Issues

1. **"Missing AppID" or "Missing AppSecret" errors**
   - Ensure both fields are filled in the configuration dialog
   - Check that there are no extra spaces before or after the credentials

2. **"Invalid AppID" errors**
   - Verify that your AppID is correct
   - Ensure your WeChat Official Account is active and in good standing

3. **"API call failed" errors**
   - Check your internet connection
   - Verify that your server can reach WeChat's API endpoints
   - Ensure your AppID and AppSecret are correct

4. **Content not appearing in drafts**
   - Check your WeChat Official Account drafts section
   - Verify that the content was sent successfully by checking the confirmation message

### WeChat API Limitations

1. Access tokens expire after 7200 seconds (2 hours)
2. There are rate limits on API calls
3. Drafts are automatically deleted after 3 days
4. Some HTML elements may not be supported in WeChat articles

## Security Considerations

1. Your AppSecret is stored in your browser's local storage
2. For production use, consider the security implications of storing credentials in the browser
3. The application does not send your credentials to any third-party servers
4. All API calls are made directly from your browser to WeChat's servers

## API Endpoints Used

1. `https://api.weixin.qq.com/cgi-bin/token` - For obtaining access tokens
2. `https://api.weixin.qq.com/cgi-bin/draft/add` - For adding drafts

For more information about these APIs, refer to the [WeChat Official Platform Documentation](https://developers.weixin.qq.com/doc/offiaccount/en/Getting_Started/Overview.html).