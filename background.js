// 清洗AI返回文本，提取标准JSON
function extractPureJson(rawText) {
  const matchResult = rawText.match(/\{[\s\S]*?\}/);
  if (!matchResult) {
    throw new Error("无法找到合法JSON内容");
  }
  return matchResult[0];
}

// 接收popup发送的剪藏任务
chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (msg.type === "startClipTask") {
    try {
      const { pageTitle, pageUrl, pageText, base64Img } = msg.data;

      const modelName = "llava:latest";
      const promptContent = `
你是网页内容分析助手。
网页标题：${pageTitle}
网页正文：${pageText}

严格输出规则：
1. 只输出大括号包裹的纯JSON，禁止任何开场白、解释文字、\`\`\`标记
2. tags：1~4个中文标签
3. summary：不少于150字网页核心摘要
JSON结构样例：{"tags":["标签1","标签2"],"summary":"摘要内容"}
      `.trim();

      // 请求Ollama
      const ollamaResp = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelName,
          stream: false,
          messages: [
            {
              role: "user",
              content: promptContent,
              images: [base64Img]
            }
          ]
        })
      });

      if (!ollamaResp.ok) throw new Error("Ollama连接失败，请确认程序已启动");
      const ollamaJson = await ollamaResp.json();
      const aiRawText = ollamaJson.message.content;
      console.log("AI原始返回：", aiRawText);

      const cleanJsonStr = extractPureJson(aiRawText);
      const aiResult = JSON.parse(cleanJsonStr);
      const tagList = aiResult.tags || [];
      const summaryText = aiResult.summary || "";

      // 读取Notion配置
      const storageData = await chrome.storage.local.get(["notionToken", "databaseId"]);
      const { notionToken, databaseId } = storageData;
      if (!notionToken || !databaseId) throw new Error("未配置Notion Token与数据库ID");

      // Notion创建页面
      const notionCreateResp = await fetch("https://api.notion.com/v1/pages", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${notionToken}`,
          "Notion-Version": "2022-06-28",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          parent: { database_id: databaseId },
          properties: {
            "标题": { title: [{ text: { content: pageTitle } }] },
            "链接": { url: pageUrl },
            "分类": { multi_select: tagList.map(name => ({ name })) },
            "摘要": { rich_text: [{ text: { content: summaryText } }] }
          }
        })
      });

      if (!notionCreateResp.ok) {
        const errInfo = await notionCreateResp.json();
        throw new Error(`Notion写入失败：${errInfo.message}`);
      }

      // 弹出系统通知提示成功
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "USelfMark",
        message: "✅ 网页剪藏归档完成！"
      });

      sendResponse({ success: true, msg: "✅ 归档成功！" });
    } catch (err) {
      console.error("后台任务异常", err);
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon48.png",
        title: "USelfMark 任务失败",
        message: "❌ " + err.message
      });
      sendResponse({ success: false, msg: "❌ " + err.message });
    }
    return true; // 异步消息必须返回true
  }
});//
//  background.js
//  USelfMark
//
//  Created by chanhu on 2026/8/13.
//

