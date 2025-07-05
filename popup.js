document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("extract-and-view");

  btn.addEventListener("click", async () => {
    console.log("⚡ Extract & View Tokens clicked");

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["tokenExtractor.js"]
    }, () => {
      console.log("✅ tokenExtractor.js injected");

      // Slight delay to ensure tokens are saved before opening viewer
      setTimeout(() => {
        chrome.tabs.create({ url: chrome.runtime.getURL("viewer.html") });
      }, 500);
    });
  });
});