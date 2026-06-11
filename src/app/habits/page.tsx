'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import s from '@/app/section.module.css';

type Habit = { id: number; name: string; emoji: string; streak: number; history: boolean[]; doneToday: boolean };

// history = last 7 days (oldest first, index 6 = today)
const INIT: Habit[] = [
  { id:1, name:'Morning Run',  emoji:'🏃', streak:7,  history:[true,true,true,true,true,true,false],  doneToday:false },
  { id:2, name:'Reading',      emoji:'📖', streak:3,  history:[false,true,false,true,true,true,false], doneToday:false },
  { id:3, name:'Hydration',    emoji:'💧', streak:12, history:[true,true,true,true,true,true,true],   doneToday:true },
  { id:4, name:'Meditation',   emoji:'🧘', streak:5,  history:[false,true,true,true,true,true,false], doneToday:false },
  { id:5, name:'Cold Shower',  emoji:'🚿', streak:2,  history:[false,false,false,false,false,true,false],doneToday:false },
];

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>(INIT);
  const [newHabit, setNewHabit] = useState('');

  const toggle = (id: number) => {
    setHabits(hs => hs.map(h => {
      if (h.id !== id) return h;
      const wasD = h.doneToday;
      return {
        ...h,
        doneToday: !wasD,
        streak: !wasD ? h.streak + 1 : Math.max(0, h.streak - 1),
        history: [...h.history.slice(0,6), !wasD],
      };
    }));
  };

  const addHabit = () => {
    if (!newHabit.trim()) return;
    setHabits(hs => [...hs, { id:Date.now(), name:newHabit.trim(), emoji:'⭐', streak:0, history:[false,false,false,false,false,false,false], doneToday:false }]);
    setNewHabit('');
  };

  const doneToday  = habits.filter(h => h.doneToday).length;
  const bestStreak = Math.max(...habits.map(h => h.streak));
  const DAY_LABELS = ['M','T','W','T','F','S','S'];

  return (
    <DashboardShell>
      <div className={s.wrap}>
        <motion.div className={s.pageHead} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
          <div className={s.pageLabel}>Health</div>
          <h1 className={s.pageTitle}>Habit Tracker</h1>
          <p className={s.pageSub}>Build streaks, one day at a time.</p>
        </motion.div>

        {/* Hero stats */}
        <motion.div className={s.habitHero} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08, duration:0.4 }}>
          <div className={s.habitHeroCard}><div className={s.habitHeroLabel}>Today&apos;s Progress</div><div className={s.habitHeroValue} style={{ color:'var(--clr-emerald)' }}>{doneToday}/{habits.length} <span style={{ fontSize:'1rem' }}>done</span></div></div>
          <div className={s.habitHeroCard}><div className={s.habitHeroLabel}>Best Streak</div><div className={s.habitHeroValue} style={{ color:'var(--clr-amber)' }}>{bestStreak}d 🔥</div></div>
          <div className={s.habitHeroCard}><div className={s.habitHeroLabel}>Total Habits</div><div className={s.habitHeroValue}>{habits.length}</div></div>
        </motion.div>

        {/* Day labels header */}
        <motion.div className={s.card} style={{ padding:'1.4rem 1.6rem' }} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15, duration:0.4 }}>
          {/* Column header */}
          <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginBottom:'0.75rem', paddingBottom:'0.5rem', borderBottom:'1px solid var(--line-faint)' }}>
            <div style={{ flex:1, fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-dim)' }}>Habit</div>
            <div style={{ display:'flex', gap:4 }}>{DAY_LABELS.map((d,i) => <div key={i} style={{ width:10, textAlign:'center', fontSize:'0.58rem', fontWeight:700, color:'var(--text-dim)', letterSpacing:'0.04em' }}>{d}</div>)}</div>
            <div style={{ fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-dim)', width:50, textAlign:'center' }}>Today</div>
            <div style={{ fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-dim)', width:44, textAlign:'right' }}>Streak</div>
          </div>

          {habits.map((h, i) => (
            <motion.div key={h.id} className={s.habitRow} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: 0.2 + i*0.05, duration:0.3 }}>
              <div className={s.habitRowName}><span>{h.emoji}</span>{h.name}</div>
              <div className={s.habitDots7}>
                {h.history.slice(0,7).map((done, j) => (
                  <div key={j} className={`${s.habitDot7} ${done ? s.filled : ''}`} title={DAY_LABELS[j]} />
                ))}
              </div>
              <div style={{ width:50, display:'flex', justifyContent:'center' }}>
                <button className={`${s.habitToggle} ${h.doneToday ? s.done : ''}`} onClick={() => toggle(h.id)}>✓</button>
              </div>
              <div className={s.habitStreakBadge}>{h.streak}d 🔥</div>
            </motion.div>
          ))}

          {/* Add habit row */}
          <div style={{ display:'flex', gap:'0.5rem', marginTop:'1rem', paddingTop:'0.75rem', borderTop:'1px solid var(--line-faint)' }}>
            <input className={s.addInput} style={{ flex:1 }} placeholder="Add a new habit…" value={newHabit} onChange={e => setNewHabit(e.target.value)} onKeyDown={e => e.key==='Enter' && addHabit()} />
            <button className={s.addBtn} onClick={addHabit}><Plus size={14} /></button>
          </div>
        </motion.div>
      </div>
    </DashboardShell>
  );
}
