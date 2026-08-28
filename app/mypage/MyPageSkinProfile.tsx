"use client";

import Link from "next/link";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { skinTypeLabel, type SkinProfile } from "@/lib/skinProfile";

const initialSkinProfile: SkinProfile | null = null;

// 피부 진단(질문형, /skin-profile)은 아직 localStorage 기반이라 계정에는 안 남음.
// 즐겨찾기처럼 DB 연동은 다음 단계 — 지금은 마이페이지에 자리만 만들고
// 로컬에 저장된 값이 있으면 그대로 보여줌 ("ingredientfit:skinProfile" 키,
// components/chat/ChatWindow.tsx가 쓰는 것과 동일한 키)
export default function MyPageSkinProfile() {
  const [skinProfile, , hydrated] = useLocalStorage<SkinProfile | null>(
    "ingredientfit:skinProfile",
    initialSkinProfile
  );

  return (
    <div>
      <h2 className="text-[15px] font-semibold text-[var(--color-ink)]">피부 프로필</h2>

      {!hydrated || !skinProfile ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-xl bg-[var(--color-primary-soft)]/40 px-4 py-8 text-center">
          <p className="text-[13px] text-[var(--color-ink-faint)]">
            아직 진단한 피부 타입이 없어요. 진단하면 추천 정확도가 올라가요.
          </p>
          <Link
            href="/skin-profile"
            className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-[12.5px] font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)]"
          >
            지금 진단하러 가기
          </Link>
        </div>
      ) : (
        <div className="mt-4 flex items-center justify-between rounded-xl p-4 shadow-[inset_0_0_0_1.5px_var(--color-border)]">
          <div>
            <p className="text-[13px] font-semibold text-[var(--color-ink)]">
              {skinTypeLabel(skinProfile)}
            </p>
            <p className="mt-0.5 text-[11.5px] text-[var(--color-ink-faint)]">
              이 브라우저에 저장된 진단 결과예요. 계정 연동은 준비 중이에요.
            </p>
          </div>
          <Link
            href="/skin-profile"
            className="shrink-0 text-[12px] font-medium text-[var(--color-primary)] hover:underline"
          >
            다시 진단하기
          </Link>
        </div>
      )}
    </div>
  );
}
