// Notes CRUD helpers using Clerk + Supabase
import { createClerkSupabaseClient } from './supabase';

export type NoteRow = {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  updated_at: string;
  created_at: string;
};

/**
 * Upsert the Clerk user into public.users before any note write.
 * The notes table has notes.user_id → public.users(id) FK,
 * so the user row must exist first or inserts will fail.
 */
async function ensureUserExists(
  supabase: ReturnType<typeof createClerkSupabaseClient>,
  userId: string,
  email: string
) {
  const { error } = await supabase
    .from('users')
    .upsert({ id: userId, email }, { onConflict: 'id' });
  if (error) throw new Error(`Could not sync user profile: ${error.message}`);
}

export async function fetchNotes(clerkToken: string): Promise<NoteRow[]> {
  const supabase = createClerkSupabaseClient(clerkToken);
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data as NoteRow[];
}

export async function createNote(
  clerkToken: string,
  userId: string,
  email: string,
  title: string,
  content: string
): Promise<NoteRow> {
  const supabase = createClerkSupabaseClient(clerkToken);
  // Ensure the user row exists first (required by FK constraint)
  await ensureUserExists(supabase, userId, email);
  const { data, error } = await supabase
    .from('notes')
    .insert({ user_id: userId, title, content })
    .select()
    .single();
  if (error) throw error;
  return data as NoteRow;
}

export async function updateNote(
  clerkToken: string,
  noteId: string,
  title: string,
  content: string
): Promise<void> {
  const supabase = createClerkSupabaseClient(clerkToken);
  const { error } = await supabase
    .from('notes')
    .update({ title, content, updated_at: new Date().toISOString() })
    .eq('id', noteId);
  if (error) throw error;
}

export async function deleteNote(
  clerkToken: string,
  noteId: string
): Promise<void> {
  const supabase = createClerkSupabaseClient(clerkToken);
  const { error } = await supabase.from('notes').delete().eq('id', noteId);
  if (error) throw error;
}
