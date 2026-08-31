"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { useOwnershipTag } from "@/lib/localOwnership";
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
 * 세 단계로 나눠서 처리:
 * 1) foreign(남의 것) 감지되면 무조건 먼저 비움 — 로그아웃 이벤트를 놓쳐도 안전
 * 2) 로그인 상태면 태그를 계속 "지금 이 사람 것"으로 최신 유지 (네트워크 요청 없음,
 *    로컬 쓰기만이라 매번 해도 무해). 채팅에서 즐겨찾기 토글할 때마다 반응해서
 *    태그가 실시간으로 따라감(useLocalStorage가 같은 키를 구독하는 모든 컴포넌트에
 *    변경을 알리는 구조라, Header가 직접 토글 안 해도 값 변화를 인지함)
 * 3) 로그인 "직후" 딱 한 번만 실제 DB 동기화(네트워크 요청) — sessionStorage 플래그로
 *    페이지 이동마다 반복 호출되는 것 방지
 */
export function useFavoritesLoginSync(user: AuthUser | null | undefined) {
  const router = useRouter();
  const [favoriteItems, setFavoriteItems, hydrated] = useLocalStorage<FavoriteItem[]>(
    "ingredientfit:favorites",
    initialFavoriteItems
  );
  const { isForeign, markOwned, clearTag } = useOwnershipTag(
    "ingredientfit:favoritesOwner",
    user?.id
  );
  const startedRef = useRef(false);

  // 1) 남의 데이터면 무조건 비움
  useEffect(() => {
    if (!hydrated || !isForeign) return;
    setFavoriteItems(initialFavoriteItems);
    clearTag();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, isForeign]);

  // 2) 로그인 상태 + 내 데이터면 태그를 계속 최신으로
  useEffect(() => {
    if (!user || isForeign) return;
    markOwned();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isForeign, favoriteItems]);

  // 3) 로그인 직후 한 번만 DB 동기화
  useEffect(() => {
    if (!user || !hydrated || isForeign || favoriteItems.length === 0) return;
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
        router.refresh();
      })
      .catch((err) => console.error("[favorites] 로그인 시 동기화 실패:", err));
  }, [user, hydrated, favoriteItems, isForeign]);
}
