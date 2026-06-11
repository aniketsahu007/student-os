'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import s from '@/app/section.module.css';

type Priority = 'urgent' | 'medium' | 'low';
type Task = { id: number; title: string; due: string; priority: Priority; done: boolean };

const PRIORITY_STYLE: Record<Priority, { bg: string; color: string }> = {
  urgent: { bg: 'rgba(251,113,133,0.12)', color: 'var(--clr-rose)' },
  medium: { bg: 'rgba(251,191,36,0.12)',  color: 'var(--clr-amber)' },
  low:    { bg: 'rgba(139,92,246,0.10)',  color: 'var(--accent-bright)' },
};

const INIT: Task[] = [
  { id:1, title:'Submit Assignment 3', due:'Today at 6 PM',     priority:'urgent', done:false },
  { id:2, title:'Read Chapter 4',      due:'Tomorrow',           priority:'medium', done:false },
  { id:3, title:'Prepare Lab Report',  due:'May 12',             priority:'medium', done:false },
  { id:4, title:'Review lecture notes',due:'May 11',             priority:'low',    done:false },
  { id:5, title:'Math problem set',    due:'May 13',             priority:'low',    done:true  },
];

type Filter = 'all' | 'today' | 'upcoming' | 'done';

export default function TodosPage() {
  const [tasks, setTasks]   = useState<Task[]>(INIT);
  const [filter, setFilter] = useState<Filter>('all');
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks(t => [...t, { id: Date.now(), title: newTask.trim(), due: 'No due date', priority, done: false }]);
    setNewTask('');
  };
  const toggle = (id: number) => setTasks(t => t.map(x => x.id === id ? { ...x, done: !x.done } : x));
  const remove = (id: number) => setTasks(t => t.filter(x => x.id !== id));

  const filtered = tasks.filter(t => {
    if (filter === 'done')     return t.done;
    if (filter === 'today')    return !t.done && t.due.toLowerCase().includes('today');
    if (filter === 'upcoming') return !t.done && !t.due.toLowerCase().includes('today');
    return !t.done;
  });

  return (
    <DashboardShell>
      <div className={s.wrap}>
        <motion.div className={s.pageHead} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
          <div className={s.pageLabel}>Productivity</div>
          <h1 className={s.pageTitle}>To-Do List</h1>
          <p className={s.pageSub}>{tasks.filter(t=>!t.done).length} tasks remaining · {tasks.filter(t=>t.done).length} completed</p>
        </motion.div>

        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1, duration:0.4 }}>
          {/* Add bar */}
          <div className={s.addBar}>
            <input
              className={s.addInput} value={newTask} placeholder="Add a new task…"
              onChange={e => setNewTask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
            />
            <select
              value={priority} onChange={e => setPriority(e.target.value as Priority)}
              style={{ background:'var(--bg-raised)', border:'1px solid var(--line-soft)', borderRadius:'var(--r-sm)', padding:'0.55rem 0.75rem', color:'var(--text-body)', fontFamily:'inherit', fontSize:'0.82rem', outline:'none' }}
            >
              <option value="urgent">🔴 Urgent</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟣 Low</option>
            </select>
            <button className={s.addBtn} onClick={addTask}>Add</button>
          </div>

          {/* Filter tabs */}
          <div className={s.tabs}>
            {(['all','today','upcoming','done'] as Filter[]).map(f => (
              <button key={f} className={`${s.tab} ${filter===f ? s.tabActive : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Task list */}
          <div className={`${s.card} ${s.cardPad}`}>
            <AnimatePresence initial={false}>
              {filtered.length === 0
                ? <div style={{ padding:'2rem', textAlign:'center', color:'var(--text-dim)', fontSize:'0.85rem' }}>All clear here 🎉</div>
                : filtered.map(task => (
                  <motion.div
                    key={task.id} className={s.todoItem}
                    initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, height:0 }}
                    transition={{ duration:0.25 }}
                  >
                    <button className={`${s.todoCheckbox} ${task.done ? s.done : ''}`} onClick={() => toggle(task.id)}>
                      {task.done ? '✓' : ''}
                    </button>
                    <div className={s.todoText}>
                      <div className={`${s.todoTitle} ${task.done ? s.done : ''}`}>{task.title}</div>
                      <div className={s.todoMeta}>{task.due}</div>
                    </div>
                    <span className={s.todoPriority} style={PRIORITY_STYLE[task.priority]}>{task.priority}</span>
                    <button className={s.todoDelete} onClick={() => remove(task.id)}><Trash2 size={13} /></button>
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </DashboardShell>
  );
}
