"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocalStorage } from "@/lib/useLocalStorage";
import { saveSkinProfileToAccount } from "@/app/actions/skinProfile";
import type { AuthUser } from "@/lib/auth/getUser";
import {
  SKIN_QUESTIONS,
  resolveSkinProfile,
  skinTypeLabel,
  type SkinProfile,
} from "@/lib/skinProfile";

// 프로필 없으면 null. ChatWindow랑 같은 키 써서 저장하면 바로 반영됨
const initialSkinProfile: SkinProfile | null = null;

interface Props {
  // 서버 컴포넌트 페이지에서 lib/auth/getUser로 읽어서 내려줌.
  // 로그인 상태면 저장 시 계정(Supabase)에도 반영함
  user?: AuthUser | null;
}

export default function SkinProfileContent({ user = null }: Props) {
  const [profile, setProfile, hydrated] = useLocalStorage<SkinProfile | null>(
    "ingredientfit:skinProfile",
    initialSkinProfile,
  );
  // 각 문항에서 고른 옵션 인덱스. -1은 아직 안 고름
  const [answers, setAnswers] = useState<number[]>(() => SKIN_QUESTIONS.map(() => -1));

  const allAnswered = answers.every((a) => a >= 0);
  const result = allAnswered ? resolveSkinProfile(answers) : null;

  function selectOption(qIdx: number, optIdx: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[qIdx] = optIdx;
      return next;
    });
  }

  function saveProfile() {
    if (!result) return;
    setProfile(result);

    // 로컬 저장은 항상(비로그인 사용자도 채팅에서 성분 순서 조정에 씀). 로그인 상태면
    // 계정에도 반영 — 실패해도 로컬엔 이미 반영됐으니 화면은 안 막힘
    if (user) {
      saveSkinProfileToAccount(result).catch((err) =>
        console.error("[skinProfile] 계정 저장 실패:", err),
      );
    }
  }

  function resetProfile() {
    setProfile(null);
    setAnswers(SKIN_QUESTIONS.map(() => -1));
  }

  // 저장된 프로필이 이미 있으면 결과 화면부터 보여줌
  const savedLabel = hydrated && profile ? skinTypeLabel(profile) : null;

  return (
    <div>
      <span className="inline-block rounded-full bg-[var(--color-primary-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-primary)]">
        피부타입 진단
      </span>
      <h1 className="mt-3 text-[20px] font-bold text-[var(--color-ink)]">내 피부타입 알아보기</h1>
      <p className="mt-2 text-[13px] text-[var(--color-ink-soft)] leading-relaxed">
        간단한 4가지 질문에 답하면 피부타입을 진단해드려요. 진단 결과를 저장하면 채팅으로 성분을
        추천받을 때 내 피부에 맞춰 순서를 조정해드려요.
      </p>

      {savedLabel ? (
        // 이미 저장된 프로필 있을 때
        <div className="mt-7 rounded-2xl border border-[var(--color-border)] bg-white p-5 text-center">
          <p className="text-[12px] text-[var(--color-ink-faint)]">저장된 내 피부타입</p>
          <p className="mt-1 text-[24px] font-bold text-[var(--color-primary)]">{savedLabel}</p>
          <div className="mt-5 flex flex-col gap-2">
            <Link
              href="/chat"
              className="rounded-xl bg-[var(--color-primary)] py-3 text-[13px] font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors">
              이 타입으로 추천받기
            </Link>
            <button
              type="button"
              onClick={resetProfile}
              className="rounded-xl border border-[var(--color-border)] py-3 text-[12.5px] font-medium text-[var(--color-ink-soft)] hover:bg-gray-50 transition-colors">
              다시 진단하기
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-7 space-y-5">
            {SKIN_QUESTIONS.map((q, qIdx) => (
              <div key={q.id} className="rounded-xl border border-[var(--color-border)] p-4">
                <p className="text-[13px] font-semibold text-[var(--color-ink)]">
                  <span className="text-[var(--color-primary)]">Q{qIdx + 1}.</span> {q.question}
                </p>
                <div className="mt-3 space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const selected = answers[qIdx] === optIdx;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => selectOption(qIdx, optIdx)}
                        className={`w-full rounded-lg border px-3.5 py-2.5 text-left text-[12.5px] transition-colors ${
                          selected
                            ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)] font-medium"
                            : "border-[var(--color-border)] text-[var(--color-ink-soft)] hover:border-[var(--color-primary)]"
                        }`}>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {result && (
            <div className="mt-6 rounded-2xl border border-[var(--color-primary)] bg-[var(--color-primary-soft)] p-5 text-center animate-fade-up">
              <p className="text-[12px] text-[var(--color-ink-soft)]">진단 결과</p>
              <p className="mt-1 text-[22px] font-bold text-[var(--color-primary)]">
                {skinTypeLabel(result)}
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Link
                  href="/chat"
                  onClick={saveProfile}
                  className="rounded-xl bg-[var(--color-primary)] py-3 text-[13px] font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors">
                  이 타입 저장하고 추천받기
                </Link>
                <button
                  type="button"
                  onClick={saveProfile}
                  className="rounded-xl border border-[var(--color-border)] bg-white py-3 text-[12.5px] font-medium text-[var(--color-ink-soft)] hover:bg-gray-50 transition-colors">
                  저장만 하기
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-7 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="text-[12.5px] font-semibold text-amber-900">꼭 알아두세요</p>
        <ul className="mt-2 space-y-1.5 text-[11.5px] leading-relaxed text-amber-900">
          <li>• 자가 응답 기반 간이 진단이라 참고용으로만 활용해주세요.</li>
          <li>• 의료적 진단이나 처방을 대체하지 않아요. 피부 트러블이 지속되면 피부과 상담을 받아보세요.</li>
          <li>
            •{" "}
            {user
              ? "진단 결과는 계정에 저장돼서 다른 기기에서 로그인해도 이어서 볼 수 있어요."
              : "진단 결과는 이 기기 브라우저에만 저장돼요. 로그인하면 계정에 저장해서 다른 기기에서도 볼 수 있어요."}
          </li>
        </ul>
      </div>
    </div>
  );
}
