'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, CalendarDays, CheckSquare,
  Wallet, Flame, Clock, FileText, Bell, Zap,
} from 'lucide-react';
import s from '@/app/dashboard.module.css';

const NAV_MAIN = [
  { icon: LayoutDashboard, label: 'Dashboard',  href: '/dashboard' },
  { icon: CalendarDays,    label: 'Calendar',   href: '/calendar' },
  { icon: CheckSquare,     label: 'To-Do',      href: '/todos' },
  { icon: Bell,            label: 'Reminders',  href: '/reminders' },
  { icon: FileText,        label: 'Notes',      href: '/notes' },
];

const NAV_TOOLS = [
  { icon: Wallet, label: 'Budget',   href: '/budget' },
  { icon: Flame,  label: 'Habits',   href: '/habits' },
  { icon: Clock,  label: 'Pomodoro', href: '/pomodoro' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  return (
    <motion.aside
      className={s.sidebar}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Logo */}
      <div className={s.sidebarLogo}>
        <div className={s.logoMark}>S</div>
        <div>
          <div className={s.logoText}>Student OS</div>
          <div className={s.logoSub}>AI Dashboard</div>
        </div>
      </div>

      {/* Main nav */}
      <nav className={s.navGroup}>
        <div className={s.navGroupLabel}>Workspace</div>
        {NAV_MAIN.map(({ icon: Icon, label, href }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={label}
              href={href}
              className={`${s.navItem} ${isActive ? s.active : ''}`}
              prefetch={false}
            >
              <Icon className={s.navIcon} size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Tools nav */}
      <nav className={s.navGroup}>
        <div className={s.navGroupLabel}>Tools</div>
        {NAV_TOOLS.map(({ icon: Icon, label, href }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={`${s.navItem} ${isActive ? s.active : ''}`}
              prefetch={false}
            >
              <Icon className={s.navIcon} size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom auth */}
      <div className={s.sidebarBottom}>
        {isSignedIn ? (
          <UserButton />
        ) : (
          <>
            <SignUpButton mode="modal">
              <button className="btn-cta" style={{ width: '100%', justifyContent: 'center' }}>
                <Zap size={12} /> Get Started
              </button>
            </SignUpButton>
            <SignInButton mode="modal">
              <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>
                Sign In
              </button>
            </SignInButton>
          </>
        )}
      </div>
    </motion.aside>
  );
}
