'use client';

import Image from 'next/image';
import type { Product } from '@/types';
import { getIngredient, getCategoriesForIngredient } from '@/lib/ingredients';
import ArrowRightIcon from '@/components/ArrowRightIcon';

interface Props {
    product: Product | null;
    isBestValue?: boolean;
    onClose: () => void;
    // 즐겨찾기 표시/토글. products/page.tsx 쪽에서 로그인 여부까지 확인한
    // 핸들러를 그대로 내려받아 씀 — 이 컴포넌트는 상태를 직접 안 가짐
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
}

export default function ProductDetailModal({
    product,
    isBestValue = false,
    onClose,
    isFavorite = false,
    onToggleFavorite,
}: Props) {
    if (!product) return null;

    const ingredient = getIngredient(product.ingredientId);
    const relatedCategories = getCategoriesForIngredient(product.ingredientId);
    const pricePerMl = Math.round(product.price / product.volumeMl);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 py-8" onClick={onClose}>
            <div
                onClick={(e) => e.stopPropagation()}
                className="animate-fade-up flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
                {/* 더미 제품이라 실사진 없음. 파스텔 배경(imageColor) + 공용 세럼 아이콘 플레이스홀더.
                    닫기 버튼을 여기 얹어서 "모달 전체를 닫는다"는 역할을 시각적으로 최상단에 둠 —
                    반투명 흰 배경 원을 깔아서 제품마다 다른 파스텔 색 위에서도 항상 잘 보이게 함 */}
                <div
                    className="relative flex h-40 w-full shrink-0 items-center justify-center"
                    style={{ backgroundColor: product.imageColor }}>
                    <Image
                        src="/images/serum-placeholder.png"
                        alt=""
                        width={72}
                        height={72}
                        className="opacity-80"
                        aria-hidden
                    />
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="닫기"
                        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/70 text-[15px] leading-none text-[var(--color-ink-soft)] backdrop-blur-sm transition-colors hover:bg-white hover:text-[var(--color-ink)]">
                        ✕
                    </button>
                </div>
                <div className="flex items-start justify-between px-6 pt-5">
                    <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                            {isBestValue && (
                                <span className="flex items-center gap-1 rounded-full bg-[var(--color-accent-soft)] px-2 py-0.5 text-[10.5px] font-semibold text-[var(--color-accent-text)]">
                                    <SparkleIcon />
                                    성분핏 추천템
                                </span>
                            )}
                            {relatedCategories.map((c) => (
                                <span
                                    key={c.key}
                                    className="rounded-full bg-[var(--color-primary-soft)] px-2 py-0.5 text-[10.5px] font-medium text-[var(--color-primary)]">
                                    {c.label}
                                </span>
                            ))}
                        </div>
                        <h2 className="mt-2 text-[16px] font-bold text-[var(--color-ink)]">
                            {product.brand} {product.name}
                        </h2>
                    </div>
                    {onToggleFavorite && (
                        <button
                            type="button"
                            onClick={onToggleFavorite}
                            aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기에 담기'}
                            aria-pressed={isFavorite}
                            className={`shrink-0 text-[19px] leading-none transition-colors ${
                                isFavorite
                                    ? 'text-[var(--color-primary)]'
                                    : 'text-[var(--color-ink-faint)] hover:text-[var(--color-primary)]'
                            }`}>
                            {isFavorite ? '★' : '☆'}
                        </button>
                    )}
                </div>

                <div className="overflow-y-auto px-6 pb-6 pt-4">
                    <dl className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-lg bg-gray-50 py-2.5">
                            <dt className="text-[10px] text-[var(--color-ink-faint)]">가격</dt>
                            <dd className="mt-0.5 text-[13px] font-semibold text-[var(--color-ink)]">
                                {product.price.toLocaleString()}원
                            </dd>
                        </div>
                        <div className="rounded-lg bg-gray-50 py-2.5">
                            <dt className="text-[10px] text-[var(--color-ink-faint)]">용량</dt>
                            <dd className="mt-0.5 text-[13px] font-semibold text-[var(--color-ink)]">
                                {product.volumeMl}ml
                            </dd>
                        </div>
                        <div className="rounded-lg bg-gray-50 py-2.5">
                            <dt className="text-[10px] text-[var(--color-ink-faint)]">ml당 가격</dt>
                            <dd className="mt-0.5 text-[13px] font-semibold text-[var(--color-ink)]">
                                {pricePerMl.toLocaleString()}원
                            </dd>
                        </div>
                    </dl>

                    {ingredient && (
                        <div className="mt-4 rounded-xl border border-[var(--color-border)] p-4">
                            <p className="text-[12px] font-semibold text-[var(--color-primary)]">
                                핵심 성분: {ingredient.name}{' '}
                                <span className="font-normal text-[var(--color-ink-faint)]">
                                    (기준위치 {ingredient.refPosition}번 · 이 제품 내 {product.actualPosition}번째)
                                </span>
                            </p>
                            <p className="mt-2 text-[12.5px] text-[var(--color-ink)] leading-relaxed">
                                {ingredient.effect}
                            </p>
                            <p className="mt-2 text-[11.5px] text-[var(--color-ink-soft)] leading-relaxed">
                                <span className="font-medium text-[var(--color-ink)]">주의사항 </span>
                                {ingredient.caution}
                            </p>
                        </div>
                    )}

                    <a
                        href={product.purchaseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-[var(--color-primary)] py-3 text-[13px] font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors">
                        구매하러 가기
                        <ArrowRightIcon />
                    </a>
                </div>
            </div>
        </div>
    );
}

function SparkleIcon() {
    return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="shrink-0">
            <path d="M12 2.5c.9 4 2.2 6.3 4.5 7.5-2.3 1.2-3.6 3.5-4.5 7.5-.9-4-2.2-6.3-4.5-7.5 2.3-1.2 3.6-3.5 4.5-7.5Z" />
        </svg>
    );
}
