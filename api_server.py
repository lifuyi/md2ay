from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import markdown
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rendered Markdown</title>
    <style>
        {custom_css}
    </style>
</head>
<body>
    <div class="markdown-body">
        {html_content}
    </div>
</body>
</html>
"""

@app.route('/')
def index():
    return send_from_directory('.', 'frontend.html')

@app.route('/<path:path>')
def send_static(path):
    return send_from_directory('.', path)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'}), 200

@app.route('/styles')
def get_styles():
    styles = [f for f in os.listdir('.') if f.endswith('.css')]
    return jsonify(styles)


@app.route('/render', methods=['POST'])
def render_markdown():
    data = request.get_json()
    md_content = data.get('md', '')
    style_name = data.get('style', 'default')

    # Convert Markdown to HTML
    html_content = markdown.markdown(md_content, extensions=[
        'fenced_code',
        'tables',
        'nl2br',
        'pymdownx.superfences'
    ])

    # Load the selected stylesheet
    custom_css = ''
    try:
        # Security: Ensure style_name is a valid filename and doesn't contain path traversal characters.
        if '..' not in style_name and style_name.endswith('.css'):
            with open(style_name, 'r', encoding='utf-8') as f:
                custom_css = f.read()
    except FileNotFoundError:
        # Handle case where style file doesn't exist
        pass

    # Combine with HTML template
    final_html = HTML_TEMPLATE.format(custom_css=custom_css, html_content=html_content)

    return final_html, 200, {'Content-Type': 'text/html'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)