"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

interface ActionResult {
  ok: boolean;
  error?: string;
}

// ChatWindow(클라이언트 컴포넌트)가 직접 호출하는 Server Action들.
// 전부 "로컬 상태(useLocalStorage)는 이미 반영된 뒤 호출되는 부가 동기화"라
// 여기서 실패해도 화면은 정상 동작함 — 콘솔에만 에러 남기고 조용히 넘어감

/** 즐겨찾기 1건 추가. 이미 있으면(unique 위반) 정상 처리로 간주 */
export async function addFavorite(productId: string): Promise<ActionResult> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, error: "not_configured" };

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, error: "not_logged_in" };

  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: userData.user.id, product_id: productId });

  // 23505 = unique_violation. 이미 즐겨찾기한 상태에서 재호출된 정상 케이스
  if (error && error.code !== "23505") {
    console.error("[favorites] 추가 실패:", error.message);
    return { ok: false, error: error.message };
  }

  revalidatePath("/mypage");
  return { ok: true };
}

/** 즐겨찾기 1건 삭제 */
export async function removeFavorite(productId: string): Promise<ActionResult> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, error: "not_configured" };

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, error: "not_logged_in" };

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userData.user.id)
    .eq("product_id", productId);

  if (error) {
    console.error("[favorites] 삭제 실패:", error.message);
    return { ok: false, error: error.message };
  }

  revalidatePath("/mypage");
  return { ok: true };
}

/**
 * 로그인 순간 로컬(localStorage)에 이미 쌓여있던 즐겨찾기를 DB로 한 번에 옮김.
 * ChatWindow가 user가 생기는 시점(로그인 직후/새로고침 시 이미 로그인된 상태)에
 * 딱 한 번 호출 — 기존에 담아둔 즐겨찾기가 로그인해도 안 사라지게 하기 위함
 */
export async function bulkSyncFavorites(productIds: string[]): Promise<ActionResult> {
  if (productIds.length === 0) return { ok: true };

  const supabase = await getSupabaseServerClient();
  if (!supabase) return { ok: false, error: "not_configured" };

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, error: "not_logged_in" };

  const rows = productIds.map((productId) => ({
    user_id: userData.user!.id,
    product_id: productId,
  }));

  const { error } = await supabase
    .from("favorites")
    .upsert(rows, { onConflict: "user_id,product_id", ignoreDuplicates: true });

  if (error) {
    console.error("[favorites] 로그인 시 일괄 동기화 실패:", error.message);
    return { ok: false, error: error.message };
  }

  revalidatePath("/mypage");
  return { ok: true };
}
