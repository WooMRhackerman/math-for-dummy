import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { AppData, SupabaseConfig, SupabaseUser } from '../types';

export const DEFAULT_SUPABASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  'https://ighvfbwdyrtgkkyhmgzi.supabase.co';

export const DEFAULT_SUPABASE_ANON_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  'sb_publishable_HAP2EPXDYXADjwTeRP0oWg__MQBWg8E';

let supabaseInstance: SupabaseClient | null = null;
let currentUrl = DEFAULT_SUPABASE_URL;
let currentAnonKey = DEFAULT_SUPABASE_ANON_KEY;

export class SupabaseSyncError extends Error {
  public code?: string;
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'SupabaseSyncError';
    this.code = code;
  }
}

/**
 * Returns the active Supabase client singleton, creating it if needed.
 */
export function getSupabaseClient(url?: string, anonKey?: string): SupabaseClient {
  const targetUrl = (url || currentUrl).trim();
  const targetKey = (anonKey || currentAnonKey).trim();

  if (!supabaseInstance || targetUrl !== currentUrl || targetKey !== currentAnonKey) {
    currentUrl = targetUrl;
    currentAnonKey = targetKey;
    supabaseInstance = createClient(currentUrl, currentAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  }

  return supabaseInstance;
}

/**
 * Configures the Supabase client with custom project credentials.
 */
export function configureSupabase(config: SupabaseConfig): SupabaseClient {
  currentUrl = config.url.trim();
  currentAnonKey = config.anonKey.trim();
  supabaseInstance = null;
  return getSupabaseClient(currentUrl, currentAnonKey);
}

/**
 * Gets the current active session from Supabase Auth.
 */
export async function getSupabaseSession(): Promise<Session | null> {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (err) {
    console.error('Failed to get Supabase session:', err);
    return null;
  }
}

/**
 * Gets the current authenticated user from Supabase.
 */
export async function getSupabaseUser(): Promise<SupabaseUser | null> {
  try {
    const client = getSupabaseClient();
    const { data: { user }, error } = await client.auth.getUser();
    if (error || !user) return null;
    return {
      id: user.id,
      email: user.email || ''
    };
  } catch {
    return null;
  }
}

/**
 * Signs in a user using email and password.
 */
export async function signInWithEmail(
  email: string,
  pass: string
): Promise<{ user: User; session: Session }> {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password: pass
  });

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      throw new SupabaseSyncError('이메일 또는 비밀번호가 올바르지 않습니다.', error.code);
    }
    if (error.message.includes('Email not confirmed')) {
      throw new SupabaseSyncError('이메일 인증이 완료되지 않았습니다. 메일함을 확인해주세요.', error.code);
    }
    throw new SupabaseSyncError(error.message, error.code);
  }

  if (!data.user || !data.session) {
    throw new SupabaseSyncError('로그인에 실패했습니다.');
  }

  return { user: data.user, session: data.session };
}

/**
 * Signs up a new user using email and password.
 */
export async function signUpWithEmail(
  email: string,
  pass: string
): Promise<{ user: User | null; session: Session | null }> {
  const client = getSupabaseClient();
  const redirectTo = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : undefined;
  const { data, error } = await client.auth.signUp({
    email: email.trim(),
    password: pass,
    options: {
      emailRedirectTo: redirectTo
    }
  });

  if (error) {
    if (error.message.includes('User already registered')) {
      throw new SupabaseSyncError('이미 가입된 이메일입니다. 로그인을 시도해주세요.', error.code);
    }
    if (error.message.includes('Password should be at least')) {
      throw new SupabaseSyncError('비밀번호는 최소 6자 이상이어야 합니다.', error.code);
    }
    throw new SupabaseSyncError(error.message, error.code);
  }

  return { user: data.user, session: data.session };
}

/**
 * Signs out the current user.
 */
export async function signOutSupabase(): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client.auth.signOut();
  if (error) {
    console.error('Supabase sign out error:', error);
  }
}

/**
 * Pulls AppData from Supabase user_progress table for the authenticated user.
 */
export async function pullFromSupabase(): Promise<{ data: AppData; timestamp: string }> {
  const client = getSupabaseClient();
  const { data: { user }, error: userError } = await client.auth.getUser();

  if (userError || !user) {
    throw new SupabaseSyncError('로그인이 필요합니다. 먼저 로그인해주세요.', 'NOT_AUTHENTICATED');
  }

  const { data, error } = await client
    .from('user_progress')
    .select('data, updated_at')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    if (error.code === '42P01' || error.message.includes('user_progress')) {
      throw new SupabaseSyncError(
        'Supabase에 user_progress 테이블이 없습니다. Supabase SQL Editor에서 테이블을 생성해주세요.',
        'TABLE_NOT_FOUND'
      );
    }
    throw new SupabaseSyncError(error.message, error.code);
  }

  if (!data || !data.data) {
    throw new SupabaseSyncError('클라우드에 저장된 데이터가 없습니다. 먼저 [지금 동기화]를 눌러 저장하세요.', 'NO_REMOTE_DATA');
  }

  return {
    data: data.data as AppData,
    timestamp: data.updated_at
  };
}

/**
 * Pushes AppData to Supabase user_progress table for the authenticated user.
 */
export async function pushToSupabase(data: AppData): Promise<{ timestamp: string }> {
  const client = getSupabaseClient();
  const { data: { user }, error: userError } = await client.auth.getUser();

  if (userError || !user) {
    throw new SupabaseSyncError('로그인이 필요합니다. 먼저 로그인해주세요.', 'NOT_AUTHENTICATED');
  }

  const now = new Date().toISOString();
  const { error } = await client
    .from('user_progress')
    .upsert({
      user_id: user.id,
      data,
      updated_at: now
    }, {
      onConflict: 'user_id'
    });

  if (error) {
    if (error.code === '42P01' || error.message.includes('user_progress')) {
      throw new SupabaseSyncError(
        'Supabase에 user_progress 테이블이 없습니다. Supabase SQL Editor에서 테이블을 생성해주세요.',
        'TABLE_NOT_FOUND'
      );
    }
    throw new SupabaseSyncError(error.message, error.code);
  }

  return { timestamp: now };
}

/**
 * Listens for Supabase Auth state changes (e.g. when returning from email verification redirect).
 */
export function onSupabaseAuthStateChange(
  callback: (user: SupabaseUser | null) => void
) {
  const client = getSupabaseClient();
  const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
    if (session && session.user) {
      callback({ id: session.user.id, email: session.user.email || '' });
    } else {
      callback(null);
    }
  });
  return subscription;
}
