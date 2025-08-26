// 配置
        const API_BASE_URL = 'http://localhost:5002';
        
        // 获取DOM元素
        const editor = document.getElementById('editor');
        const preview = document.getElementById('preview');
        const themeSelector = document.getElementById('theme-selector');
        const status = document.getElementById('status');
        const charCount = document.getElementById('char-count');
        const loading = document.getElementById('loading');

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
                
                // 添加到预览区域
                preview.appendChild(iframe);
                
                // 为每个部分创建HTML内容
                let combinedHtml = '';
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
                    <section>
                    <head>
                        <link rel="stylesheet" href="http://localhost:5002/styles/${theme}">
                        <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"><\/script>
                        <script type="text/javascript" id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"><\/script>
                        <style>
                            .section-card {
                                border: 1px solid #eee;
                                border-radius: 8px;
                                padding: 15px;
                                margin-bottom: 20px;
                                background: #fafafa;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="markdown-body">${combinedHtml}</div>
                        <script>
                            mermaid.initialize({ startOnLoad: true });
                            mermaid.run();
                            if (window.MathJax) {
                                window.MathJax.typesetPromise();
                            }
                        <\/script>
                    </body>
                    </section>
                `;

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

当 $a \ne 0$ 时, 方程 $ax^2 + bx + c = 0$ 的解是
$x = {-b \pm \sqrt{b^2-4ac} \over 2a}$

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

            // Use html2canvas on the preview pane
            html2canvas(previewPane, {
                useCORS: true, // To handle cross-origin images if any
            }).then(canvas => {
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

        // 事件监听
        editor.addEventListener('input', debounce(() => {
            updateCharCount();
            renderMarkdown();
        }, 500));

        themeSelector.addEventListener('change', renderMarkdown);
        
        // 为分隔线拆分复选框添加事件监听器
        document.getElementById('split-checkbox').addEventListener('change', renderMarkdown);

        // 初始化
        document.addEventListener('DOMContentLoaded', () => {
            updateStatus('就绪');
            updateCharCount();
            
            // Populate theme selector with options from the server
            fetch(`${API_BASE_URL}/styles`)
                .then(response => response.json())
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
                    updateStatus('Failed to load themes.', true);
                });

            // Check API service
            fetch(`${API_BASE_URL}/health`)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'ok') {
                        updateStatus('API服务已连接');
                    }
                })
                .catch(error => {
                    updateStatus('API服务未连接', true);
                    preview.innerHTML = `
                        <div class="error">
                            <strong>API服务未连接</strong><br>
                            请确保API服务已启动：<br>
                            <code>python api_server.py</code><br><br>
                            <small>错误: ${error.message}</small>
                        </div>
                    `;
                });
        });

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
        });