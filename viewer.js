document.addEventListener("DOMContentLoaded", () => {
  console.log("📥 viewer.js loaded");

  chrome.storage.local.get("designTokens", (res) => {
    let tokens = res.designTokens;

    // Fallback dummy data if none found
    if (!tokens) {
      console.warn("⚠️ No tokens found. Injecting dummy data.");
      tokens = {
        colors: ["#3273dc", "#ff0066", "#111111"],
        fontFamilies: ["'Inter', sans-serif", "Arial, sans-serif"],
        fontSizes: { "var-16px": 16, "var-24px": 24 },
        spacings: { "var-8px": 8, "var-16px": 16 },
        radii: { "var-4px": 4, "var-12px": 12 },
        shadows: ["0 2px 4px rgba(0,0,0,0.1)", "0 0 8px rgba(255,0,0,0.2)"]
      };

      chrome.storage.local.set({ designTokens: tokens }, () => {
        console.log("✅ Dummy tokens injected into chrome.storage.local");
      });
    }

    renderTokens(tokens);
    setupDownloadButtons(tokens);
  });
});

function renderTokens(tokens) {
  const container = document.getElementById("viewer");

  function createAccordion(title, contentFn) {
    const acc = document.createElement("button");
    acc.className = "accordion";
    acc.textContent = title;

    const panel = document.createElement("div");
    panel.className = "panel";
    contentFn(panel);

    acc.addEventListener("click", () => {
      acc.classList.toggle("active");
      panel.style.display = panel.style.display === "block" ? "none" : "block";
    });

    container.appendChild(acc);
    container.appendChild(panel);
  }

  function createTokenRow(name, previewStyle, value, extraCSS = {}) {
    const div = document.createElement("div");
    div.className = "token";

    const preview = document.createElement("div");
    preview.className = "preview";
    if (previewStyle) preview.style = previewStyle;

    const val = document.createElement("div");
    val.className = "value";
    val.innerText = name;
    Object.assign(val.style, extraCSS);

    const copy = document.createElement("div");
    copy.className = "copy";
    copy.innerText = "Copy";
    copy.addEventListener("click", () => {
      navigator.clipboard.writeText(value || name);
      copy.innerText = "Copied!";
      setTimeout(() => (copy.innerText = "Copy"), 1000);
    });

    div.appendChild(preview);
    div.appendChild(val);
    div.appendChild(copy);
    return div;
  }

  // 🎨 Colors
  createAccordion(`Colors (${tokens.colors?.length || 0})`, panel => {
    tokens.colors.forEach(color => {
      panel.appendChild(createTokenRow(color, `background: ${color}`, color));
    });
  });

  // 🔤 Font Families
  createAccordion(`Font Families (${tokens.fontFamilies?.length || 0})`, panel => {
    tokens.fontFamilies.forEach(f => {
      panel.appendChild(createTokenRow(f, null, f, { fontFamily: f }));
    });
  });

  // 🔠 Font Sizes
  createAccordion(`Font Sizes (${Object.keys(tokens.fontSizes || {}).length})`, panel => {
    Object.entries(tokens.fontSizes).forEach(([key, val]) => {
      panel.appendChild(createTokenRow(key, null, `${val}px`, { fontSize: `${val}px` }));
    });
  });

  // 📏 Spacing
  createAccordion(`Spacings (${Object.keys(tokens.spacings || {}).length})`, panel => {
    Object.entries(tokens.spacings).forEach(([key, val]) => {
      panel.appendChild(createTokenRow(key, null, `${val}px`));
    });
  });

  // 🟦 Border Radius
  createAccordion(`Border Radii (${Object.keys(tokens.radii || {}).length})`, panel => {
    Object.entries(tokens.radii).forEach(([key, val]) => {
      panel.appendChild(createTokenRow(key, null, `${val}px`, { borderRadius: `${val}px`, border: '1px solid #ccc' }));
    });
  });

  // 🌑 Shadows
  createAccordion(`Shadows (${tokens.shadows?.length || 0})`, panel => {
    tokens.shadows.forEach(shadow => {
      panel.appendChild(createTokenRow(shadow, null, shadow, { boxShadow: shadow }));
    });
  });

  console.log("✅ Finished rendering tokens in viewer");
}

function setupDownloadButtons(tokens) {
  document.getElementById("download-json").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(tokens, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    downloadFile("tokens.json", url);
  });

  document.getElementById("download-css").addEventListener("click", () => {
    let css = `:root {\n`;

    (tokens.colors || []).forEach((c, i) => css += `  --color-${i + 1}: ${c};\n`);
    if (tokens.fontFamilies?.[0]) css += `  --font-body: ${tokens.fontFamilies[0]};\n`;
    if (tokens.fontSizes) Object.entries(tokens.fontSizes).forEach(([k, v]) => css += `  --${k}: ${v}px;\n`);
    if (tokens.spacings) Object.entries(tokens.spacings).forEach(([k, v]) => css += `  --${k}: ${v}px;\n`);
    if (tokens.radii) Object.entries(tokens.radii).forEach(([k, v]) => css += `  --${k}: ${v}px;\n`);
    if (tokens.shadows) tokens.shadows.forEach((s, i) => css += `  --shadow-${i + 1}: ${s};\n`);

    css += `}\n`;

    const blob = new Blob([css], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    downloadFile("tokens.css", url);
  });
}

function downloadFile(filename, url) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}