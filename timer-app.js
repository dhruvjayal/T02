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
  // Store input values outside render
  let timerNameValue = "";
  let timerDurationValue = "60";

  // DOM roots
  const root = document.getElementById("timer-app-root");

  // Render function
  function render() {
    const emptyState = timers.length === 0 ? `
      <div class="empty-state">
        <h3>No timers yet</h3>
        <p>Add a timer above to get started!</p>
      </div>
    ` : '';

    root.innerHTML = `
      <h2>⏱️ Timer App</h2>
      <div class="timer-inputs">
        <div class="input-group">
          <input type="text" id="timerName" placeholder="Timer Name (e.g., Break, Workout)" value="${timerNameValue.replace(/"/g, '&quot;')}" />
          <input type="number" id="timerDuration" min="1" placeholder="Minutes" value="${timerDurationValue}" />
        </div>
        <button id="addTimerBtn">➕ Add Timer</button>
      </div>
      <ul class="timer-list">
        ${timers
          .map(
            (timer) => {
              const isRunning = timer.running;
              const isFinished = timer.remaining === 0;
              const timerClasses = `timer-item ${isRunning ? 'running' : ''} ${isFinished ? 'finished' : ''}`;
              
              return `
                <li class="${timerClasses}" data-id="${timer.id}">
                  <div class="timer-header">
                    <h3 class="timer-name">${timer.name}</h3>
                  </div>
                  <div class="timer-display">${fmt(timer.remaining)}</div>
                  <div class="timer-controls">
                    ${
                      !timer.running && timer.remaining > 0
                        ? `<button class="start-btn" title="Start Timer">▶️</button>`
                        : ""
                    }
                    ${
                      timer.running
                        ? `<button class="pause-btn" title="Pause Timer">⏸️</button>`
                        : ""
                    }
                    <button class="reset-btn" title="Reset Timer">🔄</button>
                    <button class="remove-btn" title="Delete Timer">🗑️</button>
                  </div>
                </li>
              `;
            }
          )
          .join("")}
      </ul>
      ${emptyState}
    `;

    // Input references
    const timerNameInput = root.querySelector("#timerName");
    const timerDurationInput = root.querySelector("#timerDuration");
    const addBtn = root.querySelector("#addTimerBtn");

    // Restore input values after render (in case browser autocorrects, etc.)
    timerNameInput.value = timerNameValue;
    timerDurationInput.value = timerDurationValue;

    // Save values on input
    timerNameInput.addEventListener("input", function () {
      timerNameValue = timerNameInput.value;
    });
    timerDurationInput.addEventListener("input", function () {
      timerDurationValue = timerDurationInput.value;
    });

    // Add Timer event
    addBtn.onclick = function () {
      const name = timerNameInput.value.trim();
      const duration = parseInt(timerDurationInput.value, 10) || 0;
      if (!name || duration <= 0) {
        // Add visual feedback for invalid input
        if (!name) {
          timerNameInput.style.borderColor = 'var(--danger-color)';
          setTimeout(() => {
            timerNameInput.style.borderColor = '';
          }, 2000);
        }
        if (duration <= 0) {
          timerDurationInput.style.borderColor = 'var(--danger-color)';
          setTimeout(() => {
            timerDurationInput.style.borderColor = '';
          }, 2000);
        }
        return;
      }
      
      // Convert minutes to seconds
      const durationInSeconds = duration * 60;
      
      timers.push({
        id: idSeq++,
        name,
        duration: durationInSeconds,
        remaining: durationInSeconds,
        running: false,
        intervalId: null,
      });
      // Reset input values
      timerNameValue = "";
      timerDurationValue = "60";
      render();
    };

    // Allow Enter key to add timer
    [timerNameInput, timerDurationInput].forEach(input => {
      input.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
          addBtn.click();
        }
      });
    });

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
              // Play notification sound (if supported)
              try {
                // Create a simple beep sound
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.2);
              } catch (e) {
                // Fallback: browser notification if sound fails
                console.log('Timer finished:', timer.name);
              }
              // Show browser notification if permitted
              if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(`Timer finished: ${timer.name}`, {
                  body: 'Your timer has completed!',
                  icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⏰</text></svg>'
                });
              }
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

  // Request notification permission on page load
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  // Initial render
  render();
})();
