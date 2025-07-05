document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("extract-and-view");

  // Create loader element
  const loader = document.createElement("div");
  loader.id = "extract-loader";
  loader.style.display = "none";
  loader.style.textAlign = "center";
  loader.innerHTML = `<svg width='32' height='32' viewBox='0 0 50 50'><circle cx='25' cy='25' r='20' fill='none' stroke='#3273dc' stroke-width='5' stroke-linecap='round' stroke-dasharray='31.415, 31.415' transform='rotate(0 25 25)'><animateTransform attributeName='transform' type='rotate' from='0 25 25' to='360 25 25' dur='1s' repeatCount='indefinite'/></circle></svg>`;
  btn.parentNode.insertBefore(loader, btn.nextSibling);

  btn.addEventListener("click", async () => {
    loader.style.display = "block";
    btn.disabled = true;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["tokenExtractor.js"]
    }, () => {
      setTimeout(() => {
        // Open viewer in sidepanel
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            if (document.getElementById('csspeel-sidepanel')) return;
            const panel = document.createElement('iframe');
            panel.id = 'csspeel-sidepanel';
            panel.src = chrome.runtime.getURL('viewer.html');
            panel.style.position = 'fixed';
            panel.style.top = '0';
            panel.style.right = '0';
            panel.style.width = '420px';
            panel.style.height = '100vh';
            panel.style.zIndex = '999999';
            panel.style.border = 'none';
            panel.style.boxShadow = '-2px 0 8px rgba(0,0,0,0.08)';
            document.body.appendChild(panel);
          }
        });
        loader.style.display = "none";
        btn.disabled = false;
      }, 800);
    });
  });
});