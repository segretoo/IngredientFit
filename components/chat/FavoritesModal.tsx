'use client';

import Image from 'next/image';
import type { FavoriteItem } from '@/types';
import ScoreBar from '@/components/ScoreBar';
import { getIngredientColor } from '@/lib/ingredientVisual';
import { getCategoryColor } from '@/lib/categoryVisual';

interface Props {
    open: boolean;
    items: FavoriteItem[];
    onClose: () => void;
    onRemove: (id: string) => void;
}

// 비교함과 구조는 비슷한데 즐겨찾기는 "나중에 다시 보려고 저장" 목적이라
// 세로 리스트로 해서 한 번에 훑어보기 편하게 함 (비교함은 가로 카드 나열)
//
// 비교함(보라색 톤)과 구분되게 즐겨찾기는 별 아이콘과 같은 계열인 앰버 톤을
// 포인트 컬러로 씀. 같은 저장 카드 골격이라 완전히 다른 UI는 아니고,
// 색과 아이콘만으로 "비교가 아니라 보관함" 느낌 나게 함
export default function FavoritesModal({ open, items, onClose, onRemove }: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 py-8" onClick={onClose}>
            <div
                onClick={(e) => e.stopPropagation()}
                className="animate-fade-up flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
                    <div>
                        <h2 className="flex items-center gap-1.5 text-[16px] font-semibold text-[var(--color-ink)]">
                            <StarIcon />
                            즐겨찾기 ({items.length})
                        </h2>
                        <p className="mt-0.5 text-[11px] text-[var(--color-ink-faint)]">
                            나중에 다시 보려고 저장해둔 제품이에요
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="닫기"
                        className="shrink-0 text-[18px] leading-none text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition-colors">
                        ✕
                    </button>
                </div>

                <div className="overflow-y-auto px-6 py-5">
                    {items.length === 0 ? (
                        <p className="py-10 text-center text-[13px] text-[var(--color-ink-faint)]">
                            즐겨찾기가 비어있어요. 추천 결과 카드의 ☆ 버튼을 눌러 저장해보세요.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {items
                                .slice()
                                .sort((a, b) => b.addedAt - a.addedAt)
                                .map((item, idx) => {
                                    const p = item.product;
                                    const pricePerMl = Math.round(p.price / p.volumeMl);
                                    const accentColor = getIngredientColor(p.ingredientId);
                                    const categoryColor = getCategoryColor(item.categoryLabel);
                                    return (
                                        <div
                                            key={item.id}
                                            className="rounded-xl border p-3.5"
                                            style={{
                                                borderColor: `${accentColor}40`,
                                                backgroundColor: `${accentColor}0d`,
                                            }}>
                                            <div className="flex items-start gap-3">
                                                <div
                                                    className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
                                                    style={{ backgroundColor: p.imageColor }}
                                                    aria-hidden>
                                                    <Image
                                                        src="/images/serum-placeholder.png"
                                                        alt=""
                                                        width={24}
                                                        height={24}
                                                        className="opacity-80"
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <span
                                                            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] font-medium"
                                                            style={{
                                                                backgroundColor: `${accentColor}1f`,
                                                                color: accentColor,
                                                            }}>
                                                            <span
                                                                className="h-1.5 w-1.5 shrink-0 translate-y-px rounded-full"
                                                                style={{ backgroundColor: categoryColor }}
                                                                aria-hidden
                                                            />
                                                            {item.categoryLabel} · {item.ingredientName}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => onRemove(item.id)}
                                                            aria-label="즐겨찾기에서 빼기"
                                                            className="shrink-0 text-[13px] leading-none text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]">
                                                            ✕
                                                        </button>
                                                    </div>
                                                    <p className="mt-1 truncate text-[12.5px] font-semibold text-[var(--color-ink)]">
                                                        {p.brand} {p.name}
                                                    </p>
                                                    <p className="mt-0.5 text-[11px] text-[var(--color-ink-faint)]">
                                                        {p.price.toLocaleString()}원 · {p.volumeMl}ml · ml당{' '}
                                                        {pricePerMl.toLocaleString()}원
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-2.5 space-y-1.5">
                                                <ScoreBar
                                                    label="배치 점수"
                                                    value={p.placementScore}
                                                    color="var(--color-primary)"
                                                    delay={idx * 70}
                                                    size="sm"
                                                />
                                                <ScoreBar
                                                    label="가격 점수"
                                                    value={p.priceScore}
                                                    color="var(--color-accent-deep)"
                                                    delay={idx * 70 + 50}
                                                    size="sm"
                                                />
                                                <ScoreBar
                                                    label="가성비 지수"
                                                    value={p.finalScore}
                                                    color="#c9a86a"
                                                    delay={idx * 70 + 100}
                                                    size="sm"
                                                />
                                            </div>

                                            <a
                                                href={p.purchaseUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-3 block rounded-lg bg-[var(--color-primary)] py-2 text-center text-[11.5px] font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors">
                                                구매하러 가기
                                            </a>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StarIcon() {
    return (
        <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
            className="shrink-0 text-[var(--color-accent-text)]">
            <path d="M12 2.5l2.9 6.3 6.9.7-5.2 4.7 1.5 6.8-6.1-3.6-6.1 3.6 1.5-6.8-5.2-4.7 6.9-.7z" />
        </svg>
    );
}
