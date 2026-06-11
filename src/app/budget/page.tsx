'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import s from '@/app/section.module.css';

type Tx = { id: number; name: string; amount: number; category: string; emoji: string; date: string };

const INIT_TX: Tx[] = [
  { id:1, name:'Monthly Allowance', amount: 500,  category:'Income',    emoji:'💰', date:'May 1' },
  { id:2, name:'Lunch (canteen)',    amount:-150,  category:'Food',      emoji:'🍱', date:'May 3' },
  { id:3, name:'Bus pass',          amount: -80,  category:'Transport', emoji:'🚌', date:'May 5' },
  { id:4, name:'Textbook',          amount: -40,  category:'Books',     emoji:'📚', date:'May 7' },
  { id:5, name:'Snacks',            amount: -30,  category:'Food',      emoji:'🍕', date:'May 9' },
];

const CATEGORIES = [
  { name:'Food',      emoji:'🍱', color:'var(--clr-amber)' },
  { name:'Transport', emoji:'🚌', color:'var(--clr-cyan)' },
  { name:'Books',     emoji:'📚', color:'var(--accent-bright)' },
  { name:'Income',    emoji:'💰', color:'var(--clr-emerald)' },
  { name:'Other',     emoji:'🛒', color:'var(--clr-rose)' },
];

export default function BudgetPage() {
  const [txs, setTxs]     = useState<Tx[]>(INIT_TX);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]   = useState({ name:'', amount:'', category:'Food', emoji:'🍱' });

  const income   = txs.filter(t => t.amount > 0).reduce((s,t) => s+t.amount, 0);
  const expenses = txs.filter(t => t.amount < 0).reduce((s,t) => s+Math.abs(t.amount), 0);
  const balance  = income - expenses;

  const addTx = () => {
    if (!form.name || !form.amount) return;
    const cat = CATEGORIES.find(c => c.name === form.category)!;
    setTxs(t => [...t, { id:Date.now(), name:form.name, amount:parseFloat(form.amount), category:form.category, emoji:cat.emoji, date:'Today' }]);
    setForm({ name:'', amount:'', category:'Food', emoji:'🍱' });
    setShowForm(false);
  };

  // Category breakdown
  const breakdown = CATEGORIES.map(cat => {
    const spent = txs.filter(t => t.category === cat.name && t.amount < 0).reduce((s,t) => s+Math.abs(t.amount), 0);
    return { ...cat, spent, pct: expenses ? Math.round((spent/expenses)*100) : 0 };
  }).filter(c => c.spent > 0);

  return (
    <DashboardShell>
      <div className={s.wrap}>
        <motion.div className={s.pageHead} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
          <div className={s.pageLabel}>Finance</div>
          <h1 className={s.pageTitle}>Budget Tracker</h1>
          <p className={s.pageSub}>May 2026 · Track every rupee</p>
          <div className={s.pageActions}>
            <button className={s.addBtn} onClick={() => setShowForm(v => !v)}><Plus size={13} style={{display:'inline',marginRight:4}}/>Add Transaction</button>
          </div>
        </motion.div>

        {/* Add form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.2 }}
              className={s.card} style={{ padding:'1.25rem 1.6rem', marginBottom:'1.25rem', display:'flex', gap:'0.75rem', alignItems:'flex-end', flexWrap:'wrap' }}>
              <div style={{ flex:2, minWidth:160 }}>
                <div style={{ fontSize:'0.65rem', color:'var(--text-dim)', marginBottom:4 }}>Description</div>
                <input className={s.addInput} style={{ width:'100%' }} placeholder="e.g. Lunch" value={form.name} onChange={e => setForm(f => ({...f, name:e.target.value}))} />
              </div>
              <div style={{ flex:1, minWidth:100 }}>
                <div style={{ fontSize:'0.65rem', color:'var(--text-dim)', marginBottom:4 }}>Amount (−/+)</div>
                <input className={s.addInput} style={{ width:'100%' }} placeholder="−150 or +500" value={form.amount} onChange={e => setForm(f => ({...f, amount:e.target.value}))} />
              </div>
              <div style={{ flex:1, minWidth:120 }}>
                <div style={{ fontSize:'0.65rem', color:'var(--text-dim)', marginBottom:4 }}>Category</div>
                <select className={s.addInput} style={{ width:'100%' }} value={form.category} onChange={e => setForm(f => ({...f, category:e.target.value}))}>
                  {CATEGORIES.map(c => <option key={c.name}>{c.name}</option>)}
                </select>
              </div>
              <button className={s.addBtn} onClick={addTx}>Save</button>
              <button className={s.addBtnSm} onClick={() => setShowForm(false)}><X size={13} /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <motion.div className={s.budgetStats} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1, duration:0.4 }}>
          <div className={s.budgetStat}><div className={s.budgetStatLabel}>Income</div><div className={s.budgetStatValue} style={{ color:'var(--clr-emerald)' }}>₹{income}</div></div>
          <div className={s.budgetStat}><div className={s.budgetStatLabel}>Expenses</div><div className={s.budgetStatValue} style={{ color:'var(--clr-rose)' }}>₹{expenses}</div></div>
          <div className={s.budgetStat}><div className={s.budgetStatLabel}>Balance</div><div className={s.budgetStatValue} style={{ color: balance>=0 ? 'var(--clr-emerald)' : 'var(--clr-rose)' }}>₹{balance}</div></div>
        </motion.div>

        <motion.div className={s.twoCol} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.18, duration:0.4 }}>
          {/* Transactions */}
          <div className={s.card} style={{ padding:'1.4rem 1.6rem' }}>
            <div className={s.cardHead}><div className={s.cardLabel}>Transactions</div><div className={s.cardTitle}>{txs.length} entries</div></div>
            <div className={s.txList}>
              {[...txs].reverse().map(tx => (
                <div key={tx.id} className={s.txItem}>
                  <div className={s.txEmoji} style={{ background: tx.amount>0 ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.05)' }}>{tx.emoji}</div>
                  <div className={s.txDetails}><div className={s.txName}>{tx.name}</div><div className={s.txDate}>{tx.date} · {tx.category}</div></div>
                  <div className={s.txAmt} style={{ color: tx.amount>0 ? 'var(--clr-emerald)' : 'var(--clr-rose)' }}>
                    {tx.amount>0 ? '+' : '−'}₹{Math.abs(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Category breakdown */}
          <div className={s.card} style={{ padding:'1.4rem 1.6rem' }}>
            <div className={s.cardHead}><div className={s.cardLabel}>By Category</div><div className={s.cardTitle}>Where it goes</div></div>
            {breakdown.map(cat => (
              <div key={cat.name} className={s.catBar}>
                <div className={s.catBarLabel}><span>{cat.emoji} {cat.name}</span><span style={{ color:'var(--text-dim)' }}>₹{cat.spent} · {cat.pct}%</span></div>
                <div className={s.catBarTrack}><motion.div className={s.catBarFill} style={{ background: cat.color }} initial={{ width:0 }} animate={{ width:`${cat.pct}%` }} transition={{ delay:0.3, duration:0.7, ease:'easeOut' }} /></div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardShell>
  );
}
