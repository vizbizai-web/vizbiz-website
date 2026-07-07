export type SupabaseJson = string | number | boolean | null | SupabaseJson[] | { [key: string]: SupabaseJson };

export function isSupabaseRestConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getSupabaseUrl(): string {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL not configured');
  return url;
}

function getSupabaseServiceKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured');
  return key;
}

export async function supabaseRest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const key = getSupabaseServiceKey();
  const res = await fetch(`${getSupabaseUrl()}/rest/v1${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase REST ${path} failed: ${res.status} ${text}`);
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
