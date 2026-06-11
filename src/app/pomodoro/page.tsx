'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import DashboardShell from '@/components/DashboardShell';
import s from '@/app/section.module.css';

const MODES = [
  { label:'Focus',       duration:25*60, color:'var(--clr-rose)' },
  { label:'Short Break', duration:5*60,  color:'var(--clr-cyan)' },
  { label:'Long Break',  duration:15*60, color:'var(--clr-emerald)' },
];
type LogEntry = { task: string; mode: string; duration: number; at: string };
const pad = (n: number) => String(n).padStart(2,'0');

export default function PomodoroPage() {
  const [modeIdx, setModeIdx]       = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(MODES[0].duration);
  const [running, setRunning]       = useState(false);
  const [sessions, setSessions]     = useState(0);
  const [task, setTask]             = useState('');
  const [log, setLog]               = useState<LogEntry[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const mode = MODES[modeIdx];
  const total = mode.duration;
  const progress = 1 - secondsLeft/total;
  const degrees  = progress * 360;
  const mins = Math.floor(secondsLeft/60);
  const secs = secondsLeft%60;

  const reset = useCallback(() => { setRunning(false); setSecondsLeft(mode.duration); }, [mode.duration]);

  const switchMode = useCallback((idx: number) => {
    setRunning(false);
    setModeIdx(idx);
    setSecondsLeft(MODES[idx].duration);
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            if (modeIdx === 0) {
              setSessions(s => s+1);
              setLog(l => [{ task: task || 'Focus session', mode: mode.label, duration: mode.duration/60, at: new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) }, ...l]);
            }
            return 0;
          }
          return prev-1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, modeIdx, task, mode]);

  return (
    <DashboardShell>
      <div className={s.wrap}>
        <motion.div className={s.pageHead} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
          <div className={s.pageLabel}>Focus</div>
          <h1 className={s.pageTitle}>Pomodoro Timer</h1>
          <p className={s.pageSub}>{sessions} session{sessions!==1?'s':''} completed today</p>
        </motion.div>

        <motion.div className={s.pomPage} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1, duration:0.4 }}>
          {/* Mode tabs */}
          <div className={s.pomTabs}>
            {MODES.map((m, i) => (
              <button key={m.label} className={`${s.pomTab} ${modeIdx===i ? s.pomTabActive : ''}`}
                style={modeIdx===i ? { borderColor: m.color, color: m.color } : {}}
                onClick={() => switchMode(i)}>
                {m.label}
              </button>
            ))}
          </div>

          {/* Task input */}
          <input className={s.pomTaskInput} value={task} onChange={e => setTask(e.target.value)} placeholder="What are you working on?" />

          {/* Big ring */}
          <motion.div
            className={s.pomRingLg}
            style={{ background: `conic-gradient(${mode.color} ${degrees}deg, var(--bg-raised) 0)`, boxShadow: running ? `0 0 48px ${mode.color}40` : 'none' }}
            animate={{ scale: running ? [1,1.01,1] : 1 }}
            transition={{ repeat: running ? Infinity : 0, duration: 2 }}
          >
            <div className={s.pomRingLgInner}>
              <span className={s.pomTimeLg}>{pad(mins)}:{pad(secs)}</span>
              <span className={s.pomModeLg}>{mode.label}</span>
            </div>
          </motion.div>

          <div className={s.pomStatusLg}>
            {running ? `${mode.label} — ${mins}m ${secs}s remaining` : secondsLeft===0 ? '✓ Session complete! Great work.' : `${mode.label} · ready to start`}
          </div>

          {/* Controls */}
          <div className={s.pomCtrlsLg}>
            <button className={s.pomCtrlLg} onClick={reset} title="Reset">↺</button>
            <motion.button
              className={s.pomCtrlLgPrimary}
              style={{ background: mode.color }}
              onClick={() => setRunning(r => !r)}
              whileTap={{ scale: 0.92 }}
            >
              {running ? '⏸' : '▶'}
            </motion.button>
            <button className={s.pomCtrlLg} title="Skip" onClick={() => switchMode((modeIdx+1)%3)}>⏭</button>
          </div>

          {/* Session log */}
          {log.length > 0 && (
            <div className={s.pomLog}>
              <div className={s.pomLogTitle}>Session Log</div>
              {log.map((entry, i) => (
                <div key={i} className={s.pomLogItem}>
                  <span className={s.pomLogEmoji}>🍅</span>
                  <span style={{ flex:1 }}>{entry.task}</span>
                  <span style={{ color:'var(--text-dim)', fontSize:'0.72rem' }}>{entry.duration}m · {entry.at}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardShell>
  );
}
