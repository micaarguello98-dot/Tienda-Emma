import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Durante el build de GitHub Pages, estas variables pueden no estar.
    // Retornamos un objeto dummy para que no rompa el Build.
    return {} as any;
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
