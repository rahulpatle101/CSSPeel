function classifyProperty(prop) {
  if (prop.includes("color")) return "Colors";
  if (["font-size", "font-family", "font-weight", "line-height"].includes(prop)) return "Typography";
  if (["margin", "padding"].some(p => prop.startsWith(p))) return "Spacing";
  if (["width", "height", "max-width", "min-height"].includes(prop)) return "Sizes";
  if (["border", "border-radius"].some(p => prop.startsWith(p))) return "Borders";
  return "Misc";
}

function extractAndGroupStyles(rules) {
  const categories = {
    Colors: [],
    Typography: [],
    Spacing: [],
    Sizes: [],
    Borders: [],
    Misc: []
  };

  for (let rule of rules) {
    if (!rule.style) continue;
    for (let prop of rule.style) {
      const value = rule.style.getPropertyValue(prop).trim();
      const className = `${prop.replace(/[^a-z0-9]/gi, '-')}-${value.replace(/[^a-z0-9]/gi, '-')}`;
      const declaration = `${prop}: ${value};`;
      const category = classifyProperty(prop);

      if (!categories[category].some(item => item.class === className)) {
        categories[category].push({ class: className, declaration });
      }
    }
  }

  // Store in chrome.storage
  chrome.storage.local.set({ extractedStyles: categories }, () => {
    console.log("✅ Styles saved to chrome.storage.local", categories);
  });

  return categories;
}

(function extractAndExportStyles() {
  try {
    const rules = Array.from(document.styleSheets)
      .filter(sheet => {
        try {
          return sheet.cssRules;
        } catch (e) {
          console.warn("Skipped stylesheet due to CORS:", sheet.href);
          return false;
        }
      })
      .flatMap(sheet => Array.from(sheet.cssRules));

    console.log("Extracted CSS rules:", rules.length);
    const grouped = extractAndGroupStyles(rules);

    // Download .css
    let cssContent = '';
    for (let group in grouped) {
      cssContent += `/* ${group} */\n`;
      grouped[group].forEach(({ class: cls, declaration }) => {
        cssContent += `.${cls} {\n  ${declaration}\n}\n\n`;
      });
    }

    const blob = new Blob([cssContent], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "atomic-styles.css";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (err) {
    console.error("Error extracting styles:", err);
  }
})();