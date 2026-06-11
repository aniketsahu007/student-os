'use client';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import s from '@/app/section.module.css';

export default function RemindersPage() {
  return (
    <DashboardShell>
      <div className={s.wrap}>
        <motion.div className={s.pageHead} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
          <div className={s.pageLabel}>Alerts</div>
          <h1 className={s.pageTitle}>Reminders</h1>
          <p className={s.pageSub}>Smart reminders powered by your AI bar.</p>
        </motion.div>
        <motion.div className={s.card} style={{ padding:'3rem', textAlign:'center' }} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1, duration:0.4 }}>
          <Bell size={40} color="var(--accent-bright)" style={{ margin:'0 auto 1rem' }} />
          <div style={{ fontSize:'1rem', fontWeight:700, color:'var(--text-hero)', marginBottom:'0.5rem' }}>No reminders yet</div>
          <div style={{ fontSize:'0.85rem', color:'var(--text-dim)', maxWidth:340, margin:'0 auto' }}>
            Try saying <span style={{ color:'var(--accent-bright)' }}>&quot;Remind me to submit assignment at 6pm today&quot;</span> in the AI command bar below.
          </div>
        </motion.div>
      </div>
    </DashboardShell>
  );
}
