export const palettes = [
  { name: "White on black", foreground: "#ffffff", background: "#000000" },
  { name: "Blue on butter", foreground: "#1735c7", background: "#f4ef8a" },
  { name: "Forest on peach", foreground: "#174331", background: "#ffb19e" },
  { name: "Aubergine on pink", foreground: "#38104d", background: "#ff8fc8" },
  { name: "Plum on acid", foreground: "#641045", background: "#d1ff6a" },
  { name: "Rust on sky", foreground: "#9e321b", background: "#bfe4ff" },
];

export const applyPalette = (index, { button, favicon } = {}) => {
  const palette = palettes[((index % palettes.length) + palettes.length) % palettes.length];
  const root = document.documentElement;
  root.style.setProperty("--ink", palette.foreground);
  root.style.setProperty("--paper", palette.background);
  if (favicon) {
    const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="${palette.background}"/></svg>`;
    favicon.href = `data:image/svg+xml,${encodeURIComponent(faviconSvg)}`;
  }
  if (button) button.setAttribute("title", palette.name);
  return palette;
};

export const nextPaletteIndex = (index) => (index + 1) % palettes.length;
