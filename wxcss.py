import requests
from bs4 import BeautifulSoup
import cssutils
import os
from urllib.parse import urlparse

def extract_wechat_css(article_url, save_path="extracted_css"):
    """
    提取公众号文章中的CSS样式并保存到文件
    :param article_url: 公众号文章完整链接（需包含http/https）
    :param save_path: CSS文件保存目录，默认当前目录下的extracted_css文件夹
    """
    # 1. 验证URL有效性
    parsed_url = urlparse(article_url)
    if not parsed_url.scheme or not parsed_url.netloc:
        print("❌ 错误：请输入完整的公众号文章链接（如https://mp.weixin.qq.com/s/xxx）")
        return

    # 2. 配置请求头（模拟浏览器，避免被反爬拦截）
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Referer": "https://mp.weixin.qq.com/"
    }

    try:
        # 3. 发送请求获取文章HTML
        print(f"🔍 正在请求文章：{article_url}")
        response = requests.get(article_url, headers=headers, timeout=10)
        response.raise_for_status()  # 若状态码非200，抛出HTTPError
        html_content = response.text

        # 4. 解析HTML提取CSS（分两类：内嵌<style>标签和外部CSS链接）
        soup = BeautifulSoup(html_content, "html.parser")
        all_css = ""

        # 4.1 提取内嵌<style>标签中的CSS
        style_tags = soup.find_all("style")
        if style_tags:
            print(f"📌 找到 {len(style_tags)} 个内嵌<style>标签")
            for tag in style_tags:
                css_content = tag.get_text(strip=True)
                if css_content:
                    # 使用cssutils格式化CSS（去除无效字符，统一格式）
                    parsed_css = cssutils.parseString(css_content)
                    all_css += cssutils.serialize(parsed_css, format="beautify") + "\n\n"

        # 4.2 提取外部CSS链接（部分公众号会引用外部样式文件）
        link_tags = soup.find_all("link", rel="stylesheet", href=True)
        if link_tags:
            print(f"📌 找到 {len(link_tags)} 个外部CSS链接")
            for tag in link_tags:
                css_url = tag["href"]
                # 处理相对路径（补全为完整URL）
                if not css_url.startswith(("http://", "https://")):
                    css_url = parsed_url.scheme + "://" + parsed_url.netloc + css_url

                try:
                    # 请求外部CSS文件
                    css_response = requests.get(css_url, headers=headers, timeout=5)
                    css_response.raise_for_status()
                    # 格式化外部CSS
                    parsed_external_css = cssutils.parseString(css_response.text)
                    all_css += f"/* 外部CSS：{css_url} */\n"
                    all_css += cssutils.serialize(parsed_external_css, format="beautify") + "\n\n"
                except Exception as e:
                    print(f"⚠️ 获取外部CSS失败（{css_url}）：{str(e)}")

        # 5. 处理提取结果
        if not all_css.strip():
            print("❌ 未提取到任何CSS样式，可能原因：")
            print("   1. 文章链接无效或已被删除")
            print("   2. 公众号开启了严格的反爬机制")
            print("   3. 文章无自定义CSS样式")
            return

        # 6. 保存CSS到文件
        # 创建保存目录（若不存在）
        if not os.path.exists(save_path):
            os.makedirs(save_path)
        
        # 生成文件名（用文章标题或链接后缀命名）
        article_title = soup.title.get_text(strip=True) if soup.title else "wechat_article"
        # 过滤非法文件名字符
        valid_title = "".join([c for c in article_title if c not in '/\:*?"<>|'])[:50]  # 限制长度
        css_filename = f"{valid_title}.css"
        css_filepath = os.path.join(save_path, css_filename)

        # 写入文件
        with open(css_filepath, "w", encoding="utf-8") as f:
            f.write(all_css)

        print(f"✅ CSS提取成功！文件保存路径：\n{os.path.abspath(css_filepath)}")

    except requests.exceptions.HTTPError as e:
        print(f"❌ HTTP请求错误：{e}（可能是链接失效或无访问权限）")
    except requests.exceptions.Timeout:
        print("❌ 请求超时：请检查网络连接或稍后重试")
    except Exception as e:
        print(f"❌ 程序运行错误：{str(e)}")

# ------------------- 执行入口 -------------------
if __name__ == "__main__":
    # 1. 输入公众号文章链接（示例：替换为你需要提取的链接）
    wechat_article_url = input("请粘贴公众号文章完整链接：").strip()
    
    # 2. 调用函数提取CSS
    extract_wechat_css(wechat_article_url)