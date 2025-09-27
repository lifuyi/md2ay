#!/usr/bin/env python3
"""
CSS主题验证脚本
用于检查CSS文件是否符合标准规范
"""

import os
import re
from pathlib import Path

# 标准类结构
REQUIRED_CLASSES = {
    '.markdown-body',
    '.section-card', 
    '.rich_pages.wxw-img'
}

OPTIONAL_CLASSES = {
    '.hljs'
}

FORBIDDEN_CLASSES = {
    '.header-section',
    '.content-card', 
    '.container'
}

# 必需的HTML元素
REQUIRED_ELEMENTS = {
    'body', 'h1', 'h2', 'h3', 'h4', 'p', 
    'ul', 'ol', 'li', 'strong', 'em', 'a',
    'pre', 'code', 'figure', 'figcaption', 
    'blockquote', 'hr', 'table'
}

def extract_css_selectors(css_content):
    """提取CSS文件中的所有选择器"""
    # 匹配选择器的正则表达式
    selector_pattern = r'^\s*([.#]?[\w.-]+(?:\s*[>+~]\s*[\w.-]+)*)\s*(?:,\s*([.#]?[\w.-]+(?:\s*[>+~]\s*[\w.-]+)*)\s*)*\s*\{'
    
    selectors = set()
    lines = css_content.split('\n')
    
    for line in lines:
        # 跳过注释行
        if line.strip().startswith('/*') or line.strip().startswith('*') or line.strip().startswith('*/'):
            continue
            
        # 匹配选择器
        match = re.search(r'^\s*([^{]+)\s*\{', line)
        if match:
            selector_part = match.group(1).strip()
            # 分割多个选择器（逗号分隔）
            for selector in selector_part.split(','):
                selector = selector.strip()
                if selector:
                    selectors.add(selector)
    
    return selectors

def validate_theme(css_file_path):
    """验证单个CSS主题文件"""
    print(f"\n验证文件: {css_file_path.name}")
    print("=" * 50)
    
    with open(css_file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    selectors = extract_css_selectors(content)
    
    # 提取类选择器
    class_selectors = {s for s in selectors if s.startswith('.')}
    
    # 提取元素选择器
    element_selectors = {s for s in selectors if not s.startswith('.') and not s.startswith('#') and not ' ' in s}
    
    # 检查结果
    issues = []
    warnings = []
    
    # 1. 检查必需的类
    missing_required = REQUIRED_CLASSES - class_selectors
    if missing_required:
        issues.append(f"缺少必需的类: {', '.join(missing_required)}")
    
    # 2. 检查禁用的类
    forbidden_found = FORBIDDEN_CLASSES & class_selectors
    if forbidden_found:
        issues.append(f"使用了禁用的类: {', '.join(forbidden_found)}")
    
    # 3. 检查未知的类
    known_classes = REQUIRED_CLASSES | OPTIONAL_CLASSES | FORBIDDEN_CLASSES
    unknown_classes = class_selectors - known_classes
    if unknown_classes:
        warnings.append(f"发现未知类 (可能需要移除): {', '.join(unknown_classes)}")
    
    # 4. 检查必需的HTML元素
    missing_elements = REQUIRED_ELEMENTS - element_selectors
    if missing_elements:
        warnings.append(f"可能缺少HTML元素样式: {', '.join(missing_elements)}")
    
    # 5. 检查容器宽度
    if '.markdown-body' in content:
        if 'max-width: 677px' not in content:
            issues.append("markdown-body 必须设置 max-width: 677px")
    
    if '.section-card' in content:
        if 'max-width: 677px' not in content:
            issues.append("section-card 必须设置 max-width: 677px")
    
    # 输出结果
    if not issues and not warnings:
        print("✅ 完全符合标准规范！")
        return True
    else:
        if issues:
            print("❌ 发现问题:")
            for issue in issues:
                print(f"  - {issue}")
        
        if warnings:
            print("⚠️  警告:")
            for warning in warnings:
                print(f"  - {warning}")
        
        return len(issues) == 0  # 只有警告时仍算通过

def main():
    """主函数"""
    print("CSS主题标准规范验证器")
    print("=" * 50)
    
    themes_dir = Path('themes')
    if not themes_dir.exists():
        print("❌ themes 目录不存在")
        return
    
    css_files = list(themes_dir.glob('*.css'))
    if not css_files:
        print("❌ 未找到CSS文件")
        return
    
    # 排除模板文件
    css_files = [f for f in css_files if f.name != 'template.css']
    
    print(f"找到 {len(css_files)} 个CSS文件待验证\n")
    
    results = {}
    for css_file in sorted(css_files):
        results[css_file.name] = validate_theme(css_file)
    
    # 总结报告
    print("\n" + "=" * 50)
    print("验证总结报告")
    print("=" * 50)
    
    passed = sum(results.values())
    total = len(results)
    
    print(f"通过: {passed}/{total}")
    
    if passed == total:
        print("🎉 所有主题都符合标准规范！")
    else:
        print("❌ 以下主题需要修复:")
        for filename, passed in results.items():
            if not passed:
                print(f"  - {filename}")
    
    return passed == total

if __name__ == '__main__':
    main()