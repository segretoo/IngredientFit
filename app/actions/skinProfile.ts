"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSkinProfileFromAccount } from "@/lib/skinProfileDb";
import type { SkinProfile } from "@/lib/skinProfile";

interface ActionResult {
  ok: boolean;
  error?: string;
}

/**
 * 진단 결과를 계정에 저장(upsert). 이미 저장된 게 있으면 최신 결과로 덮어씀
 * (재진단 = 최신값이 항상 이김, 별도 히스토리는 안 남김 — 즐겨찾기와 달리
 * "지금 내 피부 타입"은 딱 하나만 의미 있는 값이라 히스토리 개념이 안 맞음)
 */
export async function saveSkinProfileToAccount(profile: SkinProfile): Promise<ActionResult> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, error: "not_configured" };

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, error: "not_logged_in" };

  const { error } = await supabase.from("skin_profiles").upsert({
    user_id: userData.user.id,
    skin_type: profile.baseType,
    sensitive: profile.sensitive,
    source: "quiz",
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error("[skinProfile] 저장 실패:", error.message);
    return { ok: false, error: error.message };
  }

  revalidatePath("/mypage");
  return { ok: true };
}

/**
 * 클라이언트 컴포넌트(useSkinProfileLoginSync)에서 계정 프로필을 읽어오기 위한
 * Server Action 래퍼. lib/skinProfileDb.ts는 "server-only"라 클라이언트에서
 * 직접 못 부르니 이 얇은 래퍼를 거침
 */
export async function getSkinProfileFromAccountAction(): Promise<SkinProfile | null> {
  return getSkinProfileFromAccount();
}
