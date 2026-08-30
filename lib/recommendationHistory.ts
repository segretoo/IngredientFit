import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface RecommendationHistoryProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
}

export interface RecommendationHistoryItem {
  id: string;
  createdAt: string; // ISO 문자열
  categoryLabel: string;
  ingredientName: string;
  budgetLabel: string;
  // 추천 "당시" 설정돼 있던 피부 타입 라벨. 나중에 재진단해서 바뀌어도
  // 이 기록은 그때 값 그대로 보여줘야 해서 스냅샷으로 저장 — 미설정 상태였으면 null
  skinType: string | null;
  products: RecommendationHistoryProduct[];
}

interface HistoryRow {
  id: string;
  created_at: string;
  query_context: {
    categoryLabel?: string;
    ingredientName?: string;
    budgetLabel?: string;
    skinType?: string | null;
  } | null;
  recommended_products: RecommendationHistoryProduct[] | null;
}

/**
 * 로그인한 사용자의 추천 히스토리를 최신순으로 가져옴 (최대 20건).
 * recommended_products는 추천 "당시" 스냅샷이라, 이후 제품 가격이 바뀌어도
 * 기록은 그때 값 그대로 보여줌 — products 테이블과 실시간 조인 안 함
 */
export async function getRecommendationHistory(): Promise<RecommendationHistoryItem[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("recommendation_history")
    .select("id, created_at, query_context, recommended_products")
    .order("created_at", { ascending: false })
    .limit(20)
    .returns<HistoryRow[]>();

  if (error || !data) {
    console.error("[recommendationHistory] 조회 실패:", error?.message);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    categoryLabel: row.query_context?.categoryLabel ?? "추천",
    ingredientName: row.query_context?.ingredientName ?? "",
    budgetLabel: row.query_context?.budgetLabel ?? "",
    skinType: row.query_context?.skinType ?? null,
    products: (row.recommended_products ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      price: p.price,
    })),
  }));
}
