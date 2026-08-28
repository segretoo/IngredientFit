"use client";

import { useEffect, useRef } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { bulkSyncFavorites } from "@/app/actions/favorites";
import type { FavoriteItem } from "@/types";
import type { AuthUser } from "@/lib/auth/getUser";

const initialFavoriteItems: FavoriteItem[] = [];
const SESSION_FLAG_KEY = "ingredientfit:favoritesSyncedFor";

/**
 * 로그인 상태로 "어느 페이지에 들어오든" 로컬(localStorage) 즐겨찾기를 DB로 동기화함.
 * Header/MobileHeader는 거의 모든 페이지에서 렌더링되니 여기서 부르면
 * /chat을 거치지 않고 로그인 직후 /mypage로 바로 가도 반영됨.
 *
 * sessionStorage 플래그로 같은 탭에서 페이지 이동마다(Header가 매번 새로 마운트됨)
 * 반복 호출되는 것 방지. bulkSyncFavorites 자체도 upsert+ignoreDuplicates라
 * 중복 호출돼도 안전하지만, 불필요한 요청을 줄이기 위한 최적화
 */
export function useFavoritesLoginSync(user: AuthUser | null | undefined) {
  const [favoriteItems, , hydrated] = useLocalStorage<FavoriteItem[]>(
    "ingredientfit:favorites",
    initialFavoriteItems
  );
  const startedRef = useRef(false);

  useEffect(() => {
    if (!user || !hydrated || favoriteItems.length === 0) return;
    if (startedRef.current) return;

    try {
      if (window.sessionStorage.getItem(SESSION_FLAG_KEY) === user.id) return;
    } catch {
      // sessionStorage 막힌 환경(프라이빗 모드 등)이면 플래그 없이 그냥 진행 —
      // 어차피 서버 쪽이 idempotent라 중복 호출돼도 안전함
    }

    startedRef.current = true;
    bulkSyncFavorites(favoriteItems.map((item) => item.id))
      .then(() => {
        try {
          window.sessionStorage.setItem(SESSION_FLAG_KEY, user.id);
        } catch {
          // 무시
        }
      })
      .catch((err) => console.error("[favorites] 로그인 시 동기화 실패:", err));
  }, [user, hydrated, favoriteItems]);
}
