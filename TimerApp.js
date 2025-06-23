import React, { useState } from "react";

let nextId = 1;

export default function TimerApp() {
  const [timers, setTimers] = useState([]);
  const [timerName, setTimerName] = useState("");
  const [timerDuration, setTimerDuration] = useState(60);

  // Add timer
  function addTimer() {
    if (!timerName || timerDuration <= 0) return;
    setTimers((prev) => [
      ...prev,
      {
        id: nextId++,
        name: timerName,
        duration: timerDuration,
        remaining: timerDuration,
        running: false,
        intervalId: null,
      },
    ]);
    setTimerName("");
    setTimerDuration(60);
  }

  // Start timer
  function startTimer(id) {
    setTimers((prev) =>
      prev.map((timer) => {
        if (timer.id === id && !timer.running && timer.remaining > 0) {
          const intervalId = setInterval(() => {
            setTimers((prevTimers) =>
              prevTimers.map((t) => {
                if (t.id === id) {
                  const rem = t.remaining - 1;
                  if (rem <= 0) {
                    clearInterval(t.intervalId);
                    return {
                      ...t,
                      remaining: 0,
                      running: false,
                      intervalId: null,
                    };
                  }
                  return { ...t, remaining: rem };
                }
                return t;
              })
            );
          }, 1000);
          return { ...timer, running: true, intervalId: intervalId };
        }
        return timer;
      })
    );
  }

  // Pause timer
  function pauseTimer(id) {
    setTimers((prev) =>
      prev.map((timer) => {
        if (timer.id === id && timer.running) {
          if (timer.intervalId) clearInterval(timer.intervalId);
          return { ...timer, running: false, intervalId: null };
        }
        return timer;
      })
    );
  }

  // Reset timer
  function resetTimer(id) {
    setTimers((prev) =>
      prev.map((timer) => {
        if (timer.id === id) {
          if (timer.intervalId) clearInterval(timer.intervalId);
          return {
            ...timer,
            remaining: timer.duration,
            running: false,
            intervalId: null,
          };
        }
        return timer;
      })
    );
  }

  // Remove timer
  function removeTimer(id) {
    setTimers((prev) => {
      const timer = prev.find((t) => t.id === id);
      if (timer?.intervalId) clearInterval(timer.intervalId);
      return prev.filter((t) => t.id !== id);
    });
  }

  // Format mm:ss
  function fmt(secs) {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", padding: "1rem", border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Timer App</h2>
      <div style={{ marginBottom: 16 }}>
        <input
          placeholder="Timer Name"
          value={timerName}
          onChange={(e) => setTimerName(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <input
          type="number"
          min={1}
          value={timerDuration}
          onChange={(e) => setTimerDuration(Number(e.target.value))}
          style={{ width: 80, marginRight: 8 }}
        />
        <button onClick={addTimer}>Add Timer</button>
      </div>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {timers.map((timer) => (
          <li key={timer.id} style={{ marginBottom: 12, borderBottom: "1px solid #eee", paddingBottom: 8 }}>
            <strong>{timer.name}</strong> — <span>{fmt(timer.remaining)}</span>
            <div style={{ display: "inline-block", marginLeft: 12 }}>
              {!timer.running && timer.remaining > 0 && (
                <button onClick={() => startTimer(timer.id)} style={{ marginRight: 4 }}>
                  ▶️
                </button>
              )}
              {timer.running && (
                <button onClick={() => pauseTimer(timer.id)} style={{ marginRight: 4 }}>
                  ⏸️
                </button>
              )}
              <button onClick={() => resetTimer(timer.id)} style={{ marginRight: 4 }}>
                🔄
              </button>
              <button onClick={() => removeTimer(timer.id)}>🗑️</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}