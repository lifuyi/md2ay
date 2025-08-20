from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import markdown
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes



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


@app.route('/styles/<path:path>')
def send_styles(path):
    return send_from_directory('.', path)


@app.route('/render', methods=['POST'])
def render_markdown():
    data = request.get_json()
    md_content = data.get('md', '')
    style_name = data.get('style', 'default')

    # Convert Markdown to HTML
    html_content = markdown.markdown(
        md_content,
        extensions=[
            'fenced_code',
            'tables',
            'nl2br',
            'pymdownx.superfences',
            'pymdownx.magiclink'
        ],
        extension_configs={
            'pymdownx.superfences': {
                'custom_fences': [
                    {
                        'name': 'mermaid',
                        'class': 'mermaid',
                        'format': lambda source, language, css_class, options, md, **kwargs: f'<div class="{css_class}">{source}</div>'
                    }
                ]
            }
        }
    )

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

    return html_content, 200, {'Content-Type': 'text/html'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=True)