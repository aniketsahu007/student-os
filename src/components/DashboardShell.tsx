'use client';

import Sidebar from '@/components/Sidebar';
import AICommandBar from '@/components/AICommandBar';
import s from '@/app/dashboard.module.css';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={s.shell}>
      <Sidebar />
      <main className={s.main}>{children}</main>
      <AICommandBar />
    </div>
  );
}
