'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import s from '@/app/dashboard.module.css';

const MODES = [
  { label: 'Focus',       duration: 25 * 60, color: 'var(--clr-rose)' },
  { label: 'Short Break', duration: 5 * 60,  color: 'var(--clr-cyan)' },
  { label: 'Long Break',  duration: 15 * 60, color: 'var(--clr-emerald)' },
];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function PomodoroTimer() {
  const [modeIdx, setModeIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(MODES[0].duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const mode = MODES[modeIdx];
  const total = mode.duration;
  const progress = 1 - secondsLeft / total; // 0 → 1
  const degrees = progress * 360;

  // Clean up on unmount
  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // Tick
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            if (modeIdx === 0) setSessions((s) => s + 1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, modeIdx]);

  const reset = useCallback(() => {
    setRunning(false);
    setSecondsLeft(mode.duration);
  }, [mode.duration]);

  const switchMode = useCallback((idx: number) => {
    setRunning(false);
    setModeIdx(idx);
    setSecondsLeft(MODES[idx].duration);
  }, []);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className={s.pomodoroInner}>
      {/* Mode tabs */}
      <div className={s.pomodoroTabs}>
        {MODES.map((m, i) => (
          <button
            key={m.label}
            className={`${s.pomodoroTab} ${modeIdx === i ? s.pomodoroTabActive : ''}`}
            style={modeIdx === i ? { borderColor: m.color, color: m.color } : {}}
            onClick={() => switchMode(i)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Ring */}
      <div
        className={s.pomodoroRing}
        style={{
          background: `conic-gradient(${mode.color} ${degrees}deg, var(--bg-raised) 0)`,
          boxShadow: running ? `0 0 28px ${mode.color}40` : 'none',
          transition: 'box-shadow 0.4s',
        }}
      >
        <div className={s.pomodoroRingInner}>
          <span className={s.pomodoroTime}>
            {pad(mins)}:{pad(secs)}
          </span>
        </div>
      </div>

      {/* Status */}
      <div className={s.pomodoroStatus}>
        {running
          ? `${mode.label} — ${mins}m ${secs}s left`
          : secondsLeft === 0
            ? '✓ Session complete!'
            : `${mode.label} · not started`}
      </div>

      {/* Sessions */}
      {sessions > 0 && (
        <div className={s.pomodoroSessions}>
          {'🍅'.repeat(Math.min(sessions, 8))}
          <span className={s.pomodoroSessionCount}>{sessions} session{sessions !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Controls */}
      <div className={s.pomodoroControls}>
        <motion.button
          id="pomo-play-pause"
          className={`${s.pomCtrl} ${s.pomCtrlPrimary}`}
          style={{ background: mode.color, boxShadow: `0 0 14px ${mode.color}50` }}
          onClick={() => setRunning((r) => !r)}
          whileTap={{ scale: 0.92 }}
        >
          {running ? '⏸' : '▶'}
        </motion.button>
        <button id="pomo-reset" className={s.pomCtrl} onClick={reset} title="Reset">↺</button>
      </div>
    </div>
  );
}
