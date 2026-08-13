# USelfMark
本地Ollama多模态网页总结工具，图文一键智能归档 Notion
- 兼容 Windows / Mac 双系
- 100%本地离线运行，网页内容、密钥不上传第三方服务器
- 支持 llava(图文识别) / gemma3(纯文本高速总结)
- 自动生成多标签 + 完整长摘要写入Notion数据库

## 仓库文件说明
- manifest.json / popup.html / popup.js：Chrome/Edge扩展核心源码
- Windows启动Ollama.bat：Windows一键带跨域启动Ollama服务
- Mac-Ollama环境配置.sh：Mac终端一键配置跨域环境变量
- LICENSE：MIT开源协议，可自由修改、分发商用

# 前置依赖（Windows & Mac 通用）
1. 安装 Ollama：https://ollama.com/
2. 在Ollama里拉取对应模型（二选一）
```bash
# 图文识别（推荐，可读取网页截图内图片、图表）
ollama pull llava:latest
# 纯文本快速总结，占用资源更低
ollama pull gemma3:latest
```
3. 安装Notion: https://www.notion.com/zh-cn
4. 在Notion中新建一个表格，分别设置名为“标题”“选择”“摘要”“链接”的四列，且这四列类型分别为文本、多选、文本、链接
5. 在Notion中获取API和表格ID：
```
API获取路径:主页-连接-新链接-访问令牌
表格ID：新建表格页面右上角三点点开-开发者-拷贝数据库ID
```
