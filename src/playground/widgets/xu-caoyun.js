const defaults = { radius: 24, padding: 24, gap: 12, heading: 26, accent: '#c4ed84' };

export default {
  student: 'Caoyun Xu',
  title: 'A little focus',
  width: 350,
  height: 580,
  mount(root) {
    root.innerHTML = `
      <style>
        .focus { --accent: ${defaults.accent}; --radius: 24px; --padding: 24px; --gap: 12px; --heading: 26px; margin: 12px; padding: var(--padding); border-radius: var(--radius); background: #202a25; color: #f6f4e9; font: 13px/1.5 'IBM Plex Mono', monospace; }
        h2 { margin: 0; font: var(--heading)/1.2 'Faculty Glyphic', Georgia, serif; }
        .eyebrow { margin: 0 0 10px; color: var(--accent); font-size: 10px; letter-spacing: .15em; }
        .intro { margin: 8px 0 20px; color: #c6cec5; font-size: 11px; }
        .modes, .actions { display: flex; gap: var(--gap); }
        button { min-height: 40px; padding: 8px 12px; border: 1px solid #59665d; border-radius: 100px; background: transparent; color: inherit; font: inherit; cursor: pointer; }
        button:focus-visible, input:focus-visible, summary:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }
        .modes button { flex: 1; font-size: 11px; }
        .modes [aria-pressed=true] { background: var(--accent); color: #202a25; border-color: var(--accent); }
        .dial { display: grid; place-content: center; text-align: center; margin: 20px auto; width: 186px; height: 186px; border-radius: 50%; background: radial-gradient(closest-side, #202a25 91%, transparent 92%), conic-gradient(var(--accent) var(--progress, 0%), #455249 0); }
        .time { font-size: 42px; font-variant-numeric: tabular-nums; letter-spacing: -.06em; }
        .status { color: #c6cec5; font-size: 10px; }
        .actions button { flex: 1; }
        .start { background: var(--accent); color: #202a25; border-color: var(--accent); }
        .footnote { margin: 14px 0 0; font-size: 10px; color: #c6cec5; text-align: center; }
        details { margin-top: 16px; border-top: 1px solid #59665d; padding-top: 12px; font-size: 11px; }
        summary { cursor: pointer; }
        label { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 8px; }
        input { width: 110px; accent-color: var(--accent); }
        .copy { margin-top: 12px; width: 100%; }
        .values { width: 100%; margin-top: 8px; background: #202a25; color: #f6f4e9; }
      </style>
      <section class="focus" aria-label="Focus timer">
        <p class="eyebrow">ONE THING AT A TIME</p>
        <h2>A little focus.</h2>
        <p class="intro">Make room for your next good idea.</p>
        <div class="modes" role="group" aria-label="Timer mode">
          <button data-minutes="25" aria-pressed="true">Focus · 25m</button>
          <button data-minutes="5" aria-pressed="false">Break · 5m</button>
        </div>
        <div class="dial"><span class="time" role="timer" aria-label="Time remaining">25:00</span><span class="status" role="status">Ready when you are</span></div>
        <div class="actions"><button class="start">Start</button><button class="reset">Reset</button></div>
        <p class="footnote">A small pause. A fresh perspective.</p>
      </section>`;
    root.addEventListener('wheel', event => event.stopPropagation(), { passive: true });
    const card = root.querySelector('.focus');
    const time = root.querySelector('.time');
    const status = root.querySelector('.status');
    const start = root.querySelector('.start');
    let duration = 25 * 60;
    let remaining = duration;
    let deadline = 0;
    let interval;
    const stop = () => { clearInterval(interval); interval = undefined; start.textContent = 'Start'; };
    const render = () => {
      time.textContent = `${Math.floor(remaining / 60).toString().padStart(2, '0')}:${(remaining % 60).toString().padStart(2, '0')}`;
      card.style.setProperty('--progress', `${100 * (1 - remaining / duration)}%`);
    };
    const tick = () => {
      if (!root.isConnected) { stop(); return; }
      remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      render();
      if (!remaining) { stop(); status.textContent = 'Session complete. Take a breath.'; }
    };
    start.addEventListener('click', () => {
      if (interval) { tick(); stop(); if (remaining) status.textContent = 'Paused. Take your time.'; return; }
      if (!remaining) remaining = duration;
      deadline = Date.now() + remaining * 1000;
      interval = setInterval(tick, 250);
      start.textContent = 'Pause';
      status.textContent = duration === 1500 ? 'One thing. Your full attention.' : 'Look away. Breathe. Reset.';
      render();
    });
    const reset = () => { stop(); remaining = duration; status.textContent = 'Ready when you are'; render(); };
    root.querySelector('.reset').addEventListener('click', reset);
    root.querySelectorAll('[data-minutes]').forEach(button => button.addEventListener('click', () => {
      duration = Number(button.dataset.minutes) * 60;
      root.querySelectorAll('[data-minutes]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      reset();
    }));

    // This repository is vanilla JavaScript; native controls keep this contribution self-contained.
    if (import.meta.env.DEV) {
      const settings = { ...defaults };
      const panel = document.createElement('details');
      panel.setAttribute('data-no-drag', '');
      panel.innerHTML = `<summary>Design studio · development only</summary>
        ${[['radius', 'Corner radius', 0, 40], ['padding', 'Card padding', 12, 28], ['gap', 'Button gap', 4, 20], ['heading', 'Heading size', 20, 34]].map(([key, label, min, max]) => `<label>${label}<input aria-label="${label}" type="range" data-setting="${key}" min="${min}" max="${max}" value="${defaults[key]}"></label>`).join('')}
        <label>Accent color<input aria-label="Accent color" type="color" data-setting="accent" value="${defaults.accent}"></label>
        <button class="copy">Copy values</button><p class="copy-status" role="status"></p><textarea class="values" aria-label="Design values to copy" rows="4" hidden readonly></textarea>`;
      card.append(panel);
      panel.querySelectorAll('input').forEach(input => input.addEventListener('input', () => {
        const key = input.dataset.setting;
        settings[key] = key === 'accent' ? input.value : Number(input.value);
        card.style.setProperty(`--${key}`, key === 'accent' ? input.value : `${input.value}px`);
      }));
      panel.querySelector('.copy').addEventListener('click', async () => {
        const values = JSON.stringify(settings, null, 2);
        try { await navigator.clipboard.writeText(values); panel.querySelector('.copy-status').textContent = 'Values copied.'; }
        catch { const field = panel.querySelector('.values'); field.hidden = false; field.value = values; field.select(); panel.querySelector('.copy-status').textContent = 'Copy the selected values below.'; }
      });
    }
  },
};
