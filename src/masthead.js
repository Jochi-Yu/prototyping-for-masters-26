export const mastheadMarkup = ({ home = "#top", current } = {}) => `
  <header class="masthead">
    <a class="wordmark" href="${home}" aria-label="Prototyping for Masters home">Fall / 2026</a>
    <p class="eyebrow">DSG-5465-A · Elizabeth Lin</p>
    <a class="masthead-link" href="/playground/"${current === "playground" ? ' aria-current="page"' : ""}>Playground</a>
    <button class="palette-button" type="button" aria-label="Change color palette">
      <span class="palette-dot" aria-hidden="true"></span>
    </button>
  </header>
`;
