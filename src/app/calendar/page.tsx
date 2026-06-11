'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import s from '@/app/section.module.css';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

type CalendarEvent = {
  id: string;
  summary: string;
  start: { dateTime: string };
  end: { dateTime: string };
  location?: string;
  colorId?: string;
};

/* ── Fallback demo events ── */
const DEMO_EVENTS: CalendarEvent[] = [
  { id:'d1', summary:'Mathematics 101', start:{ dateTime:'2026-05-10T09:00:00' }, end:{ dateTime:'2026-05-10T10:30:00' }, location:'Room B-204', colorId:'1' },
  { id:'d2', summary:'Applied Physics',  start:{ dateTime:'2026-05-10T11:30:00' }, end:{ dateTime:'2026-05-10T13:00:00' }, location:'Lab A-102',  colorId:'9' },
  { id:'d3', summary:'CS Algorithms',   start:{ dateTime:'2026-05-10T14:00:00' }, end:{ dateTime:'2026-05-10T15:30:00' }, location:'Room C-301', colorId:'2' },
  { id:'d4', summary:'Project Deadline',start:{ dateTime:'2026-05-12T18:00:00' }, end:{ dateTime:'2026-05-12T18:00:00' }, colorId:'3' },
  { id:'d5', summary:'Study Group',     start:{ dateTime:'2026-05-14T15:00:00' }, end:{ dateTime:'2026-05-14T17:00:00' }, location:'Library',    colorId:'5' },
  { id:'d6', summary:'Seminar',         start:{ dateTime:'2026-05-17T10:00:00' }, end:{ dateTime:'2026-05-17T11:00:00' }, location:'Hall A',     colorId:'9' },
  { id:'d7', summary:'Exam Prep',       start:{ dateTime:'2026-05-20T16:00:00' }, end:{ dateTime:'2026-05-20T18:00:00' }, colorId:'3' },
];

function buildCalendar(year: number, month: number) {
  const firstDay      = new Date(year, month, 1).getDay();
  const daysInMonth   = new Date(year, month + 1, 0).getDate();
  const daysInPrev    = new Date(year, month, 0).getDate();
  const cells: { day: number; own: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, own: false });
  for (let d = 1; d <= daysInMonth; d++)  cells.push({ day: d, own: true });
  while (cells.length < 42)               cells.push({ day: cells.length - firstDay - daysInMonth + 1, own: false });
  return cells;
}

function toKey(y: number, m: number, d: number) {
  return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

export function eventDateKey(ev: CalendarEvent): string {
  if (!ev.start.dateTime) return '';
  return ev.start.dateTime.substring(0, 10);
}

export function eventTimeStr(ev: CalendarEvent): string {
  if (!ev.start.dateTime) return 'All day';
  const d = new Date(ev.start.dateTime);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function eventColor(ev: CalendarEvent): string {
  const colors: Record<string, string> = {
    '1': '#7986cb', '2': '#33b679', '3': '#8e24aa', '4': '#e67c73',
    '5': '#f6bf26', '6': '#f4511e', '7': '#039be5', '8': '#616161',
    '9': '#3f51b5', '10': '#0b8043', '11': '#d50000',
  };
  return (ev.colorId && colors[ev.colorId]) ? colors[ev.colorId] : '#039be5';
}

export default function CalendarPage() {
  const today = new Date();

  const [year, setYear]       = useState(today.getFullYear());
  const [month, setMonth]     = useState(today.getMonth());
  const [selected, setSelected] = useState(toKey(today.getFullYear(), today.getMonth(), today.getDate()));
  const events = DEMO_EVENTS; // Hardcoded to demo events

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); };

  const eventsForKey = (key: string) => events.filter(e => eventDateKey(e) === key);
  const cells        = buildCalendar(year, month);
  const selectedEvs  = eventsForKey(selected);

  return (
    <DashboardShell>
      <div className={s.wrap}>
        <motion.div className={s.pageHead} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
          <div className={s.pageLabel}>Schedule</div>
          <h1 className={s.pageTitle}>Calendar</h1>
          <p className={s.pageSub}>
            Currently showing offline demo data.
          </p>
        </motion.div>

        <motion.div className={s.calWrap} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1, duration:0.4 }}>
          {/* Calendar grid */}
          <div className={s.card} style={{ padding:'1.4rem 1.6rem' }}>
            <div className={s.calHeader}>
              <div className={s.calMonthNav}>
                <button className={s.calNavBtn} onClick={prevMonth}><ChevronLeft size={14} /></button>
                <span className={s.calMonth}>{MONTHS[month]} {year}</span>
                <button className={s.calNavBtn} onClick={nextMonth}><ChevronRight size={14} /></button>
              </div>
            </div>

            <div className={s.calDaysHeader}>
              {DAYS.map(d => <div key={d} className={s.calDayName}>{d}</div>)}
            </div>

            <div className={s.calGrid}>
              {cells.map((cell, i) => {
                const key    = cell.own ? toKey(year, month, cell.day) : '';
                const dots   = cell.own ? eventsForKey(key) : [];
                const isToday = key === toKey(today.getFullYear(), today.getMonth(), today.getDate());
                const isSel   = key === selected;
                return (
                  <div
                    key={i}
                    className={`${s.calCell} ${!cell.own ? s.calCellOther : ''} ${isToday ? s.calCellToday : ''} ${isSel && !isToday ? s.calCellSelected : ''}`}
                    onClick={() => cell.own && setSelected(key)}
                  >
                    <span className={s.calCellNum}>{cell.day}</span>
                    {dots.length > 0 && (
                      <div className={s.calDots}>
                        {dots.slice(0,3).map((e, j) => (
                          <div key={j} className={s.calDot} style={{ background: eventColor(e) }} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Events panel */}
          <div className={s.card} style={{ padding:'1.4rem 1.6rem' }}>
            <div className={s.cardHead}>
              <div>
                <div className={s.cardLabel}>Events</div>
                <div className={s.cardTitle}>
                  {selected
                    ? new Date(selected + 'T00:00').toLocaleDateString('en-IN', { weekday:'long', month:'short', day:'numeric' })
                    : 'Select a day'}
                </div>
              </div>
              <span style={{ fontSize:'0.72rem', color:'var(--text-dim)' }}>
                {selectedEvs.length} event{selectedEvs.length !== 1 ? 's' : ''}
              </span>
            </div>

            {selectedEvs.length === 0
              ? (
                <div className={s.calEmpty}>
                  No events on this day.
                  <span style={{ display:'block', marginTop:4, fontSize:'0.75rem' }}>
                    Use &ldquo;Add [event] on [date]&rdquo; in the AI bar.
                  </span>
                </div>
              )
              : (
                <div className={s.calEventList}>
                  {selectedEvs.map((e, i) => (
                    <motion.div key={e.id ?? i} className={s.calEventItem} initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.06, duration:0.25 }}>
                      <span className={s.calEventTime}>{eventTimeStr(e)}</span>
                      <div className={s.calEventBar} style={{ background: eventColor(e) }} />
                      <div>
                        <div className={s.calEventTitle}>{e.summary}</div>
                        {e.location && <div className={s.calEventRoom}>{e.location}</div>}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
          </div>
        </motion.div>
      </div>
    </DashboardShell>
  );
}
