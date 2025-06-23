(function () {
  // Utility: pad time
  function fmt(secs) {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  // State
  let timers = [];
  let idSeq = 1;

  // DOM roots
  const root = document.getElementById("timer-app-root");

  // Render function
  function render() {
    root.innerHTML = `
      <h2>Timer App</h2>
      <div class="timer-inputs">
        <input type="text" id="timerName" placeholder="Timer Name" />
        <input type="number" id="timerDuration" min="1" value="60" />
        <button id="addTimerBtn">Add Timer</button>
      </div>
      <ul class="timer-list">
        ${timers
          .map(
            (timer) => `
          <li class="timer-item" data-id="${timer.id}">
            <strong>${timer.name}</strong> &mdash; <span class="timer-rem">${fmt(timer.remaining)}</span>
            <div class="timer-controls">
              ${
                !timer.running && timer.remaining > 0
                  ? `<button class="start-btn" title="Start">&#9654;</button>`
                  : ""
              }
              ${
                timer.running
                  ? `<button class="pause-btn" title="Pause">&#9208;</button>`
                  : ""
              }
              <button class="reset-btn" title="Reset">&#128260;</button>
              <button class="remove-btn" title="Delete">&#128465;</button>
            </div>
          </li>
        `
          )
          .join("")}
      </ul>
    `;

    // Input references
    const timerNameInput = root.querySelector("#timerName");
    const timerDurationInput = root.querySelector("#timerDuration");
    const addBtn = root.querySelector("#addTimerBtn");

    // Add Timer event
    addBtn.onclick = function () {
      const name = timerNameInput.value.trim();
      const duration = parseInt(timerDurationInput.value, 10) || 0;
      if (!name || duration <= 0) return;
      timers.push({
        id: idSeq++,
        name,
        duration,
        remaining: duration,
        running: false,
        intervalId: null,
      });
      timerNameInput.value = "";
      timerDurationInput.value = "60";
      render();
    };

    // Timer controls
    root.querySelectorAll(".timer-item").forEach((li) => {
      const id = Number(li.getAttribute("data-id"));
      const timer = timers.find((t) => t.id === id);

      // Start
      li.querySelector(".start-btn")?.addEventListener("click", function () {
        if (!timer.running && timer.remaining > 0) {
          timer.running = true;
          timer.intervalId = setInterval(() => {
            timer.remaining--;
            if (timer.remaining <= 0) {
              timer.remaining = 0;
              timer.running = false;
              clearInterval(timer.intervalId);
              timer.intervalId = null;
            }
            render();
          }, 1000);
          render();
        }
      });

      // Pause
      li.querySelector(".pause-btn")?.addEventListener("click", function () {
        if (timer.running) {
          clearInterval(timer.intervalId);
          timer.running = false;
          timer.intervalId = null;
          render();
        }
      });

      // Reset
      li.querySelector(".reset-btn")?.addEventListener("click", function () {
        if (timer.intervalId) clearInterval(timer.intervalId);
        timer.remaining = timer.duration;
        timer.running = false;
        timer.intervalId = null;
        render();
      });

      // Remove
      li.querySelector(".remove-btn")?.addEventListener("click", function () {
        if (timer.intervalId) clearInterval(timer.intervalId);
        timers = timers.filter((t) => t.id !== id);
        render();
      });
    });
  }

  // Initial render
  render();
})();