import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { SkinProfile } from "@/lib/skinProfile";

interface SkinProfileRow {
  skin_type: SkinProfile["baseType"];
  sensitive: boolean;
}

/**
 * 로그인한 사용자의 계정에 저장된 피부 프로필을 가져옴.
 * 로컬(localStorage) 값과는 별개 — 로그인 안 했거나 계정에 저장한 적 없으면 null.
 * 마이페이지처럼 항상 로그인된 상태에서만 쓰는 화면에서 이 값을 그대로 신뢰해도 됨
 */
export async function getSkinProfileFromAccount(): Promise<SkinProfile | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("skin_profiles")
    .select("skin_type, sensitive")
    .maybeSingle<SkinProfileRow>();

  if (error) {
    console.error("[skinProfile] 조회 실패:", error.message);
    return null;
  }
  if (!data) return null;

  return { baseType: data.skin_type, sensitive: data.sensitive };
}
