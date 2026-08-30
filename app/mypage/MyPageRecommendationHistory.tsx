"use client";

import { useState } from "react";
import MyPageSectionCard from "@/components/mypage/MyPageSectionCard";
import type { RecommendationHistoryItem } from "@/lib/recommendationHistory";

interface Props {
  history: RecommendationHistoryItem[];
}

const COLLAPSED_COUNT = 5;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

// 목록 자체는 서버에서 이미 최신 20건만 받아옴 (lib/recommendationHistory.ts) —
// 화면이 너무 길어지지 않게 여기서는 기본 5건만 보여주고 "더보기"로 확장
export default function MyPageRecommendationHistory({ history }: Props) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? history : history.slice(0, COLLAPSED_COUNT);
  const hiddenCount = history.length - visible.length;

  return (
    <MyPageSectionCard title={`추천 히스토리 (${history.length})`}>
      {history.length === 0 ? (
        <p className="rounded-xl bg-[var(--color-primary-soft)]/40 px-4 py-8 text-center text-[13px] text-[var(--color-ink-faint)]">
          아직 추천받은 기록이 없어요. 채팅에서 예산까지 선택하면 여기 기록으로 남아요.
        </p>
      ) : (
        <div className="space-y-3">
          {visible.map((item) => (
            <div
              key={item.id}
              className="rounded-xl p-4 shadow-[inset_0_0_0_1.5px_var(--color-border)]"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-semibold text-[var(--color-ink)]">
                  {item.categoryLabel} · {item.ingredientName} · {item.budgetLabel}
                </p>
                <span className="shrink-0 text-[11px] text-[var(--color-ink-faint)]">
                  {formatDate(item.createdAt)}
                </span>
              </div>
              {item.skinType && (
                <p className="mt-1 text-[11.5px] text-[var(--color-primary)]">
                  당시 피부 타입: {item.skinType}
                </p>
              )}
              <ul className="mt-2 space-y-1">
                {item.products.map((product, idx) => (
                  <li key={product.id} className="text-[12px] text-[var(--color-ink-soft)]">
                    {idx + 1}. {product.brand} {product.name} · {product.price.toLocaleString()}원
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="w-full rounded-xl border border-[var(--color-border)] py-2.5 text-[12.5px] font-medium text-[var(--color-ink-soft)] transition-colors hover:bg-gray-50"
            >
              {hiddenCount}건 더보기
            </button>
          )}
        </div>
      )}
    </MyPageSectionCard>
  );
}
