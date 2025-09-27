# CSS主题标准规范

## 概述
本文档定义了所有CSS主题文件必须遵循的标准类结构，以确保主题之间的一致性和互换性。

## 标准类结构

所有CSS主题文件必须包含以下四个核心类，不得使用其他自定义类名：

### 1. `.markdown-body`
- **用途**: 主容器，定义整体布局和基础样式
- **必需属性**:
  - `margin: 0 auto`
  - `max-width: 677px`
  - `background-color`
  - `border-radius`
  - `padding`

### 2. `.section-card`
- **用途**: 内容区域容器，承载主要内容
- **必需属性**:
  - `max-width: 677px`
  - `margin: 0 auto`
  - `padding: 16px`
  - `background`
  - `font-family`
  - `color`
  - `line-height`
  - `font-size`
  - `border-radius`

### 3. `.hljs` (可选)
- **用途**: 代码高亮容器
- **用于**: 语法高亮的代码块
- **如不需要代码高亮可省略**

### 4. `.rich_pages.wxw-img`
- **用途**: 富媒体图片样式
- **必需属性**:
  - `max-width: 100%`
  - `border-radius: 8px`
  - `margin: 1.5em auto`
  - `display: block`

## 标准HTML元素样式

每个主题还必须为以下HTML元素提供样式：

### 基础元素
- `body` - 页面基础样式
- `h1, h2, h3, h4` - 标题层级
- `p` - 段落
- `ul, ol, li` - 列表
- `strong, em` - 强调文本
- `a` - 链接

### 代码相关
- `pre` - 代码块容器
- `code` - 内联代码

### 其他元素
- `figure, figcaption` - 图片容器
- `blockquote` - 引用块
- `hr` - 分割线
- `table, thead, tbody, th, td` - 表格

## 禁用的类名

以下类名已废弃，不得在新主题中使用：
- `.header-section` ❌
- `.content-card` ❌ (使用 `.section-card` 替代)
- `.container` ❌ (使用 `.section-card` 替代)
- 任何其他自定义类名 ❌

## 主题开发指南

### 1. 创建新主题
```css
/* 主题名称和描述注释 */

/* Body样式 */
body {
  /* 基础页面样式 */
}

.markdown-body {
  /* 主容器样式 */
}

.section-card {
  /* 内容区域样式 */
}

/* HTML元素样式 */
h1 { /* 主标题 */ }
h2 { /* 二级标题 */ }
/* ... 其他元素 */

.rich_pages.wxw-img {
  /* 图片样式 */
}
```

### 2. 样式自定义原则
- ✅ **可以自定义**: 颜色、字体、间距、边框、阴影、背景等视觉效果
- ✅ **保持结构**: 必须使用标准类名
- ✅ **保持功能**: 确保基本布局和响应式特性正常工作
- ❌ **不可添加**: 新的类选择器或ID选择器

### 3. 质量检查清单
在发布新主题前，请确认：
- [ ] 只使用了标准的四个类名
- [ ] 包含所有必需的HTML元素样式
- [ ] 主容器最大宽度为677px
- [ ] 响应式设计正常工作
- [ ] 与现有主题架构兼容

## 示例参考

标准实现可参考 `themes/yata.css`，这是所有主题的基准架构。

## 维护说明

- 此标准一旦确定，不得随意更改
- 所有现有主题已按此标准统一调整
- 新增主题必须严格遵循此规范
- 如需修改标准，需要同步更新所有现有主题

---
*最后更新: $(date '+%Y年%m月%d日')*
*版本: 1.0*