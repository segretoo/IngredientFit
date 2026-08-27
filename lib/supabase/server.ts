import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * 서버(Route Handler, Server Component, Server Action)용 Supabase 클라이언트.
 * 쿠키로 세션을 읽고 쓰기 때문에, 로그인 후 새로고침해도 서버에서
 * 로그인 상태를 알 수 있음. 브라우저용(client.ts)과는 별개 파일 —
 * 서버 코드에서는 반드시 이 파일을 써야 함
 */
export async function getSupabaseServerClient(): Promise<SupabaseClient | null> {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY가 설정되지 않았습니다."
      );
    }
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Server Component 안에서 호출되면 쿠키 쓰기가 막혀있음.
          // middleware에서 세션 갱신을 따로 처리한다면 무시해도 안전 —
          // 지금은 Route Handler에서만 쓰니 해당 없음
        }
      },
    },
  });
}
