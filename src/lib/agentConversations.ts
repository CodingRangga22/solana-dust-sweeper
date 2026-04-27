import { supabase } from './supabase';
import { ChatMessageModel } from '../hooks/useArsweepChat';

// ── Save messages session ke Supabase ─────────────────────────────────
export async function saveSessionToSupabase(
  userId: string,
  sessionId: string,
  messages: ChatMessageModel[]
): Promise<void> {
  if (!userId || !sessionId || messages.length === 0) return;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  // Hapus messages lama untuk session ini dulu
  await supabase
    .from('agent_conversations')
    .delete()
    .eq('user_id', userId)
    .eq('session_id', sessionId);

  // Insert semua messages session ini
  const rows = messages.map((m) => ({
    user_id: userId,
    session_id: sessionId,
    role: m.role,
    content: m.content,
    created_at: m.timestamp?.toISOString() ?? new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
  }));

  await supabase.from('agent_conversations').insert(rows);
}

// ── Load messages session dari Supabase ───────────────────────────────
export async function loadSessionFromSupabase(
  userId: string,
  sessionId: string
): Promise<ChatMessageModel[]> {
  const { data, error } = await supabase
    .from('agent_conversations')
    .select('id, role, content, created_at')
    .eq('user_id', userId)
    .eq('session_id', sessionId)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    role: row.role as 'user' | 'assistant',
    content: row.content,
    timestamp: new Date(row.created_at),
  }));
}

// ── Load semua sessions user untuk sidebar ────────────────────────────
export async function loadUserSessionsFromSupabase(
  userId: string
): Promise<{ sessionId: string; preview: string; lastActive: Date }[]> {
  const { data, error } = await supabase
    .from('agent_conversations')
    .select('session_id, content, created_at')
    .eq('user_id', userId)
    .eq('role', 'user')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  // Group by session_id, ambil pesan user pertama sebagai preview
  const sessionMap = new Map<string, { preview: string; lastActive: Date }>();
  for (const row of data) {
    if (!sessionMap.has(row.session_id)) {
      sessionMap.set(row.session_id, {
        preview: row.content.slice(0, 40) + (row.content.length > 40 ? '…' : ''),
        lastActive: new Date(row.created_at),
      });
    }
  }

  return Array.from(sessionMap.entries()).map(([sessionId, val]) => ({
    sessionId,
    ...val,
  }));
}

// ── Perpanjang expires_at session yang masih aktif ────────────────────
export async function refreshSessionExpiry(
  userId: string,
  sessionId: string
): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await supabase
    .from('agent_conversations')
    .update({ expires_at: expiresAt.toISOString() })
    .eq('user_id', userId)
    .eq('session_id', sessionId);
}
