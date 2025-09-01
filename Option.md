   Option 1: Use /wechat/send_draft (Recommended)
  This endpoint handles the complete process: converts Markdown to HTML and sends to WeChat.

 curl -X POST http://localhost:5002/wechat/send_draft \
   -H "Content-Type: application/json" \
   -d '{
     "appid": "YOUR_APPID",
     "secret": "YOUR_SECRET",
     "markdown": "# Your Title\n\nYour **markdown** content here\n\n- Item 1\n- Item 2",
     "style": "sample.css",
     "thumb_media_id": "MEDIA_ID_IF_ANY"
   }'