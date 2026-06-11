'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, useAuth } from '@clerk/nextjs';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import DashboardShell from '@/components/DashboardShell';
import { fetchNotes, createNote, updateNote, deleteNote, type NoteRow } from '@/lib/notes';
import s from '@/app/section.module.css';

/* ── Local fallback note (used when signed out) ── */
const DEMO_NOTES: NoteRow[] = [
  {
    id: 'demo-1',
    user_id: '',
    title: 'CS Algorithms — Lecture 5',
    content: '# Binary Search Trees\n\nA BST is a binary tree where every node satisfies:\n- Left subtree keys < node key\n- Right subtree keys > node key\n\n## Time Complexity\n- Search: O(log n) average\n- Insert: O(log n) average',
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    user_id: '',
    title: 'Physics Lab Notes',
    content: '## Experiment: Simple Pendulum\n\nT = 2π√(L/g)\n\nObservations:\n- L = 0.5m → T = 1.42s\n- L = 1.0m → T = 2.01s',
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  },
];

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

export default function NotesPage() {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();

  const [notes, setNotes]         = useState<NoteRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle]         = useState('');
  const [content, setContent]     = useState('');
  const [saved, setSaved]         = useState(true);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);

  /* ── Load notes ── */
  const loadNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isSignedIn) {
        setNotes(DEMO_NOTES);
        openNote(DEMO_NOTES[0]);
        return;
      }
      const token = await getToken({ template: 'supabase' }).catch(() => null);
      if (!token) {
        // Could not get Clerk token — fall back to demo data
        setNotes(DEMO_NOTES);
        openNote(DEMO_NOTES[0]);
        setError('auth_error');
        return;
      }
      const data = await fetchNotes(token);
      setNotes(data);
      if (data.length > 0 && !selectedId) openNote(data[0]);
    } catch (e) {
      setError((e as Error).message);
      setNotes(DEMO_NOTES);
      openNote(DEMO_NOTES[0]);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, getToken]);


  useEffect(() => { loadNotes(); }, [loadNotes]);

  /* ── Open a note in the editor ── */
  function openNote(note: NoteRow) {
    setSelectedId(note.id);
    setTitle(note.title);
    setContent(note.content ?? '');
    setSaved(true);
  }

  /* ── Save note to Supabase ── */
  const saveNote = useCallback(async () => {
    if (!selectedId || !isSignedIn) { setSaved(true); return; }
    setSaving(true);
    setError(null);
    try {
      const token = await getToken({ template: 'supabase' }).catch(() => null);
      if (!token) throw new Error('Could not get auth token. Check Supabase JWKS configuration.');

      if (selectedId.startsWith('new-')) {
        // Create
        const created = await createNote(token, user!.id, user!.primaryEmailAddress?.emailAddress || 'no-email', title, content);
        setNotes(ns => ns.map(n => n.id === selectedId ? created : n));
        setSelectedId(created.id);
      } else {
        // Update
        await updateNote(token, selectedId, title, content);
        setNotes(ns => ns.map(n => n.id === selectedId ? { ...n, title, content, updated_at: new Date().toISOString() } : n));
      }
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }, [selectedId, isSignedIn, getToken, user, title, content]);

  /* ── New note ── */
  const newNote = useCallback(async () => {
    const tempId = `new-${Date.now()}`;
    const tempNote: NoteRow = {
      id: tempId,
      user_id: user?.id ?? '',
      title: 'Untitled note',
      content: '',
      updated_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    setNotes(ns => [tempNote, ...ns]);
    openNote(tempNote);
  }, [user]);

  /* ── Delete note ── */
  const removeNote = useCallback(async (id: string) => {
    const next = notes.filter(n => n.id !== id);
    setNotes(next);
    if (selectedId === id) {
      if (next.length > 0) openNote(next[0]);
      else { setSelectedId(null); setTitle(''); setContent(''); }
    }
    if (!id.startsWith('new-') && isSignedIn) {
      try {
        const token = await getToken({ template: 'supabase' });
        if (token) await deleteNote(token, id);
      } catch { /* silent */ }
    }
  }, [notes, selectedId, isSignedIn, getToken]);

  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const selectedNote = notes.find(n => n.id === selectedId);

  return (
    <DashboardShell>
      <div className={s.wrap}>
        <motion.div className={s.pageHead} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}>
          <div className={s.pageLabel}>Notes</div>
          <h1 className={s.pageTitle}>Quick Notes</h1>
          <p className={s.pageSub}>
            {isSignedIn
              ? `${notes.length} note${notes.length !== 1 ? 's' : ''} · synced to Supabase`
              : 'Sign in to save notes to your account'}
          </p>
          {error ? (
            <div style={{ marginTop:'0.75rem', fontSize:'0.75rem', padding:'0.6rem 1rem', borderRadius:'var(--r-sm)', background:'rgba(251,113,133,0.06)', border:'1px solid rgba(251,113,133,0.2)', color:'var(--clr-rose)', maxWidth:560 }}>
              ⚠ {error === 'auth_error' ? 'Could not authenticate with Supabase — ensure the Clerk JWKS URL is configured in Supabase → Data API → JWT Settings.' : error} Showing demo data.
            </div>
          ) : null}
        </motion.div>

        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1, duration:0.4 }}>
          <div className={s.notesSplit}>
            {/* Left: note list */}
            <div className={s.notesList}>
              <div className={s.notesListHead}>
                <span className={s.notesListTitle}>All Notes</span>
                <button className={s.addBtnSm} onClick={newNote} disabled={!isSignedIn} title={!isSignedIn ? 'Sign in to create notes' : undefined}>
                  <Plus size={12} style={{ display:'inline', marginRight:2 }} />New
                </button>
              </div>

              {loading
                ? <div style={{ padding:'2rem', textAlign:'center', color:'var(--text-dim)' }}><Loader2 size={18} style={{ animation:'spin 1s linear infinite', margin:'0 auto' }} /></div>
                : notes.length === 0
                  ? <div style={{ padding:'2rem', textAlign:'center', color:'var(--text-dim)', fontSize:'0.82rem' }}>No notes yet.<br />Click &quot;New&quot; to start.</div>
                  : (
                    <AnimatePresence initial={false}>
                      {notes.map(note => (
                        <motion.div
                          key={note.id}
                          className={`${s.noteItem} ${selectedId===note.id ? s.noteItemActive : ''}`}
                          onClick={() => openNote(note)}
                          initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0 }}
                          transition={{ duration:0.2 }}
                          style={{ position:'relative' }}
                        >
                          <div className={s.noteItemTitle}>{note.title}</div>
                          <div className={s.noteItemPreview}>
                            {(note.content ?? '').replace(/[#*`]/g, '').split('\n').find(l => l.trim()) || 'Empty note'}
                          </div>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:4 }}>
                            <div className={s.noteItemDate}>{relativeTime(note.updated_at)}</div>
                            <button
                              onClick={e => { e.stopPropagation(); removeNote(note.id); }}
                              style={{ background:'transparent', border:'none', color:'var(--text-dim)', cursor:'pointer', padding:2, opacity:0.6, fontSize:'0.7rem' }}
                              title="Delete"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
            </div>

            {/* Right: editor */}
            <div className={s.notesEditor}>
              {selectedNote ? (
                <>
                  <div className={s.notesEditorBar}>
                    <input
                      className={s.notesTitleInput}
                      value={title}
                      placeholder="Note title…"
                      onChange={e => { setTitle(e.target.value); setSaved(false); }}
                    />
                    <span className={s.notesWordCount}>{words}w</span>
                    {!saved && <span style={{ fontSize:'0.68rem', color:'var(--clr-amber)' }}>●  Unsaved</span>}
                    <button className={s.notesSaveBtn} onClick={saveNote} disabled={saving || !isSignedIn}>
                      {saving ? <Loader2 size={12} style={{ animation:'spin 1s linear infinite' }} /> : saved ? 'Saved ✓' : 'Save'}
                    </button>
                  </div>
                  <textarea
                    className={s.notesTextarea}
                    value={content}
                    placeholder={'Start writing…\n\nMarkdown supported:\n# Heading\n**bold**, *italic*\n- list item'}
                    onChange={e => { setContent(e.target.value); setSaved(false); }}
                  />
                  {!isSignedIn && (
                    <div style={{ padding:'0.5rem 1.4rem', fontSize:'0.72rem', color:'var(--clr-amber)', borderTop:'1px solid var(--line-faint)', background:'rgba(251,191,36,0.04)' }}>
                      ⚠ Sign in to save your notes to Supabase — they&apos;ll be lost on refresh.
                    </div>
                  )}
                </>
              ) : (
                <div className={s.notesEmpty}>
                  <span style={{ fontSize:'2rem' }}>📝</span>
                  <span>Select a note or create a new one</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Spinner keyframes */}
      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </DashboardShell>
  );
}
