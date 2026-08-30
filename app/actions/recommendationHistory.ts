"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ScoredProduct } from "@/types";

interface SaveRecommendationInput {
  categoryLabel: string;
  ingredientName: string;
  budgetLabel: string;
  // 추천 당시 설정돼있던 피부 타입 라벨 (skinTypeLabel 결과). 미설정이면 null
  skinType: string | null;
  results: ScoredProduct[];
}

interface ActionResult {
  ok: boolean;
  error?: string;
}

/**
 * 채팅에서 TOP3 추천 결과가 나올 때마다(예산 선택 직후) 로그인 상태면 기록으로 남김.
 * ChatWindow가 결과를 화면에 반영한 뒤 fire-and-forget으로 호출 —
 * 실패해도 채팅 흐름 자체는 막지 않고 콘솔에만 에러 남김
 */
export async function saveRecommendation(input: SaveRecommendationInput): Promise<ActionResult> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, error: "not_configured" };

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, error: "not_logged_in" };

  const { error } = await supabase.from("recommendation_history").insert({
    user_id: userData.user.id,
    query_context: {
      categoryLabel: input.categoryLabel,
      ingredientName: input.ingredientName,
      budgetLabel: input.budgetLabel,
      skinType: input.skinType,
    },
    recommended_products: input.results,
  });

  if (error) {
    console.error("[recommendationHistory] 저장 실패:", error.message);
    return { ok: false, error: error.message };
  }

  revalidatePath("/mypage");
  return { ok: true };
}
