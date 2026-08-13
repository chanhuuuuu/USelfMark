@echo off
chcp 65001
echo ==============================================
echo          Ollama 跨域服务启动脚本
echo  启动后保持窗口打开，关闭则AI服务停止
echo ==============================================
echo.
echo 正在配置跨域环境变量...
set OLLAMA_ORIGINS=chrome-extension://*,http://localhost:*
echo 正在启动 ollama serve
echo.
ollama serve
echo.
echo 服务已终止，按任意键关闭窗口
pause
