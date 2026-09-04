import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * RLS를 완전히 우회하는 관리자 권한 클라이언트. service_role 키를 씀 —
 * "server-only"라 실수로 클라이언트 컴포넌트에서 import하면 빌드 자체가 실패함.
 *
 * 일반 로그인 세션(anon key + 쿠키)으로는 "본인 계정이라도" 못 하는 작업에만 씀.
 * 지금은 회원 탈퇴(auth.users 삭제) 하나뿐 — RLS는 테이블 row 접근 권한이지
 * auth.users 자체를 지우는 건 별개의 관리자 API라 이 클라이언트가 필요함
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  if (!supabaseUrl || !serviceRoleKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[supabase-admin] NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다."
      );
    }
    return null;
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
