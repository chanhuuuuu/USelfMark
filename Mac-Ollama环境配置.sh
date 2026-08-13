#!/bin/zsh
echo "=============================================="
echo "          Mac Ollama跨域一键配置"
echo "=============================================="
echo "正在写入环境变量至 ~/.zshrc"
echo 'export OLLAMA_ORIGINS="chrome-extension://*,http://localhost:*"' >> ~/.zshrc
source ~/.zshrc
echo ""
echo "✅ 配置写入完成！"
echo "操作步骤："
echo "1. 点击顶部菜单栏Ollama图标，选择Quit Ollama完全退出"
echo "2. 重新打开Ollama App即可生效跨域配置"
echo ""
echo "验证配置命令：echo \$OLLAMA_ORIGINS"
