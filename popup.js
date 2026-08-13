const statusDiv = document.getElementById('status');

// 清洗AI返回文本，剥离markdown ```json 标记
function cleanJsonString(rawText) {
    let text = rawText.trim();
    text = text.replace(/^```(json)?\s*/i, '');
    text = text.replace(/\s*```$/, '');
    return text.trim();
}

// 状态显示封装
function showStatus(msg) {
    statusDiv.style.display = 'block';
    statusDiv.innerText = msg;
}

// 配置按钮切换
document.getElementById('configBtn').addEventListener('click', async () => {
    document.getElementById('main-ui').classList.add('hidden');
    document.getElementById('config-ui').classList.remove('hidden');
    const res = await chrome.storage.local.get(['modelName', 'notionToken', 'notionDb']);
    document.getElementById('modelName').value = res.modelName || 'llava:latest';
    document.getElementById('notionToken').value = res.notionToken || '';
    document.getElementById('notionDb').value = res.notionDb || '';
});

// 返回保存按钮
document.getElementById('backBtn').addEventListener('click', async () => {
    const modelName = document.getElementById('modelName').value.trim();
    const notionToken = document.getElementById('notionToken').value.trim();
    const notionDb = document.getElementById('notionDb').value.trim();
    await chrome.storage.local.set({ modelName, notionToken, notionDb });
    showStatus("✅配置已保存");
    document.getElementById('main-ui').classList.remove('hidden');
    document.getElementById('config-ui').classList.add('hidden');
});

// 归档主逻辑
document.getElementById('saveBtn').addEventListener('click', async () => {
    try {
        showStatus("1.正在读取配置...");
        const config = await chrome.storage.local.get(['modelName', 'notionToken', 'notionDb']);
        const {modelName, notionToken, notionDb} = config;
        if (!notionToken || !notionDb) {
            showStatus("❌请先打开设置填写Notion Token和数据库ID");
            return;
        }
        const model = modelName || 'llava:latest';
        showStatus("2.抓取网页文字...");
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) throw new Error("未获取当前标签页");
        const scriptResult = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => ({
                title: document.title,
                url: window.location.href,
                text: document.body.innerText.substring(0, 3000)
            })
        });
        const pageData = scriptResult[0].result;
        // 尝试截图，失败自动降级纯文本
        let screenshotBase64 = null;
        try {
            const rawScreenshot = await chrome.tabs.captureVisibleTab(tab.windowId, {
                format: "jpeg",
                quality: 80
            });
            // 去掉 data:image/jpeg;base64, 前缀，只保留纯base64
            screenshotBase64 = rawScreenshot.split(',')[1];
            showStatus("3.成功获取截图，多模态解析图文...");
        } catch (e) {
            console.warn("截图捕获失败，切换纯文本模式", e);
            showStatus("3.截图获取失败，仅根据文字进行总结");
        }
        const prompt = `严格规则：
1. 仅输出纯净JSON，禁止任何解释文字、禁止使用\`\`\`代码块；
2. ${screenshotBase64 ? "结合网页文字 + 截图内图片、图表完整分析；" : "仅根据网页文字内容分析；"}
3. tags生成1~4个精准中文标签；
4. summary需要完整、详尽梳理全文核心内容，保证信息完整，字数不少于150字；
输出样例：{"tags":["人工智能","数据分析"],"summary":"完整详细的全文图文总结..."}
网页标题：${pageData.title}
网页正文文字：${pageData.text}`;
        // Ollama原生多模态格式
        const message = {
            role: "user",
            content: prompt
        };
        if (screenshotBase64) {
            message.images = [screenshotBase64];
        }
        const ollamaRes = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model,
                messages: [message],
                stream: false
            })
        });
        if (!ollamaRes.ok) {
            const errText = await ollamaRes.text();
            throw new Error(`Ollama返回状态码${ollamaRes.status}：${errText}`);
        }
        const aiData = await ollamaRes.json();
        const pureJson = cleanJsonString(aiData.message.content.trim());
        const aiResult = JSON.parse(pureJson);
        showStatus(`4.生成标签：${aiResult.tags.join("、")}，正在写入Notion`);
        const notionResp = await fetch(`https://api.notion.com/v1/pages`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${notionToken}`,
                "Content-Type": "application/json",
                "Notion-Version": "2022-06-28"
            },
            body: JSON.stringify({
                parent: { database_id: notionDb },
                properties: {
                    "标题": { title: [{ text: { content: pageData.title } }] },
                    "分类": { multi_select: aiResult.tags.map(name => ({ name })) },
                    "摘要": { rich_text: [{ text: { content: aiResult.summary } }] },
                    "链接": { url: pageData.url }
                }
            })
        });
        if (notionResp.ok) {
            showStatus("🎉图文完整归档成功！");
        } else {
            const errInfo = await notionResp.text();
            throw new Error(`Notion写入失败：${errInfo}`);
        }
    } catch (err) {
        console.error('全局捕获异常：', err);
        showStatus("❌" + err.message);
    }
});
