'use client';

import { useState, useEffect } from 'react';
import { useUser, SignInButton, SignUpButton } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { CalendarDays, CheckSquare, Wallet, Flame, TrendingUp, ChevronRight, BookOpen, Zap } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import PomodoroTimer from '@/components/PomodoroTimer';
import s from '@/app/dashboard.module.css';

function FadeUp({ delay = 0, className, style, children }: { delay?: number; className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  return (
    <motion.div className={className} style={style} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42, delay, ease: 'easeOut' }}>
      {children}
    </motion.div>
  );
}

function getGreeting(hour: number) {
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  if (hour < 21) return 'Evening';
  return 'Night';
}

const STATS = [
  { icon: CalendarDays, value: '3',    label: 'Classes Today', color: 'var(--clr-cyan)' },
  { icon: CheckSquare,  value: '5',    label: 'Tasks Left',    color: 'var(--accent-bright)' },
  { icon: TrendingUp,   value: '₹230', label: 'Remaining',     color: 'var(--clr-emerald)' },
  { icon: Flame,        value: '7d',   label: 'Best Streak',   color: 'var(--clr-amber)' },
];
const SCHEDULE = [
  { time: '9:00 AM',  title: 'Mathematics 101', room: 'Room B-204', color: 'var(--clr-cyan)' },
  { time: '11:30 AM', title: 'Applied Physics',  room: 'Lab A-102',  color: 'var(--accent-bright)' },
  { time: '2:00 PM',  title: 'CS Algorithms',   room: 'Room C-301', color: 'var(--clr-emerald)' },
];
const TASKS = [
  { title: 'Submit Assignment 3', due: 'Today at 6 PM', urgent: true },
  { title: 'Read Chapter 4',      due: 'Tomorrow',      urgent: false },
  { title: 'Prepare Lab Report',  due: 'May 12',        urgent: false },
];
const BUDGET = [
  { label: 'Monthly Allowance', amt: '+₹500', pos: true },
  { label: 'Lunch',             amt: '−₹150', pos: false },
  { label: 'Transport',         amt: '−₹80',  pos: false },
  { label: 'Books',             amt: '−₹40',  pos: false },
];
const HABITS = [
  { name: 'Morning Run', streak: '7d',  done: true },
  { name: 'Reading',     streak: '3d',  done: true },
  { name: 'Hydration',   streak: '12d', done: false },
  { name: 'Meditation',  streak: '5d',  done: false },
];

export default function DashboardPage() {
  const { isSignedIn, user } = useUser();
  const [now, setNow] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);

  const greeting = getGreeting(now.getHours());
  const dateStr  = now.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const timeStr  = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const firstName = user?.firstName ?? 'Student';

  return (
    <DashboardShell>
      <FadeUp delay={0} className={s.topHeader}>
        <div className={s.topHeaderMeta}>
          <div className={s.metaDot} />
          <span className={s.metaText}>{dateStr}</span>
          <span className={s.metaTimeLive}>{timeStr}</span>
        </div>
        <h1 className={s.heroGreeting}>Good<br /><span>{greeting}.</span></h1>
        <p className={s.heroSub}>{isSignedIn ? `Welcome back, ${firstName}. Here's everything happening in your world.` : "Here's everything happening in your world today."}</p>
        {!isSignedIn && (
          <div className={s.topHeaderActions}>
            <SignUpButton mode="modal"><button className="btn-cta"><Zap size={12} /> Start for free</button></SignUpButton>
            <SignInButton mode="modal"><button className="btn-ghost">I already have an account</button></SignInButton>
          </div>
        )}
      </FadeUp>

      {!isSignedIn && (
        <FadeUp delay={0.08} className={s.previewStrip}>
          <span className={s.previewStripText}>✦ &nbsp;You&apos;re viewing sample data. Sign in to see your real schedule, tasks, and budget.</span>
          <div className={s.previewStripActions}>
            <SignInButton mode="modal"><button className="btn-ghost" style={{ fontSize: '0.72rem', padding: '0.3rem 0.75rem' }}>Sign In</button></SignInButton>
          </div>
        </FadeUp>
      )}

      <div className={s.bento}>
        <FadeUp delay={0.14}>
          <div className={s.statsRow}>
            {STATS.map(({ icon: Icon, value, label, color }, i) => (
              <motion.div key={label} className={s.statPill} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 + i * 0.06, duration: 0.35 }}>
                <div className={s.statPillIcon}><Icon size={14} color={color} /></div>
                <div><div className={s.statPillValue} style={{ color }}>{value}</div><div className={s.statPillLabel}>{label}</div></div>
              </motion.div>
            ))}
          </div>
        </FadeUp>

        <div className={s.rowTwoCol}>
          <FadeUp delay={0.22} className={s.bentoCard}>
            <div className={s.cardAccentLine} style={{ background: 'linear-gradient(90deg, var(--clr-cyan), transparent)' }} />
            <div className={s.cardBody}>
              <div className={s.cardHead}>
                <div className={s.cardHeadLeft}><span className={s.cardLabel}>Today&apos;s Schedule</span><span className={s.cardTitle}>{SCHEDULE.length} classes ahead</span></div>
                <span className={s.cardLink}>View calendar <ChevronRight size={11} /></span>
              </div>
              {SCHEDULE.map(({ time, title, room, color }) => (
                <div key={title} className={s.scheduleItem}>
                  <span className={s.scheduleTime}>{time}</span>
                  <div className={s.scheduleBar} style={{ background: color }} />
                  <div className={s.scheduleInfo}><div className={s.scheduleTitle}>{title}</div><div className={s.scheduleRoom}>{room}</div></div>
                </div>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.28} className={s.bentoCard}>
            <div className={s.cardAccentLine} style={{ background: 'linear-gradient(90deg, var(--accent), transparent)' }} />
            <div className={s.cardBody}>
              <div className={s.cardHead}>
                <div className={s.cardHeadLeft}><span className={s.cardLabel}>Task List</span><span className={s.cardTitle}>{TASKS.length} pending</span></div>
                <span className={s.cardLink}>All tasks</span>
              </div>
              {TASKS.map(({ title, due, urgent }) => (
                <div key={title} className={s.taskItem}>
                  <div className={s.taskCheck} style={{ borderColor: urgent ? 'var(--clr-rose)' : undefined }} />
                  <div style={{ flex: 1 }}><div className={s.taskTitle}>{title}</div><div className={s.taskMeta}>{due}</div></div>
                  {urgent && <span className={s.taskUrgentTag} style={{ background: 'rgba(251,113,133,0.12)', color: 'var(--clr-rose)' }}>Urgent</span>}
                </div>
              ))}
            </div>
          </FadeUp>
        </div>

        <div className={s.rowThreeCol}>
          <FadeUp delay={0.34} className={s.bentoCard}>
            <div className={s.cardAccentLine} style={{ background: 'linear-gradient(90deg, var(--clr-emerald), transparent)' }} />
            <div className={s.cardBody}>
              <div className={s.cardHead}><div className={s.cardHeadLeft}><span className={s.cardLabel}>Budget</span><span className={s.cardTitle}>This month</span></div><span className={s.cardLink}><Wallet size={11} /> Track</span></div>
              <div className={s.balanceDisplay}><div className={s.balanceLabel}>Net Balance</div><div className={s.balanceValue}>₹230</div></div>
              {BUDGET.map(({ label, amt, pos }) => (
                <div key={label} className={s.budgetItem}><span className={s.budgetLabel}>{label}</span><span className={s.budgetAmt} style={{ color: pos ? 'var(--clr-emerald)' : 'var(--clr-rose)' }}>{amt}</span></div>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.4} className={s.bentoCard}>
            <div className={s.cardAccentLine} style={{ background: 'linear-gradient(90deg, var(--clr-amber), transparent)' }} />
            <div className={s.cardBody}>
              <div className={s.cardHead}><div className={s.cardHeadLeft}><span className={s.cardLabel}>Daily Habits</span><span className={s.cardTitle}>{HABITS.filter(h => h.done).length} of {HABITS.length} done</span></div></div>
              {HABITS.map(({ name, streak, done }) => (
                <div key={name} className={s.habitItem}>
                  <div className={s.habitRing} style={{ borderColor: done ? 'var(--clr-emerald)' : 'var(--line-mid)', color: done ? 'var(--clr-emerald)' : 'var(--text-dim)' }}>{done ? '✓' : ''}</div>
                  <span className={s.habitName}>{name}</span>
                  <span className={s.habitStreak}>{streak} 🔥</span>
                </div>
              ))}
            </div>
          </FadeUp>

          <FadeUp delay={0.46} className={s.bentoCard}>
            <div className={s.cardAccentLine} style={{ background: 'linear-gradient(90deg, var(--clr-rose), transparent)' }} />
            <PomodoroTimer />
          </FadeUp>
        </div>

        <FadeUp delay={0.52} className={s.notesStrip}>
          <div className={s.notesIcon} style={{ background: 'rgba(167,139,250,0.1)' }}><BookOpen size={15} color="var(--accent-bright)" /></div>
          <div className={s.notesText}><div className={s.notesTitle}>Quick Notes</div><div className={s.notesHint}>{isSignedIn ? 'Your notes will appear here.' : 'Sign in to start taking notes.'}</div></div>
          <ChevronRight size={14} color="var(--text-dim)" />
        </FadeUp>
      </div>
    </DashboardShell>
  );
}
