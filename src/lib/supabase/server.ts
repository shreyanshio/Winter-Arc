import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient(cookieStore?: ReturnType<typeof cookies>) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id')) {
    return null;
  }

  const store = cookieStore || cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return store.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        try {
          store.set({ name, value, ...options });
        } catch {
          // Can be ignored if called from Server Components
        }
      },
      remove(name: string, options: any) {
        try {
          store.set({ name, value: '', ...options });
        } catch {
          // Can be ignored if called from Server Components
        }
      },
    },
  });
}
