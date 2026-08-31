"use client";

import { useLocalStorage } from "@/lib/useLocalStorage";

/**
 * 로컬(localStorage)에 저장된 값이 "지금 보고 있는 사람 것"이 맞는지 추적하는 훅.
 *
 * 태그가 null이면(한 번도 특정 계정에 연결된 적 없는 순수 게스트 데이터) 항상 신뢰함 —
 * 아무 계정과도 연결된 적 없으니 새어나갈 정보가 없음.
 * 태그가 특정 user.id로 찍혀있는데 지금 보는 사람이 그 사람이 아니면(로그아웃했거나
 * 다른 계정으로 로그인함) foreign 처리 — 이 경우가 실제로 막아야 하는 상황.
 *
 * "로그아웃 시점에 지운다"는 방식은 로그아웃 버튼을 안 누르고 그냥 브라우저를 닫거나,
 * 이 로직이 생기기 전부터 남아있던 데이터는 못 잡음. 이 훅은 페이지 들어올 때마다
 * (Header가 거의 모든 페이지에서 새로 마운트되므로) 스스로 검증하는 방식이라
 * 그런 경우까지 다 안전망 안에 들어옴
 */
export function useOwnershipTag(ownerKey: string, userId: string | null | undefined) {
  const [owner, setOwner] = useLocalStorage<string | null>(ownerKey, null);
  const expected = userId ?? null;
  const isForeign = owner !== null && owner !== expected;

  function markOwned() {
    if (expected && owner !== expected) setOwner(expected);
  }

  function clearTag() {
    if (owner !== null) setOwner(null);
  }

  return { isForeign, markOwned, clearTag };
}
