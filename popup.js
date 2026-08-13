document.addEventListener('DOMContentLoaded', () => {
  const statusDom = document.getElementById('status');
  const clipBtn = document.getElementById('clipBtn');

  function setStatus(text) {
    statusDom.textContent = text;
    statusDom.style.display = "block";
  }

  clipBtn.addEventListener('click', async () => {
    try {
      setStatus("正在收集页面信息……");
      clipBtn.disabled = true;

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const pageUrl = tab.url;
      const pageTitle = tab.title;

      // 提取页面文本
      const injectResult = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.body.innerText.slice(0, 3000)
      });
      const pageText = injectResult[0].result;

      // 页面截图
      const screenshotDataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: "jpeg" });
      const base64Img = screenshotDataUrl.replace("data:image/jpeg;base64,", "");

      setStatus("任务已提交后台！可以关闭弹窗、切换网页，任务持续运行");

      // 发送任务给后台脚本执行
      const resp = await chrome.runtime.sendMessage({
        type: "startClipTask",
        data: { pageTitle, pageUrl, pageText, base64Img }
      });

      setStatus(resp.msg);
    } catch (err) {
      console.error(err);
      setStatus("❌ " + err.message);
    } finally {
      clipBtn.disabled = false;
    }
  });
});
