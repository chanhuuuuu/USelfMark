# USelfMark
本地Ollama多模态网页剪藏工具，图文一键智能归档 Notion
✅ 兼容 Windows / Mac 双系统
✅ 100%本地离线运行，网页内容、密钥不上传第三方服务器
✅ 支持 llava(图文识别) / gemma3(纯文本高速总结)
✅ 自动生成多标签 + 完整长摘要写入Notion数据库

## 仓库文件说明
- manifest.json / popup.html / popup.js：Chrome/Edge扩展核心源码
- Windows启动Ollama.bat：Windows一键带跨域启动Ollama服务
- Mac-Ollama环境配置.sh：Mac终端一键配置跨域环境变量
- LICENSE：MIT开源协议，可自由修改、分发商用

# 一、前置依赖（Windows & Mac 通用）
1. 安装 Ollama：https://ollama.com/
2. 拉取对应模型（二选一）
```bash
# 图文识别（推荐，可读取网页截图内图片、图表）
ollama pull llava:latest
# 纯文本快速总结，占用资源更低
ollama pull gemma3:latest
