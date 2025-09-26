// 配置
        // Use the same host as the frontend is served from
        const API_BASE_URL = window.location.hostname ? 
            `http://${window.location.hostname}:5002` : 
            'http://localhost:5002';
        
        // 获取DOM元素
        const editor = document.getElementById('editor');
        const preview = document.getElementById('preview');
        const themeSelector = document.getElementById('theme-selector');
        const status = document.getElementById('status');
        const charCount = document.getElementById('char-count');
        const loading = document.getElementById('loading');
        const clearEditorBtn = document.getElementById('clear-editor');
        const themeOptions = document.querySelectorAll('.theme-option');
        const settingsPane = document.getElementById('settings-pane');
        const settingsToggle = document.getElementById('settings-toggle');
        const settingsClose = document.getElementById('settings-close');
        
        // Custom CSS Editor Elements
        const editCustomCSSBtn = document.getElementById('edit-custom-css');
        const cssFloatingPanel = document.getElementById('css-floating-panel');
        const closeCssPanel = document.getElementById('close-css-panel');
        const cancelCssEdit = document.getElementById('cancel-css-edit');
        const saveCssEdit = document.getElementById('save-css-edit');
        const cssExampleBtn = document.getElementById('css-example-btn');
        const customCssEditor = document.getElementById('custom-css-editor');

        // 防抖函数
        let debounceTimer;
        function debounce(func, delay) {
            return function(...args) {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => func.apply(this, args), delay);
            };
        }

        // 显示加载状态
        function showLoading() {
            loading.classList.add('active');
        }

        // 隐藏加载状态
        function hideLoading() {
            loading.classList.remove('active');
        }

        // 更新状态
        function updateStatus(message, isError = false) {
            status.textContent = message;
            status.style.color = isError ? '#c33' : '#666';
        }

        // 更新字符计数
        function updateCharCount() {
            const count = editor.value.length;
            charCount.textContent = `${count} 字符`;
        }

        // 分割Markdown文本为卡片
        function splitMarkdownIntoCards(markdown) {
            // 如果复选框未选中，则不进行分割
            const splitCheckbox = document.getElementById('split-checkbox');
            if (!splitCheckbox || !splitCheckbox.checked) {
                return [markdown];
            }

            // 使用正则表达式分割文本，保留分隔符
            const sections = markdown.split(/^---$/gm);
            
            // 过滤掉空的部分，并去除每部分的前后空白
            return sections
                .map(section => section.trim())
                .filter(section => section.length > 0);
        }

        // 渲染Markdown
        async function renderMarkdown() {
            const markdown = editor.value.trim();
            const theme = themeSelector.value;

            if (!markdown) {
                preview.innerHTML = `
                    <div style="text-align: center; color: #999; margin-top: 50px;">
                        <i class="fas fa-arrow-left" style="font-size: 48px; margin-bottom: 20px; opacity: 0.3;"></i>
                        <p>在左侧编辑器输入内容，右侧将实时预览</p>
                    </div>
                `;
                return;
            }

            showLoading();
            updateStatus('渲染中...');

            try {
                // 分割Markdown文本为卡片
                const sections = splitMarkdownIntoCards(markdown);
                
                // 清空预览区域
                preview.innerHTML = '';
                
                // 创建单个iframe用于渲染所有部分
                const iframe = document.createElement('iframe');
                iframe.style.width = '100%';
                iframe.style.border = 'none';
                iframe.style.background = 'white';
                iframe.style.borderRadius = '4px';
                // Configure iframe sandbox for MathJax to work properly
                // Both allow-scripts and allow-same-origin are needed for MathJax
                // This creates a security warning but is necessary for math rendering
                iframe.sandbox = 'allow-scripts allow-same-origin';
                
                // 添加到预览区域
                preview.appendChild(iframe);
                
                // 为每个部分创建HTML内容
                let combinedHtml = '';
                // 获取CSS内容
                let cssContent = '';
                try {
                    // Add cache-busting parameter to force fresh CSS load
                    const cacheBuster = Date.now();
                    const cssResponse = await fetch(`${API_BASE_URL}/themes/${theme}?v=${cacheBuster}`);
                    if (cssResponse.ok) {
                        cssContent = await cssResponse.text();
                    } else {
                        console.warn(`Failed to load CSS: ${cssResponse.status} ${cssResponse.statusText}`);
                        // Try alternative path
                        const altCssResponse = await fetch(`${API_BASE_URL}/${theme}?v=${cacheBuster}`);
                        if (altCssResponse.ok) {
                            cssContent = await altCssResponse.text();
                        }
                    }
                } catch (cssError) {
                    console.warn('Failed to load CSS:', cssError);
                    // Provide a minimal fallback CSS
                    cssContent = `
                        .markdown-body {
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                            background-color: white;
                            padding: 20px;
                            border-radius: 8px;
                        }
                        body {
                            margin: 0;
                            padding: 20px;
                        }
                    `;
                }
                
                for (let i = 0; i < sections.length; i++) {
                    const sectionMarkdown = sections[i];
                    
                    // 发送请求渲染该部分
                    const response = await fetch(`${API_BASE_URL}/render`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            md: sectionMarkdown,
                            style: theme
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }

                    const html = await response.text();
                    
                    // 为每个部分添加分隔线和section-card样式
                    combinedHtml += `<div class="section-card">${html}</div>`;
                    
                    // 如果不是最后一部分，添加分隔线
                    if (i < sections.length - 1) {
                        combinedHtml += '<hr style="margin: 20px 0; border: 1px solid #eee;">';
                    }
                }
                
                const fullHtml = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>${cssContent}</style>
                        <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
                        <script>
                            window.MathJax = {
                                tex: {
                                    inlineMath: [['$', '$'], ['\\(', '\\)']],
                                    displayMath: [['$$', '$$'], ['\\[', '\\]']]
                                },
                                chtml: {
                                    fontURL: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2'
                                }
                            };
                        </script>
                        <script type="text/javascript" id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
                    </head>
                    <body>
                        <div class="markdown-body">${combinedHtml}</div>
                        <script>
                            mermaid.initialize({ startOnLoad: true });
                            mermaid.run();
                            
                            // Prevent multiple typesetting operations
                            let isTypesetting = false;
                            
                            // Wait for MathJax to load and then process all equations ONCE
                            function waitForMathJaxAndTypeset() {
                                if (window.MathJax && window.MathJax.typesetPromise && !isTypesetting) {
                                    isTypesetting = true;
                                    MathJax.typesetPromise().then(() => {
                                        console.log('MathJax initial typesetting complete');
                                        isTypesetting = false;
                                    }).catch(err => {
                                        console.error('MathJax typesetting error:', err);
                                        isTypesetting = false;
                                    });
                                } else if (!window.MathJax || !window.MathJax.typesetPromise) {
                                    // If MathJax isn't ready yet, wait and try again
                                    setTimeout(waitForMathJaxAndTypeset, 100);
                                }
                            }
                            waitForMathJaxAndTypeset();
                        </script>
                    </body>
                    </html>
                `;

                // 清除之前的iframe内容以防止嵌套
                preview.innerHTML = '';
                preview.appendChild(iframe);
                
                iframe.srcdoc = fullHtml;

                iframe.onload = () => {
                    try {
                        const body = iframe.contentDocument.body;
                        const height = Math.max(body.scrollHeight, body.offsetHeight, 200) + 20;
                        iframe.style.height = height + 'px';
                    } catch (e) {
                        console.log('高度调整失败:', e);
                        iframe.style.height = '300px';
                    }
                }
                
                updateStatus('渲染完成');
            } catch (error) {
                console.error('渲染失败:', error);
                preview.innerHTML = `
                    <div class="error">
                        <strong>渲染失败</strong><br>
                        ${error.message}<br><br>
                        <small>请确保API服务已启动：python api_server.py</small>
                    </div>
                `;
                updateStatus('渲染失败', true);
            } finally {
                hideLoading();
            }
        }

        // 加载示例内容
        function loadSample() {
            const sampleMarkdown = `# 测试文档 - 完整功能演示

## 标题层级测试

### 三级标题示例

#### 四级标题示例

##### 五级标题示例

###### 六级标题示例

## 文本格式测试

这是**加粗文字**的效果，这是*斜体文字*的效果，这是~~删除线文字~~的效果。

### 组合效果
**加粗和*斜体*的组合**，以及~~删除线和**加粗**的组合~~

## 列表测试

### 无序列表
- 第一级项目1
- 第一级项目2
  - 第二级项目1
  - 第二级项目2
    - 第三级项目1
    - 第三级项目2
- 第一级项目3

### 有序列表
1. 第一步操作
2. 第二步操作
   1. 子步骤1
   2. 子步骤2
3. 第三步操作

### 任务列表
- [x] 已完成的任务
- [ ] 待完成的任务1
- [ ] 待完成的任务2

## 代码测试

### 行内

const result = calculateSum(5, 3);
console.log(result);


## Mermaid图表测试


  

## 表格测试

### 基础表格
| 姓名 | 年龄 | 城市 | 职业 |
|------|------|------|------|
| 张三 | 25   | 北京 | 工程师 |
| 李四 | 30   | 上海 | 设计师 |
| 王五 | 28   | 广州 | 产品经理 |

### 对齐表格
| 左对齐 | 居中对齐 | 右对齐 |
|:-------|:--------:|-------:|
| 文本1  | 文本2    | 文本3  |
| 数据1  | 数据2    | 数据3  |

## 引用测试

### 单行引用
> 这是一个简单的引用。

### 多行引用
> 这是一个较长的引用，
> 可以跨越多行显示。
> 
> 支持**格式**和*样式*的引用。

### 嵌套引用
> 外层引用
> > 内层引用
> > 可以继续嵌套
> 回到外层

## 链接和图片测试

### 普通链接
[百度一下](https://www.baidu.com)

### 带标题的链接
[GitHub](https://github.com "全球最大的代码托管平台")

### 自动链接
https://www.example.com

## 分割线测试

---

## 特殊元素测试

### Emoji支持
🎉 🚀 💡 📊 ✨

### 数学公式测试

当 $a \\ne 0$ 时, 方程 $ax^2 + bx + c = 0$ 的解是
$x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}$

### 特殊符号
© ® ™ → ← ↑ ↓ ↔ ↕

### 数学符号
± × ÷ ≤ ≥ ≠ ∞ ∑ ∏ √ ∛ ∛
`;

            editor.value = sampleMarkdown;
            updateCharCount();
            renderMarkdown();
        }

        // 下载HTML
        function downloadHTML() {
            const markdown = editor.value.trim();
            const theme = themeSelector.value;

            if (!markdown) {
                alert('请先输入Markdown内容');
                return;
            }

            fetch(`${API_BASE_URL}/render`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    md: markdown,
                    style: theme
                })
            })
            .then(response => response.text())
            .then(html => {
                const blob = new Blob([html], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `markdown-${theme.replace('.css', '')}-${Date.now()}.html`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            })
            .catch(error => {
                alert('下载失败: ' + error.message);
            });
        }

        // 下载PNG
        function downloadPNG() {
            const previewPane = document.getElementById('preview');
            const theme = themeSelector.value;

            if (!previewPane.innerHTML) {
                alert('请先渲染内容');
                return;
            }

            showLoading();
            updateStatus('正在生成PNG...');

            // Check if we have an iframe in the preview
            const iframe = previewPane.querySelector('iframe');
            
            if (iframe && iframe.contentDocument) {
                // Radical approach: Freeze MathJax state for PNG capture
                const waitForMathJax = async () => {
                    const iframeWindow = iframe.contentWindow;
                    const iframeDoc = iframe.contentDocument;
                    
                    updateStatus('准备PNG导出，冻结数学公式状态...');
                    
                    // Step 1: Disable MathJax completely to prevent any further rendering
                    if (iframeWindow.MathJax) {
                        // Backup the original MathJax object
                        iframeWindow._originalMathJax = iframeWindow.MathJax;
                        // Disable MathJax typesetting
                        iframeWindow.MathJax = {
                            typesetPromise: () => Promise.resolve(),
                            typeset: () => {},
                            typesetClear: () => {}
                        };
                    }
                    
                    // Step 2: Clean up the DOM aggressively - remove ALL duplicates
                    const allMathElements = iframeDoc.querySelectorAll('mjx-container');
                    console.log(`Found ${allMathElements.length} total math elements`);
                    
                    // Track unique equations by their actual content
                    const uniqueEquations = new Set();
                    const keepElements = [];
                    const removeElements = [];
                    
                    allMathElements.forEach((el, index) => {
                        const content = el.textContent?.trim() || '';
                        const rect = el.getBoundingClientRect();
                        
                        // Create a signature based on content and rough position
                        const signature = `${content}_${Math.round(rect.top/30)*30}`;
                        
                        if (uniqueEquations.has(signature)) {
                            removeElements.push({el, index, content: content.substring(0, 30)});
                        } else {
                            uniqueEquations.add(signature);
                            keepElements.push({el, index, content: content.substring(0, 30)});
                        }
                    });
                    
                    console.log(`Keeping ${keepElements.length} unique equations, removing ${removeElements.length} duplicates`);
                    
                    // Remove all duplicates
                    removeElements.forEach(item => {
                        console.log(`Removing duplicate: ${item.content}...`);
                        item.el.remove();
                    });
                    
                    // Style the remaining elements properly
                    keepElements.forEach(item => {
                        const el = item.el;
                        const rect = el.getBoundingClientRect();
                        
                        // Reset to clean state
                        el.style.visibility = 'visible';
                        el.style.opacity = '1';
                        el.style.position = 'static';
                        el.style.transform = 'none';
                        
                        // Determine if display math
                        const isDisplay = el.getAttribute('display') === 'true' || 
                                         rect.width > iframeDoc.body.clientWidth * 0.4;
                        
                        if (isDisplay) {
                            el.style.display = 'block';
                            el.style.margin = '1em auto';
                            el.style.textAlign = 'center';
                        } else {
                            el.style.display = 'inline-block';
                        }
                    });
                    
                    updateStatus('数学公式清理完成，开始PNG生成...');
                    return new Promise(resolve => setTimeout(resolve, 500));
                };
                
                waitForMathJax().then(() => {
                    // If we have an iframe, capture its content directly
                    html2canvas(iframe.contentDocument.body, {
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    scale: 2,
                    logging: false,
                    ignoreElements: function(element) {
                        // Only ignore clearly hidden elements
                        return element.style.visibility === 'hidden' || 
                               element.style.display === 'none';
                    },
                    onclone: function(clonedDoc) {
                        // Minimal clone processing - just ensure visibility, no deduplication
                        console.log('Minimal MathJax clone processing...');
                        
                        // Remove only clearly legacy elements
                        const legacyElements = clonedDoc.querySelectorAll('.MathJax, .MathJax_Display');
                        legacyElements.forEach(el => el.remove());
                        
                        // Just ensure all math containers are visible - NO deduplication
                        const mathContainers = clonedDoc.querySelectorAll('mjx-container');
                        mathContainers.forEach(container => {
                            // Only fix visibility issues
                            container.style.visibility = 'visible';
                            container.style.opacity = '1';
                            
                            // Don't modify display properties - keep as-is from original cleanup
                        });
                        
                        console.log(`Clone processing complete. Made ${mathContainers.length} containers visible.`);
                    }
                }).then(canvas => {
                    // Check if canvas is valid and has content
                    const context = canvas.getContext('2d');
                    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;
                    
                    // Check if all pixels are transparent/white (indicating blank image)
                    let isBlank = true;
                    for (let i = 0; i < data.length; i += 4) {
                        // Check if pixel is not white/transparent
                        if (data[i] !== 255 || data[i+1] !== 255 || data[i+2] !== 255 || data[i+3] !== 255) {
                            isBlank = false;
                            break;
                        }
                    }
                    
                    if (isBlank) {
                        throw new Error('生成的图片为空白，请确保内容已正确渲染');
                    }
                    
                    const a = document.createElement('a');
                    a.href = canvas.toDataURL('image/png');
                    a.download = `markdown-${theme.replace('.css', '')}-${Date.now()}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    hideLoading();
                    updateStatus('PNG生成完成');
                    }).catch(error => {
                        console.error('PNG生成失败:', error);
                        alert('PNG生成失败: ' + error.message);
                        hideLoading();
                        updateStatus('PNG生成失败', true);
                    });
                }).catch(error => {
                    console.error('MathJax等待失败:', error);
                    alert('数学公式渲染失败: ' + error.message);
                    hideLoading();
                    updateStatus('PNG生成失败', true);
                }).finally(() => {
                    // Restore original MathJax after PNG generation
                    const iframeWindow = iframe.contentWindow;
                    if (iframeWindow._originalMathJax) {
                        iframeWindow.MathJax = iframeWindow._originalMathJax;
                        delete iframeWindow._originalMathJax;
                        console.log('MathJax functionality restored');
                    }
                });
            } else {
                // Fallback to capturing the entire preview pane
                html2canvas(previewPane, {
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    scale: 2,
                    logging: false,
                    onclone: function(clonedDoc) {
                        // Clean up duplicate MathJax elements in fallback clone
                        const mathElements = clonedDoc.querySelectorAll('mjx-container');
                        const processedPositions = new Set();
                        
                        mathElements.forEach((el, index) => {
                            const position = `${el.offsetTop}-${el.offsetLeft}-${el.offsetWidth}-${el.offsetHeight}`;
                            
                            if (processedPositions.has(position)) {
                                el.remove();
                            } else {
                                processedPositions.add(position);
                                el.style.visibility = 'visible';
                                el.style.display = 'inline-block';
                            }
                        });
                    }
                }).then(canvas => {
                    // Check if canvas is valid and has content
                    const context = canvas.getContext('2d');
                    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                    const data = imageData.data;
                    
                    // Check if all pixels are transparent/white (indicating blank image)
                    let isBlank = true;
                    for (let i = 0; i < data.length; i += 4) {
                        // Check if pixel is not white/transparent
                        if (data[i] !== 255 || data[i+1] !== 255 || data[i+2] !== 255 || data[i+3] !== 255) {
                            isBlank = false;
                            break;
                        }
                    }
                    
                    if (isBlank) {
                        throw new Error('生成的图片为空白，请确保内容已正确渲染');
                    }
                    
                    const a = document.createElement('a');
                    a.href = canvas.toDataURL('image/png');
                    a.download = `markdown-${theme.replace('.css', '')}-${Date.now()}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    hideLoading();
                    updateStatus('PNG生成完成');
                }).catch(error => {
                    console.error('PNG生成失败:', error);
                    alert('PNG生成失败: ' + error.message);
                    hideLoading();
                    updateStatus('PNG生成失败', true);
                });
            }
        }

        // 将Markdown转换为纯文本
        function markdownToText(markdown) {
            // 移除Markdown语法，只保留纯文本内容
            return markdown
                // 移除代码块
                .replace(/```[\s\S]*?```/g, '')
                // 移除行内代码
                .replace(/`[^`]*`/g, '')
                // 移除链接，保留链接文本
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                // 移除图片
                .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
                // 移除标题标记
                .replace(/^#+\s*/gm, '')
                // 移除粗体和斜体标记
                .replace(/\*\*([^*]+)\*\*/g, '$1')
                .replace(/\*([^*]+)\*/g, '$1')
                .replace(/__([^_]+)__/g, '$1')
                .replace(/_([^_]+)_/g, '$1')
                // 移除删除线
                .replace(/~~([^~]+)~~/g, '$1')
                // 移除引用标记
                .replace(/^>\s*/gm, '')
                // 移除列表标记
                .replace(/^[\d-]\.\s*/gm, '')
                // 移除水平线
                .replace(/^[-*]{3,}$/gm, '')
                // 移除多余的空行（保留最多两个连续的换行符）
                .replace(/\n{3,}/g, '\n\n')
                // 去除首尾空格
                .trim();
        }

        // 下载MD（原始Markdown）
        function downloadMD() {
            const markdown = editor.value.trim();
            const theme = themeSelector.value;

            if (!markdown) {
                alert('请先输入Markdown内容');
                return;
            }

            const blob = new Blob([markdown], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `markdown-${theme.replace('.css', '')}-${Date.now()}.md`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // 下载TXT（纯文本）
        function downloadTXT() {
            const markdown = editor.value.trim();
            const theme = themeSelector.value;

            if (!markdown) {
                alert('请先输入Markdown内容');
                return;
            }

            // 将Markdown转换为纯文本
            const plainText = markdownToText(markdown);
            
            const blob = new Blob([plainText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `markdown-${theme.replace('.css', '')}-${Date.now()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // 复制渲染后的HTML到剪贴板
        function copyToClipboard() {
            // 获取预览区域的内容
            const previewPane = document.getElementById('preview');
            
            if (!previewPane.innerHTML || previewPane.innerHTML.trim() === '') {
                alert('请先渲染内容');
                return;
            }

            showLoading();
            updateStatus('正在复制到剪贴板...');

            try {
                // 检查是否有iframe内容
                const iframe = previewPane.querySelector('iframe');
                
                if (iframe && iframe.contentDocument) {
                    // 获取iframe中的HTML内容
                    const iframeDoc = iframe.contentDocument;
                    const content = iframeDoc.querySelector('.markdown-body') || iframeDoc.body;
                    
                    if (content) {
                        // 获取完整的HTML内容
                        const htmlContent = content.innerHTML;
                        
                        // 创建临时div来处理HTML内容
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = htmlContent;
                        
                        // 复制HTML到剪贴板
                        copyHTMLToClipboard(tempDiv.innerHTML);
                    } else {
                        throw new Error('无法获取内容');
                    }
                } else {
                    // 如果没有iframe，直接复制预览区域的内容
                    copyHTMLToClipboard(previewPane.innerHTML);
                }
            } catch (error) {
                console.error('复制失败:', error);
                alert('复制失败: ' + error.message);
                hideLoading();
                updateStatus('复制失败', true);
            }
        }

        // 将HTML内容复制到剪贴板
        function copyHTMLToClipboard(htmlContent) {
            // 创建临时div来处理HTML内容
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;
            
            // 移除可能的script标签以确保安全
            const scripts = tempDiv.querySelectorAll('script');
            scripts.forEach(script => script.remove());
            
            // 获取清理后的HTML内容
            const cleanHTML = tempDiv.innerHTML;
            
            // 使用Clipboard API复制HTML内容
            if (navigator.clipboard && window.ClipboardItem) {
                // 现代浏览器支持Clipboard API
                const blob = new Blob([cleanHTML], { type: 'text/html' });
                const data = [new ClipboardItem({ 'text/html': blob })];
                
                navigator.clipboard.write(data)
                    .then(() => {
                        hideLoading();
                        updateStatus('已复制到剪贴板');
                        alert('已复制到剪贴板');
                    })
                    .catch(err => {
                        console.error('Clipboard API 失败:', err);
                        // 降级到传统方法
                        fallbackCopyTextToClipboard(cleanHTML);
                    });
            } else {
                // 降级到传统方法
                fallbackCopyTextToClipboard(cleanHTML);
            }
        }

        // 降级复制方法
        function fallbackCopyTextToClipboard(text) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            
            // 避免滚动到底部
            textArea.style.top = '0';
            textArea.style.left = '0';
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    hideLoading();
                    updateStatus('已复制到剪贴板');
                    alert('已复制到剪贴板');
                } else {
                    throw new Error('复制命令失败');
                }
            } catch (err) {
                console.error('复制失败:', err);
                alert('复制失败: ' + err.message);
                hideLoading();
                updateStatus('复制失败', true);
            }
            
            document.body.removeChild(textArea);
        }

        // 事件监听
        editor.addEventListener('input', debounce(() => {
            updateCharCount();
            renderMarkdown();
        }, 500));

        themeSelector.addEventListener('change', renderMarkdown);
        
        // 为分隔线拆分复选框添加事件监听器
        document.getElementById('split-checkbox').addEventListener('change', renderMarkdown);
        
        // 为清空编辑器按钮添加事件监听器
        if (clearEditorBtn) {
            clearEditorBtn.addEventListener('click', clearEditor);
        }
        
        // 为主题选项添加事件监听器
        themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                // 移除所有选项的active类
                themeOptions.forEach(opt => opt.classList.remove('active'));
                // 为当前选项添加active类
                option.classList.add('active');
                
                // 获取选中的主题
                const selectedTheme = option.getAttribute('data-theme');
                
                // 更新主题选择器的值
                themeSelector.value = selectedTheme;
                
                // 根据选中的主题更新渲染
                // 添加延迟以确保CSS文件更新完成
                setTimeout(() => {
                    renderMarkdown();
                }, 50);
            });
        });
        
        // 确保在页面加载时正确设置活动主题选项
        function updateActiveThemeOption() {
            const currentTheme = themeSelector.value;
            themeOptions.forEach(option => {
                option.classList.remove('active');
                if (option.getAttribute('data-theme') === currentTheme) {
                    option.classList.add('active');
                }
            });
        }
        
        // 监听主题选择器变化
        themeSelector.addEventListener('change', updateActiveThemeOption);
        
        // Custom CSS Editor Event Listeners
        if (editCustomCSSBtn) {
            editCustomCSSBtn.addEventListener('click', openCustomCSSEditor);
        }
        
        if (closeCssPanel) {
            closeCssPanel.addEventListener('click', closeCustomCSSEditor);
        }
        
        if (cancelCssEdit) {
            cancelCssEdit.addEventListener('click', closeCustomCSSEditor);
        }
        
        if (saveCssEdit) {
            saveCssEdit.addEventListener('click', saveCustomCSS);
        }
        
        if (cssExampleBtn) {
            cssExampleBtn.addEventListener('click', loadCSSExample);
        }
        
        // 为设置抽屉添加事件监听器
        if (settingsToggle) {
            settingsToggle.addEventListener('click', () => {
                settingsPane.classList.toggle('visible');
                // 更新按钮文本
                if (settingsPane.classList.contains('visible')) {
                    settingsToggle.innerHTML = '<i class="fas fa-times"></i> 关闭设置';
                    // 三列布局
                    document.querySelector('.container').classList.remove('two-column');
                } else {
                    settingsToggle.innerHTML = '<i class="fas fa-cog"></i> 设置面板';
                    // 两列布局
                    document.querySelector('.container').classList.add('two-column');
                }
                // 保存状态到localStorage
                localStorage.setItem('settingsPaneVisible', settingsPane.classList.contains('visible'));
            });
        }
        
        if (settingsClose) {
            settingsClose.addEventListener('click', () => {
                settingsPane.classList.remove('visible');
                // 恢复按钮文本
                if (settingsToggle) {
                    settingsToggle.innerHTML = '<i class="fas fa-cog"></i> 设置面板';
                }
                // 两列布局
                document.querySelector('.container').classList.add('two-column');
                // 保存状态到localStorage
                localStorage.setItem('settingsPaneVisible', false);
            });
        }
        
        // 页面加载时恢复设置面板状态
        document.addEventListener('DOMContentLoaded', () => {
            // Always start with the settings panel collapsed
            // 两列布局
            document.querySelector('.container').classList.add('two-column');
            // Ensure settings pane is hidden
            settingsPane.classList.remove('visible');
            
            // Reset button text to default
            if (settingsToggle) {
                settingsToggle.innerHTML = '<i class="fas fa-cog"></i> 设置面板';
            }
        });

        // 初始化
        document.addEventListener('DOMContentLoaded', () => {
            updateStatus('就绪');
            updateCharCount();
            
            // 检查微信配置
            checkWeChatConfig();
            
            // Populate theme selector with options from the server
            const cacheBuster = Date.now();
            fetch(`${API_BASE_URL}/styles?v=${cacheBuster}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(styles => {
                    styles.forEach(style => {
                        const option = document.createElement('option');
                        option.value = style;
                        option.textContent = style.replace('.css', ''); // Display name without .css
                        themeSelector.appendChild(option);
                    });
                    // After populating, render the initial markdown if any
                    renderMarkdown();
                })
                .catch(error => {
                    console.error('Failed to load styles:', error);
                    // Add default options if API fails
                    const defaultStyles = ['sample.css', 'square.css', 'yata.css'];
                    defaultStyles.forEach(style => {
                        const option = document.createElement('option');
                        option.value = style;
                        option.textContent = style.replace('.css', '');
                        themeSelector.appendChild(option);
                    });
                    updateStatus('使用默认主题', false);
                    renderMarkdown();
                });

            // Check API service
            fetch(`${API_BASE_URL}/health`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.status === 'ok') {
                        updateStatus('API服务已连接');
                    }
                })
                .catch(error => {
                    console.error('Health check failed:', error);
                    updateStatus('API服务状态未知', false);
                    // Don't show error message immediately, let user try to use the app
                });
        });

        // 发送到微信草稿箱
        function sendToWeChatDraft() {
            const markdown = editor.value.trim();
            const theme = themeSelector.value;

            if (!markdown) {
                alert('请先输入Markdown内容');
                return;
            }

            // 获取微信配置
            const appId = localStorage.getItem('wechat_app_id') || '';
            const appSecret = localStorage.getItem('wechat_app_secret') || '';
            const thumbMediaId = localStorage.getItem('wechat_thumb_media_id') || '';
            
            // 调试信息
            console.log('当前微信配置:');
            console.log('AppID:', appId);
            console.log('AppSecret:', appSecret);
            console.log('ThumbMediaId:', thumbMediaId);
            
            if (!appId || !appSecret || appId.trim() === '' || appSecret.trim() === '') {
                console.log('微信配置不完整，中断执行');
                alert('请先配置微信信息（AppID和AppSecret）');
                return;
            }
            
            console.log('微信配置验证通过，继续执行');

            showLoading();
            updateStatus('正在发送到微信草稿箱...');

            // 调试信息
            console.log('Sending request to send draft');
            console.log('AppID:', appId);
            console.log('AppSecret:', appSecret);
            console.log('Theme:', theme);
            console.log('ThumbMediaId:', thumbMediaId);
            
            const requestData = {
                appid: appId,
                secret: appSecret,
                markdown: markdown,
                style: theme,
                thumb_media_id: thumbMediaId
            };
            
            console.log('Request data:', JSON.stringify(requestData));
            
            // 直接发送到新的后端接口
            fetch(`${API_BASE_URL}/wechat/send_draft`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            })
            .then(response => {
                console.log('Received response from server:', response);
                if (!response.ok) {
                    console.log('Response not ok:', response.status, response.statusText);
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                hideLoading();
                if (data.errcode === 0) {
                    updateStatus('已成功发送到微信草稿箱');
                    alert('已成功发送到微信草稿箱\n草稿ID: ' + data.media_id);
                } else {
                    updateStatus('发送失败', true);
                    // 如果errorMsg包含Unicode转义序列，尝试解码
                    let errorMsg = data.errmsg;
                    try {
                        // 尝试解析可能包含Unicode转义序列的字符串
                        errorMsg = JSON.parse('"' + data.errmsg.replace(/"/g, '\\"') + '"');
                    } catch (e) {
                        // 如果解析失败，保持原始错误信息
                        errorMsg = data.errmsg;
                    }
                    alert('发送到微信草稿箱失败: ' + errorMsg);
                }
            })
            .catch(error => {
                hideLoading();
                updateStatus('发送失败', true);
                console.log('Final error caught:', error);
                alert('发送到微信草稿箱失败: ' + error.message);
            });
        }

        // 检查微信配置
        function checkWeChatConfig() {
            const appId = localStorage.getItem('wechat_app_id');
            const appSecret = localStorage.getItem('wechat_app_secret');
            const thumbMediaId = localStorage.getItem('wechat_thumb_media_id');
            
            // Only log WeChat config in development mode
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log('微信配置检查:');
                console.log('AppID:', appId);
                console.log('AppSecret:', appSecret ? '***' + appSecret.slice(-4) : null);
                console.log('ThumbMediaId:', thumbMediaId);
            }
            
            if (appId && appSecret) {
                console.log('微信配置完整');
                return true;
            } else {
                console.log('微信配置不完整');
                return false;
            }
        }

        // 配置微信信息
        function configureWeChat() {
            const appId = localStorage.getItem('wechat_app_id') || '';
            const appSecret = localStorage.getItem('wechat_app_secret') || '';
            const thumbMediaId = localStorage.getItem('wechat_thumb_media_id') || '';
            
            const newAppId = prompt('请输入微信公众号AppID:', appId);
            if (newAppId === null) return; // 用户取消了输入
            
            const newAppSecret = prompt('请输入微信公众号AppSecret:', appSecret);
            if (newAppSecret === null) return; // 用户取消了输入
            
            const newThumbMediaId = prompt('请输入缩略图Media ID (可选):', thumbMediaId);
            
            // 只要用户输入了有效的AppID和AppSecret就保存
            if (newAppId.trim() !== '' && newAppSecret.trim() !== '') {
                localStorage.setItem('wechat_app_id', newAppId.trim());
                localStorage.setItem('wechat_app_secret', newAppSecret.trim());
                if (newThumbMediaId !== null) {
                    if (newThumbMediaId.trim() !== '') {
                        localStorage.setItem('wechat_thumb_media_id', newThumbMediaId.trim());
                    } else {
                        localStorage.removeItem('wechat_thumb_media_id');
                    }
                }
                alert('微信配置已保存');
                // 调试信息
                checkWeChatConfig();
            } 
            // 如果用户清空了输入，则清除配置
            else if (newAppId.trim() === '' && newAppSecret.trim() === '') {
                localStorage.removeItem('wechat_app_id');
                localStorage.removeItem('wechat_app_secret');
                localStorage.removeItem('wechat_thumb_media_id');
                alert('已清除微信配置');
            }
            // 如果只输入了一个字段，给出提示但不保存
            else {
                alert('请同时输入AppID和AppSecret');
            }
        }

        // 清空编辑器内容
        function clearEditor() {
            editor.value = '';
            updateCharCount();
            renderMarkdown();
        }
        
        // Custom CSS Editor Functions
        function openCustomCSSEditor() {
            // Load current custom CSS content
            fetch(`${API_BASE_URL}/themes/custom.css`)
                .then(response => {
                    if (response.ok) {
                        return response.text();
                    } else {
                        // If file doesn't exist, start with empty content
                        return '';
                    }
                })
                .then(cssContent => {
                    customCssEditor.value = cssContent;
                    cssFloatingPanel.style.display = 'flex';
                    // Focus the editor and move cursor to end
                    customCssEditor.focus();
                    customCssEditor.selectionStart = customCssEditor.value.length;
                })
                .catch(error => {
                    console.error('Error loading custom CSS:', error);
                    customCssEditor.value = '';
                    cssFloatingPanel.style.display = 'flex';
                    // Focus the editor even if there's an error
                    customCssEditor.focus();
                });
        }
        
        function closeCustomCSSEditor() {
            cssFloatingPanel.style.display = 'none';
        }
        
        function saveCustomCSS() {
            const cssContent = customCssEditor.value;
            
            // Save CSS content to server
            fetch(`${API_BASE_URL}/themes/custom.css`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/css',
                },
                body: cssContent
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'success') {
                    closeCustomCSSEditor();
                    // Update theme selector to use custom.css
                    themeSelector.value = 'custom.css';
                    // Update active theme option
                    themeOptions.forEach(opt => opt.classList.remove('active'));
                    const customThemeOption = document.querySelector('.theme-option[data-theme="custom.css"]');
                    if (customThemeOption) {
                        customThemeOption.classList.add('active');
                    }
                    // Add a small delay to ensure file is written before re-rendering
                    setTimeout(() => {
                        // Re-render preview to apply new CSS
                        renderMarkdown();
                    }, 100);
                } else {
                    throw new Error(data.message || '保存失败');
                }
            })
            .catch(error => {
                console.error('Error saving custom CSS:', error);
                alert('保存自定义CSS失败: ' + error.message);
            });
        }
        
        // Load CSS example into editor
        function loadCSSExample() {
            const cssExample = `/* 自定义CSS示例 */
.markdown-body {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h1, h2, h3 {
    color: #2c3e50;
    border-bottom: 2px solid #3498db;
    padding-bottom: 5px;
}

blockquote {
    background: #e8f4f8;
    border-left: 4px solid #3498db;
    padding: 10px 20px;
    margin: 10px 0;
    border-radius: 0 4px 4px 0;
}

code {
    background: #eee;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Consolas', monospace;
}

pre {
    background: #2c3e50;
    color: #fff;
    padding: 15px;
    border-radius: 5px;
    overflow-x: auto;
}`;
            
            if (confirm('确定要加载CSS示例吗？这将覆盖当前编辑的内容。')) {
                customCssEditor.value = cssExample;
            }
        }

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        downloadHTML();
                        break;
                    case 'Enter':
                        e.preventDefault();
                        renderMarkdown();
                        break;
                }
            }
            
            // Ctrl+Shift+Backspace 清空编辑器
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'Backspace') {
                e.preventDefault();
                clearEditor();
            }
        });