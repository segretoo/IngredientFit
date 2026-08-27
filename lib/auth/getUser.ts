import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface AuthUser {
  id: string;
  email: string | null;
}

/**
 * 현재 로그인한 사용자 정보를 서버(쿠키 기반 세션)에서 읽어옴.
 * Server Component 페이지/레이아웃에서 호출해서 Header, MobileHeader 등에
 * prop으로 내려주는 용도.
 *
 * Header 자체는 스크롤 감지 때문에 클라이언트 컴포넌트라 세션을 직접 못 읽음 —
 * 그래서 이 함수를 부모(서버 컴포넌트)에서 호출해 prop으로 전달하는 구조.
 *
 * 로그인 안 했거나 Supabase 환경변수 미설정 상태면 null 반환 —
 * 호출하는 쪽은 null 체크 후 "로그인" 링크 등으로 폴백해야 함
 */
export async function getUser(): Promise<AuthUser | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  return {
    id: data.user.id,
    email: data.user.email ?? null,
  };
}
