import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface FavoriteProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  volumeMl: number;
  purchaseUrl: string;
  imageColor: string;
  favoritedAt: string; // ISO 문자열
}

interface FavoriteRow {
  created_at: string;
  products: {
    id: string;
    name: string;
    brand: string;
    price: number;
    volume_ml: number;
    purchase_url: string;
    image_color: string | null;
  } | null;
}

const SELECT = `
  created_at,
  products (
    id, name, brand, price, volume_ml, purchase_url, image_color
  )
`;

/**
 * 로그인한 사용자의 즐겨찾기 목록을 제품 정보와 함께 가져옴 (최신 추가순).
 * RLS(auth.uid() = user_id)가 자동으로 "내 것만" 필터링해주므로
 * 별도 user_id 조건을 안 걸어도 됨 — 로그인 안 했으면 빈 배열 반환
 */
export async function getFavorites(): Promise<FavoriteProduct[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("favorites")
    .select(SELECT)
    .order("created_at", { ascending: false })
    .returns<FavoriteRow[]>();

  if (error || !data) {
    console.error("[favorites] 목록 조회 실패:", error?.message);
    return [];
  }

  return data
    .filter(
      (row): row is FavoriteRow & { products: NonNullable<FavoriteRow["products"]> } =>
        row.products !== null
    )
    .map((row) => ({
      id: row.products.id,
      name: row.products.name,
      brand: row.products.brand,
      price: row.products.price,
      volumeMl: row.products.volume_ml,
      purchaseUrl: row.products.purchase_url,
      imageColor: row.products.image_color ?? "#EDE9FB",
      favoritedAt: row.created_at,
    }));
}
