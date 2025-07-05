// === Utility functions ===

function toHex(color) {
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.fillStyle = color;
  return ctx.fillStyle;
}

function toPx(value) {
  const temp = document.createElement("div");
  temp.style.width = value;
  document.body.appendChild(temp);
  const px = window.getComputedStyle(temp).width;
  document.body.removeChild(temp);
  return px;
}

function roundPx(px) {
  return Math.round(parseFloat(px));
}

function cluster(values, tolerance = 2) {
  const sorted = [...new Set(values.map(roundPx))].sort((a, b) => a - b);
  const clusters = {};
  let current = [];

  sorted.forEach(val => {
    if (current.length === 0 || Math.abs(val - current[current.length - 1]) <= tolerance) {
      current.push(val);
    } else {
      const key = current[0];
      clusters[`var-${key}px`] = key;
      current = [val];
    }
  });

  if (current.length > 0) {
    const key = current[0];
    clusters[`var-${key}px`] = key;
  }

  return clusters;
}

// === Color extraction with debugging ===

function extractColorTokens(elements) {
  const colorProps = ['color', 'background-color', 'border-color'];
  const colorSet = new Set();

  elements.forEach(el => {
    const style = getComputedStyle(el);

    colorProps.forEach(prop => {
      const val = style.getPropertyValue(prop);
      if (val && !val.includes('rgba(0, 0, 0, 0)') && val !== 'transparent') {
        try {
          const hex = toHex(val);
          colorSet.add(hex);
        } catch (e) {
          // Ignore color parse errors
        }
      }
    });

    // Match Tailwind/Bootstrap utility-like classes
    const classList = Array.from(el.classList);
    classList.forEach(cls => {
      if (/(primary|secondary|success|danger|warning|info|light|dark)/.test(cls) &&
          /(text|bg|border)/.test(cls)) {
        colorProps.forEach(prop => {
          const val = style.getPropertyValue(prop);
          if (val && val !== 'transparent') {
            try {
              const hex = toHex(val);
              colorSet.add(hex);
            } catch {}
          }
        });
      }
    });
  });

  return Array.from(colorSet);
}

// === Main token extractor ===

function extractTokens() {
  // ✅ Filter only visible body elements (skip <head>, <script>, etc.)
  const elements = Array.from(document.body.querySelectorAll('*')).filter(el => {
    const tag = el.tagName.toLowerCase();
    return !['script', 'style', 'meta', 'link', 'svg', 'path', 'noscript'].includes(tag);
  });

  const styleMap = {
    colors: [],
    fontFamilies: [],
    fontSizes: [],
    fontWeights: [],
    lineHeights: [],
    spacings: [],
    radii: [],
    shadows: []
  };

  elements.forEach(el => {
    const style = getComputedStyle(el);

    // Typography
    styleMap.fontFamilies.push(style.fontFamily);
    styleMap.fontSizes.push(toPx(style.fontSize));
    styleMap.fontWeights.push(style.fontWeight);
    styleMap.lineHeights.push(style.lineHeight);

    // Spacing
    ['margin', 'padding', 'gap', 'row-gap', 'column-gap'].forEach(prop => {
      const val = style.getPropertyValue(prop);
      if (val) styleMap.spacings.push(toPx(val));
    });

    // Borders
    styleMap.radii.push(toPx(style.borderRadius));
    styleMap.shadows.push(style.boxShadow);
  });

  // 🔁 Use improved color extraction
  styleMap.colors = extractColorTokens(elements);

  // === Frequency filtering ===
  const filterByFrequency = (arr) => {
    const freq = {};
    arr.forEach(val => {
      if (!val || val === '0px' || val === 'none') return;
      freq[val] = (freq[val] || 0) + 1;
    });
    return Object.entries(freq)
      .filter(([_, count]) => count >= 1)
      .map(([val]) => val);
  };

  const tokens = {
    colors: [...new Set(filterByFrequency(styleMap.colors))],
    fontFamilies: [...new Set(filterByFrequency(styleMap.fontFamilies))],
    fontSizes: cluster(filterByFrequency(styleMap.fontSizes)),
    fontWeights: [...new Set(filterByFrequency(styleMap.fontWeights))],
    lineHeights: [...new Set(filterByFrequency(styleMap.lineHeights))],
    spacings: cluster(filterByFrequency(styleMap.spacings)),
    radii: cluster(filterByFrequency(styleMap.radii)),
    shadows: [...new Set(filterByFrequency(styleMap.shadows))]
  };

  chrome.storage.local.set({ designTokens: tokens }, () => {
    // Tokens saved to chrome.storage.local
  });

  return tokens;
}

// ✅ Run the extractor
extractTokens();