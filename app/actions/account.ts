"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

interface ActionResult {
  ok: boolean;
  error?: string;
}

/**
 * 회원 탈퇴. auth.users에서 계정을 지우면, schema.sql에 걸어둔
 * "on delete cascade" 덕분에 favorites/skin_profiles/recommendation_history/
 * feedback/user_products 등 연결된 데이터가 전부 자동으로 같이 삭제됨 —
 * 테이블마다 따로 지우는 코드를 안 짜도 됨(DB가 정합성을 보장).
 *
 * 지울 대상 id를 파라미터로 안 받는 게 중요함 — 클라이언트가 임의로 다른
 * 사람 id를 넘겨서 지우게 하면 안 되니, 반드시 지금 이 요청의 로그인 세션에서
 * 직접 id를 가져옴(관리자 클라이언트는 "누구든" 지울 수 있는 권한이라
 * 이 확인을 서버가 대신 해줘야 함)
 */
export async function deleteAccount(): Promise<ActionResult> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, error: "not_configured" };

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, error: "not_logged_in" };

  const admin = getSupabaseAdminClient();
  if (!admin) return { ok: false, error: "admin_not_configured" };

  const { error } = await admin.auth.admin.deleteUser(userData.user.id);
  if (error) {
    console.error("[account] 탈퇴 실패:", error.message);
    return { ok: false, error: error.message };
  }

  // 계정은 지워졌지만 이 브라우저의 세션 쿠키는 남아있을 수 있어서 정리
  await supabase.auth.signOut();

  return { ok: true };
}
