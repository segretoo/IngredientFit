import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

/**
 * Supabase 클라이언트 가져옴.
 * .env.local에 NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
 * 설정 전까진 null 반환이라, 호출하는 쪽에서 반드시 null 체크 후
 * 더미 데이터(lib/products.ts)로 폴백해야 함
 *
 * createBrowserClient(@supabase/ssr)로 세션을 쿠키에 저장함 —
 * lib/supabase/server.ts(서버용)와 쿠키를 공유해야 OAuth 콜백에서
 * 코드 교환(exchangeCodeForSession)이 정상 동작함
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (client) return client;
  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않아 더미 데이터로 동작합니다."
      );
    }
    return null;
  }
  client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return client;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}
