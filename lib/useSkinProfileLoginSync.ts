"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { useOwnershipTag } from "@/lib/localOwnership";
import { saveSkinProfileToAccount, getSkinProfileFromAccountAction } from "@/app/actions/skinProfile";
import type { SkinProfile } from "@/lib/skinProfile";
import type { AuthUser } from "@/lib/auth/getUser";

const initialSkinProfile: SkinProfile | null = null;
const SESSION_FLAG_KEY = "ingredientfit:skinProfileSyncedFor";

/**
 * 로그인 상태로 어느 페이지에 들어오든 피부 프로필을 계정과 동기화함.
 * useFavoritesLoginSync랑 같은 3단계 구조(foreign 정리 → 태그 유지 → 1회 DB 동기화).
 *
 * 즐겨찾기(배열, 병합 가능)와 다르게 이건 "지금 내 피부 타입" 딱 하나뿐인 값이라
 * DB 동기화 자체는 양방향으로 처리함:
 * - 이 브라우저에 이미 진단 결과가 있으면 → 계정에 저장(덮어씀)
 * - 이 브라우저엔 없는데 계정엔 있으면(다른 기기에서 진단) → 계정 값을 로컬로 끌어옴
 */
export function useSkinProfileLoginSync(user: AuthUser | null | undefined) {
  const router = useRouter();
  const [profile, setProfile, hydrated] = useLocalStorage<SkinProfile | null>(
    "ingredientfit:skinProfile",
    initialSkinProfile
  );
  const { isForeign, markOwned, clearTag } = useOwnershipTag(
    "ingredientfit:skinProfileOwner",
    user?.id
  );
  const startedRef = useRef(false);

  // 1) 남의 데이터면 무조건 비움 — 로그아웃 이벤트를 놓쳐도, 이 기능 생기기 전부터
  // 남아있던 데이터여도 페이지 들어올 때마다 스스로 검증하니 안전
  useEffect(() => {
    if (!hydrated || !isForeign) return;
    setProfile(null);
    clearTag();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, isForeign]);

  // 2) 로그인 상태 + 내 데이터면 태그를 계속 최신으로 (재진단해서 값 바뀔 때도 따라감)
  useEffect(() => {
    if (!user || isForeign) return;
    markOwned();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isForeign, profile]);

  // 3) 로그인 직후 한 번만 DB 동기화(양방향)
  useEffect(() => {
    if (!user || !hydrated || isForeign) return;
    if (startedRef.current) return;

    try {
      if (window.sessionStorage.getItem(SESSION_FLAG_KEY) === user.id) return;
    } catch {
      // 무시
    }

    startedRef.current = true;

    (async () => {
      if (profile) {
        await saveSkinProfileToAccount(profile);
      } else {
        const accountProfile = await getSkinProfileFromAccountAction();
        if (accountProfile) setProfile(accountProfile);
      }
      try {
        window.sessionStorage.setItem(SESSION_FLAG_KEY, user.id);
      } catch {
        // 무시
      }
      // revalidatePath만으로는 "지금 이미 렌더링된 페이지"가 확실히 다시 그려진다는
      // 보장이 약해서, 명시적으로 한 번 더 새로고침 — 로그인 직후 바로 /mypage로
      // 이동한 경우 서버 렌더링 시점엔 아직 이 동기화가 안 끝나있을 수 있음
      router.refresh();
    })().catch((err) => console.error("[skinProfile] 로그인 시 동기화 실패:", err));
  }, [user, hydrated, profile, setProfile, isForeign]);
}
