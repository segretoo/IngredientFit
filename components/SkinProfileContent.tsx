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

// 답변 선택 → 바로 다음 문항으로 넘어가는 텀. 너무 빠르면 선택한 게 뭔지
// 인지도 못 하고 넘어가버리고, 너무 느리면 버벅이는 느낌이라 이 정도가 적당
const ADVANCE_DELAY_MS = 320;

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
  // 지금 보여줄 문항 인덱스. SKIN_QUESTIONS.length에 도달하면 결과 화면
  const [step, setStep] = useState(0);

  const allAnswered = answers.every((a) => a >= 0);
  const result = allAnswered ? resolveSkinProfile(answers) : null;
  const showResult = step >= SKIN_QUESTIONS.length && result;

  // 선택하는 즉시 화면이 바뀌는 게 이번 리메이크의 핵심 요구사항 —
  // "다음" 버튼 누르는 문제집 방식 대신 선택=진행으로 처리
  function selectOption(qIdx: number, optIdx: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[qIdx] = optIdx;
      return next;
    });
    window.setTimeout(() => {
      setStep((s) => Math.max(s, qIdx + 1));
    }, ADVANCE_DELAY_MS);
  }

  function goBack() {
    setStep((s) => Math.max(0, s - 1));
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
    setStep(0);
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
        <div className="mt-7 rounded-2xl border border-[var(--color-border)] bg-white p-6 text-center">
          <p className="text-[12px] text-[var(--color-ink-faint)]">저장된 내 피부타입</p>
          <p className="mt-1.5 text-[28px] font-bold text-[var(--color-primary)]">{savedLabel}</p>
          <div className="mt-6 flex flex-col gap-2">
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
      ) : !showResult ? (
        // 문항 하나씩 — 선택하면 바로 다음으로 넘어감
        <div key={step} className="mt-8 animate-fade-up">
          {/* 진행 표시: 지난 문항은 짧은 점, 현재 문항은 긴 바, 남은 문항은 옅은 점 */}
          <div className="flex items-center justify-center gap-1.5">
            {SKIN_QUESTIONS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step
                    ? "w-7 bg-[var(--color-primary)]"
                    : i < step
                      ? "w-1.5 bg-[var(--color-primary)]"
                      : "w-1.5 bg-[var(--color-border)]"
                }`}
              />
            ))}
          </div>

          <p className="mt-6 text-center text-[11.5px] font-medium text-[var(--color-ink-faint)]">
            Q{step + 1} / {SKIN_QUESTIONS.length}
          </p>
          <h2 className="mt-2 text-center text-[18px] font-bold leading-snug text-[var(--color-ink)]">
            {SKIN_QUESTIONS[step].question}
          </h2>

          <div className="mt-6 space-y-2.5">
            {SKIN_QUESTIONS[step].options.map((opt, optIdx) => {
              const selected = answers[step] === optIdx;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => selectOption(step, optIdx)}
                  className={`w-full rounded-xl border-[1.5px] px-4 py-3.5 text-left text-[13.5px] font-medium transition-all active:scale-[0.98] ${
                    selected
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
                      : "border-[var(--color-border)] text-[var(--color-ink-soft)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]/40"
                  }`}>
                  {opt.label}
                </button>
              );
            })}
          </div>

          {step > 0 && (
            <button
              type="button"
              onClick={goBack}
              className="mt-5 text-[12px] text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition-colors">
              ← 이전 질문
            </button>
          )}
        </div>
      ) : (
        result && (
          <div className="mt-8 animate-fade-up rounded-2xl border border-[var(--color-primary)] bg-[var(--color-primary-soft)] p-6 text-center">
            <p className="text-[12px] text-[var(--color-ink-soft)]">진단 결과</p>
            <p className="mt-1.5 animate-bounce-once text-[26px] font-bold text-[var(--color-primary)]">
              {skinTypeLabel(result)}
            </p>
            <div className="mt-6 flex flex-col gap-2">
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
              <button
                type="button"
                onClick={resetProfile}
                className="text-[12px] text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition-colors">
                다시 진단하기
              </button>
            </div>
          </div>
        )
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
