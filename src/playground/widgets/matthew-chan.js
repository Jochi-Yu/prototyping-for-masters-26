export default {
  student: "Matthew Chan",
  title: "Local time",
  width: 320,
  height: 180,
  mount(root) {
    const style = document.createElement("style");
    style.textContent = `
      .clock {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 10px;
        height: 100%;
        padding: 20px;
        box-sizing: border-box;
        font-variant-numeric: tabular-nums;
      }
      .time {
        display: flex;
        align-items: baseline;
        gap: 6px;
        font-size: 56px;
        line-height: 1;
        letter-spacing: -0.02em;
      }
      .colon {
        animation: blink 1s steps(1) infinite;
      }
      .seconds,
      .period {
        font-size: 20px;
        opacity: 0.6;
      }
      .date {
        font-size: 13px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        opacity: 0.6;
      }
      @keyframes blink {
        50% { opacity: 0.2; }
      }
      @media (prefers-reduced-motion: reduce) {
        .colon { animation: none; }
      }
    `;

    const clock = document.createElement("div");
    clock.className = "clock";
    clock.setAttribute("role", "timer");
    clock.innerHTML = `
      <div class="time">
        <span><span class="hours"></span><span class="colon">:</span><span class="minutes"></span></span>
        <span class="seconds"></span>
        <span class="period"></span>
      </div>
      <div class="date"></div>
    `;
    root.append(style, clock);

    const hours = clock.querySelector(".hours");
    const minutes = clock.querySelector(".minutes");
    const seconds = clock.querySelector(".seconds");
    const period = clock.querySelector(".period");
    const date = clock.querySelector(".date");

    const timeFormat = new Intl.DateTimeFormat("en-US", {
      hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true,
    });
    const dateFormat = new Intl.DateTimeFormat("en-US", {
      weekday: "long", month: "short", day: "numeric",
    });

    const tick = () => {
      const now = new Date();
      const values = Object.fromEntries(timeFormat.formatToParts(now).map(({ type, value }) => [type, value]));
      hours.textContent = values.hour;
      minutes.textContent = values.minute;
      seconds.textContent = values.second;
      period.textContent = values.dayPeriod;
      date.textContent = dateFormat.format(now);
      clock.setAttribute("aria-label", `${values.hour}:${values.minute} ${values.dayPeriod}, ${dateFormat.format(now)}`);
    };
    tick();
    setInterval(tick, 1000);
  },
};
