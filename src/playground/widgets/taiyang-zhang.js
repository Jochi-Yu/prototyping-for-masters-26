// Sakura Rhythm Tap — Playground Widget by Taiyang Zhang (Sunshine)
// SVA MFA Design '26 · Playful Rhythm HCI & Procedural Audio

const NOTES = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]; // C5, D5, E5, G5, A5, C6
const HIT_GRADES = ["PERFECT!!", "CRITICAL!!", "JUSTICE!!", "FEVER!!", "FANTASTIC!"];

export default {
  student: "Taiyang Zhang (Sunshine)",
  title: "Sakura Rhythm Tap",
  width: 320,
  height: 380,
  rotate: 2,
  mount(root) {
    let audioCtx = null;
    let combo = 0;
    let noteIndex = 0;

    const playSound = () => {
      try {
        if (!audioCtx) {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          if (AudioContextClass) audioCtx = new AudioContextClass();
        }
        if (audioCtx && audioCtx.state === "suspended") {
          audioCtx.resume();
        }
        if (!audioCtx) return;

        const freq = NOTES[noteIndex % NOTES.length];
        noteIndex += 1;

        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        // Cheerful sine + soft bell chime
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.01, now + 0.15);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.46);
      } catch {
        // AudioContext not allowed or not supported; gracefully no-op
      }
    };

    root.innerHTML = `
      <style>
        :host {
          display: block;
          height: 100%;
        }
        .rhythm-card {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 26px;
          background: linear-gradient(145deg, #180d26 0%, #100618 100%);
          border: 1px solid rgba(255, 117, 160, 0.28);
          padding: 22px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          color: #fce7f3;
          font-family: 'IBM Plex Mono', monospace;
          user-select: none;
          overflow: hidden;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45);
        }
        .bg-glow {
          position: absolute;
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, rgba(255, 117, 160, 0.25) 0%, transparent 70%);
          top: 35%;
          left: 50%;
          transform: translate(-50%, -50%);
          filter: blur(40px);
          pointer-events: none;
        }
        .header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          letter-spacing: 0.08em;
          color: #f472b6;
          font-weight: 500;
        }
        .badge {
          background: rgba(255, 117, 160, 0.16);
          border: 1px solid rgba(255, 117, 160, 0.4);
          padding: 3px 9px;
          border-radius: 9999px;
          font-size: 10px;
          color: #ff9ebb;
        }
        .disc-wrapper {
          position: relative;
          width: 170px;
          height: 170px;
          margin: 10px 0;
          cursor: pointer;
          touch-action: manipulation;
        }
        .disc {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #2d163d 0%, #150921 75%);
          border: 2px solid rgba(255, 117, 160, 0.5);
          box-shadow: 0 0 24px rgba(255, 117, 160, 0.3), inset 0 0 18px rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: transform 0.12s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.15s ease;
        }
        .disc:hover {
          transform: scale(1.04);
          box-shadow: 0 0 32px rgba(255, 117, 160, 0.55);
        }
        .disc:active, .disc.is-hit {
          transform: scale(0.92);
          box-shadow: 0 0 45px rgba(255, 117, 160, 0.85);
        }
        .disc-ring {
          position: absolute;
          inset: 12px;
          border-radius: 50%;
          border: 1px dashed rgba(255, 255, 255, 0.2);
          animation: rotateRing 14s linear infinite;
        }
        @keyframes rotateRing {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .disc-icon {
          font-size: 38px;
          line-height: 1;
          filter: drop-shadow(0 2px 8px rgba(255, 117, 160, 0.6));
          transition: transform 0.15s ease;
        }
        .disc:hover .disc-icon {
          transform: rotate(-12deg) scale(1.1);
        }
        .disc-tap-hint {
          font-size: 9px;
          letter-spacing: 0.14em;
          color: #ff75a0;
          font-weight: 700;
          margin-top: 6px;
        }
        .feedback-area {
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Faculty Glyphic', serif;
          font-size: 15px;
          font-weight: 700;
          color: #fbbf24;
          text-shadow: 0 0 12px rgba(251, 191, 36, 0.6);
        }
        .hit-grade {
          animation: popGrade 0.4s ease-out forwards;
        }
        @keyframes popGrade {
          0% { transform: translateY(6px) scale(0.8); opacity: 0; }
          40% { transform: translateY(-2px) scale(1.15); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 0.9; }
        }
        .stats-row {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 117, 160, 0.18);
          border-radius: 14px;
          padding: 8px 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
        }
        .combo-count {
          font-size: 17px;
          font-weight: 700;
          color: #38bdf8;
          font-variant-numeric: tabular-nums;
        }
        .combo-label {
          color: #d1b4cb;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .ripple {
          position: absolute;
          border-radius: 50%;
          border: 2px solid #ff75a0;
          pointer-events: none;
          animation: rippleExpand 0.6s ease-out forwards;
        }
        @keyframes rippleExpand {
          0% { width: 40px; height: 40px; opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { width: 220px; height: 220px; opacity: 0; transform: translate(-50%, -50%) scale(1.2); }
        }
        @media (prefers-reduced-motion: reduce) {
          .disc-ring { animation: none; }
          .disc:hover { transform: none; }
        }
      </style>

      <div class="rhythm-card">
        <div class="bg-glow"></div>

        <div class="header">
          <span>🌸 SUNSHINE BEAT</span>
          <span class="badge">128 BPM</span>
        </div>

        <div class="disc-wrapper">
          <div class="disc">
            <div class="disc-ring"></div>
            <div class="disc-icon">🌸</div>
            <div class="disc-tap-hint">TAP BEAT</div>
          </div>
        </div>

        <div class="feedback-area">
          <span class="hit-grade">READY</span>
        </div>

        <div class="stats-row">
          <div>
            <span class="combo-label">COMBO</span>
            <div class="combo-count">00</div>
          </div>
          <div style="text-align: right;">
            <span class="combo-label">FEVER TIER</span>
            <div style="color: #ff75a0; font-weight: 700; font-size: 12px;" class="fever-tier">CHILL</div>
          </div>
        </div>
      </div>
    `;

    const disc = root.querySelector(".disc");
    const discWrapper = root.querySelector(".disc-wrapper");
    const feedback = root.querySelector(".feedback-area");
    const comboEl = root.querySelector(".combo-count");
    const feverEl = root.querySelector(".fever-tier");

    const onHit = (e) => {
      combo += 1;
      playSound();

      // Disc spring bounce
      disc.classList.remove("is-hit");
      void disc.offsetWidth; // Force reflow
      disc.classList.add("is-hit");
      setTimeout(() => disc.classList.remove("is-hit"), 140);

      // Ripple particle
      const rect = discWrapper.getBoundingClientRect();
      const ripple = document.createElement("div");
      ripple.className = "ripple";
      ripple.style.left = "50%";
      ripple.style.top = "50%";
      discWrapper.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);

      // Hit grade & combo update
      const randomGrade = HIT_GRADES[Math.min(Math.floor(combo / 4), HIT_GRADES.length - 1)];
      feedback.innerHTML = `<span class="hit-grade">${randomGrade}</span>`;
      comboEl.textContent = String(combo).padStart(2, "0");

      if (combo >= 20) {
        feverEl.textContent = "SUPER MAX 🔥";
        feverEl.style.color = "#fbbf24";
      } else if (combo >= 10) {
        feverEl.textContent = "FEVER ⚡";
        feverEl.style.color = "#f472b6";
      } else if (combo >= 5) {
        feverEl.textContent = "GROOVY ✨";
        feverEl.style.color = "#34d399";
      } else {
        feverEl.textContent = "CHILL";
        feverEl.style.color = "#ff75a0";
      }
    };

    disc.addEventListener("pointerdown", onHit);
  },
};
