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

# USelfMark 浏览器兼容说明
## 一、完全原生兼容（无需修改源码，直接加载）
所有**Chromium内核浏览器**共用同一套 `manifest.json`，安装步骤和Chrome完全一致：
1. Microsoft Edge（Windows/Mac主流）
2. Brave
3. Opera / Opera GX
4. Vivaldi
5. 国内360极速、QQ浏览器、搜狗高速浏览器（极速模式）

### 通用安装步骤（Edge/Opera/Brave通用）
1. 打开扩展管理页面
   - Edge：`edge://extensions/`
   - Brave：`brave://extensions/`
   - Opera：`opera://extensions/`
2. 开启「开发者模式」
3. 点击「加载已解压的扩展程序」，选中解压后的 `USelfMark` 文件夹
4. 完成安装，操作逻辑和Chrome无任何区别

## 二、不直接兼容，需要改造的浏览器
### 1. Firefox（火狐）
- 差异：API命名、manifest规则、权限声明有区别，当前源码**不能直接加载**
- 如需适配：需要单独制作 `manifest-firefox.json`，替换 `chrome.*` API为 `browser.*`，调整跨域权限写法

### 2. Safari（苹果自带浏览器）
- 差异：打包格式、权限、跨域策略完全独立，必须用Xcode转换扩展包，原生不支持直接加载文件夹
- 短期不推荐适配，使用Edge/Chrome更省事

## 三、移动端浏览器
手机Chrome、Safari、Edge移动端**均不支持本地加载扩展**，USelfMark只能在电脑端桌面浏览器使用。

## 四、补充到安装教程的兼容提示（复制到你的MD文档）
> ⚙️ 浏览器兼容说明
> 1. 推荐：Chrome / Microsoft Edge（Windows & Mac 完美适配，开箱即用）
> 2. 兼容：Brave、Opera、360极速、QQ浏览器极速模式，安装流程和Chrome完全相同
> 3. 暂不支持直接加载：Firefox、Safari（需单独适配源码）
> 4. 移动端浏览器全部不支持扩展，仅电脑桌面端可用

## 五、国内浏览器小提示
国内双核浏览器（360、QQ、搜狗）必须切换到**Chromium极速内核**，兼容模式（IE内核）无法加载任何Chrome扩展。
