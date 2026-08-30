'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import type { Ingredient, ScoredProduct } from '@/types';
import IngredientTag from '@/components/IngredientTag';
import ArrowRightIcon from '@/components/ArrowRightIcon';
import ScoreBar from '@/components/ScoreBar';

interface Props {
    rank: number;
    product: ScoredProduct;
    ingredient: Ingredient;
    isInCompare?: boolean;
    onToggleCompare?: () => void;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
    // true(모바일): 요약만 보여주고 막대그래프·추천 이유는 "상세보기" 눌러야 바텀시트로 펼침
    // false(데스크톱): 카드 폭 넓어서 다 펼쳐도 안 길어지니까 카드 안에 전부 바로 노출
    compact?: boolean;
}

const rankLabel: Record<number, string> = {
    1: '추천 1위',
    2: '2위',
    3: '3위',
};

export default function ResultCard({
    rank,
    product,
    ingredient,
    isInCompare = false,
    onToggleCompare,
    isFavorite = false,
    onToggleFavorite,
    compact = false,
}: Props) {
    const pricePerMl = Math.round(product.price / product.volumeMl);
    const cardRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    // 카드가 모바일 화면보다 길어지면 캐러셀 넘겨도 한눈에 안 들어옴.
    // 그래서 카드엔 요약만, 막대그래프·추천 이유는 "상세보기" 눌렀을 때 바텀시트로 펼침
    const [showDetail, setShowDetail] = useState(false);

    async function handleShare() {
        if (!cardRef.current || isExporting) return;
        setIsExporting(true);
        try {
            const { toPng } = await import('html-to-image');
            const dataUrl = await toPng(cardRef.current, {
                pixelRatio: 2,
                backgroundColor: '#ffffff',
                filter: (node) => !(node instanceof HTMLElement && node.dataset.exportIgnore === 'true'),
            });
            const fileName = `성분핏-${product.brand}-${product.name}.png`;

            // "이미지 저장" 버튼은 이름대로 다운로드만 함.
            // navigator.share()(OS 공유창)는 CompareModal "저장/공유"에서만 씀.
            // 그쪽은 문구가 공유까지 약속하니까
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = fileName;
            link.click();
        } catch (error) {
            console.error('[ResultCard] 이미지 생성 실패:', error);
        } finally {
            setIsExporting(false);
        }
    }

    return (
        <>
        <div
            ref={cardRef}
            className="flex h-full flex-col rounded-xl bg-white p-3.5 shadow-[inset_0_0_0_1.5px_var(--color-border)]">
            <div className="flex items-start gap-3">
                {/* 더미 제품이라 실사진 없음. 파스텔 배경(imageColor) + 공용 세럼 아이콘 플레이스홀더.
            나중에 실제 사진(imageUrl) 생기면 이 부분만 교체하면 됨 */}
                <div
                    className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: product.imageColor }}
                    aria-hidden>
                    <Image src="/images/serum-placeholder.png" alt="" width={32} height={32} className="opacity-80" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <span className="inline-block shrink-0 whitespace-nowrap rounded-full bg-[var(--color-primary-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-primary)]">
                            {rankLabel[rank] ?? `${rank}위`}
                        </span>
                        {onToggleFavorite && (
                            <button
                                type="button"
                                data-export-ignore="true"
                                onClick={onToggleFavorite}
                                aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기에 담기'}
                                aria-pressed={isFavorite}
                                className={`shrink-0 text-[16px] leading-none transition-colors ${
                                    isFavorite ? 'text-[var(--color-accent-text)]' : 'text-[var(--color-ink-faint)] hover:text-[var(--color-accent-text)]'
                                }`}>
                                {isFavorite ? '★' : '☆'}
                            </button>
                        )}
                    </div>
                    <p className="mt-1 truncate text-[13.5px] font-semibold text-[var(--color-ink)]">
                        {product.brand} {product.name}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-[var(--color-ink-faint)]">
                        가격 {product.price.toLocaleString()}원 · 용량 {product.volumeMl}ml · ml당 가격{' '}
                        {pricePerMl.toLocaleString()}원
                    </p>
                </div>
            </div>

            {compact ? (
                <>
                    {/* 요약 줄: 핵심 성분·가성비 점수만. 상세는 바텀시트로 빼서
                카드 높이가 모바일 화면 안 넘게 함.
                성분명·점수·화살표를 한 줄에 다 넣었더니 일부 실기기에서
                성분명 칸이 극단적으로 좁아져 글자가 안 보이는 버그 있었음.
                그래서 성분명은 한 줄 통째로 쓰고 점수·상세보기는 아래 줄로 내림 */}
                    <button
                        type="button"
                        onClick={() => setShowDetail(true)}
                        aria-label="배치·가격·예산 점수와 추천 이유 상세 보기"
                        className="mt-2.5 block w-full rounded-lg bg-[var(--color-primary-soft)]/60 px-3 py-2 text-left transition-colors hover:bg-[var(--color-primary-soft)]">
                        <span className="flex items-center gap-1.5">
                            <IngredientTag ingredientId={ingredient.id} size={18} />
                            <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-[var(--color-ink)]">
                                {ingredient.name}
                            </span>
                        </span>
                        <span className="mt-1.5 flex items-center justify-between gap-2">
                            <span className="flex shrink-0 items-center gap-1 whitespace-nowrap text-[12.5px] font-semibold text-[var(--color-accent-text)]">
                                <SparkleIcon />
                                {/* white-space:nowrap이 일부 기기(접근성 설정, 데이터 절약 모드)에서
                            무시되는 경우 있음. 그래서 "가성비"와 점수 사이 공백을
                            U+00A0(줄바꿈 방지 공백)으로 바꿈. CSS가 아니라 글자 자체
                            성질이라 어떤 환경에서도 안 끊김 */}
                                가성비{'\u00A0'}
                                {product.finalScore}점
                            </span>
                            <span className="flex shrink-0 items-center gap-0.5 whitespace-nowrap text-[10.5px] font-medium text-[var(--color-primary)]">
                                상세보기
                                <ChevronDownIcon />
                            </span>
                        </span>
                    </button>

                    {/* 남는 공간 채우기용. 카드마다 여백 달라도 아래 버튼 위치 맞추려고 */}
                    <div className="flex-1" />
                </>
            ) : (
                <div className="mt-2.5 flex-1 rounded-lg bg-[var(--color-primary-soft)]/60 px-3 py-2 text-[11.5px] text-[var(--color-ink-soft)] leading-relaxed">
                    <div className="flex items-center justify-between gap-1.5">
                        <span className="flex items-center gap-1.5">
                            <IngredientTag ingredientId={ingredient.id} size={18} />
                            <span className="text-[11.5px] font-semibold text-[var(--color-ink)]">{ingredient.name}</span>
                        </span>
                        <span className="flex items-center gap-1 text-[12.5px] font-semibold text-[var(--color-accent-text)]">
                            <SparkleIcon />
                            {product.finalScore}
                        </span>
                    </div>

                    {/* 배치·가격·예산 세 점수 한눈에 비교하는 용도. 애니메이션 막대그래프 */}
                    <div className="mt-1.5 space-y-1">
                        <ScoreBar
                            label={`배치 ${product.actualPosition}번째`}
                            value={product.placementScore}
                            color="var(--color-primary)"
                            delay={rank * 80}
                            size="sm"
                        />
                        <ScoreBar
                            label="ml당 가격"
                            value={product.priceScore}
                            color="var(--color-accent-deep)"
                            delay={rank * 80 + 50}
                            size="sm"
                        />
                        <ScoreBar
                            label="예산 여유"
                            value={product.budgetScore}
                            color="#c9a86a"
                            delay={rank * 80 + 100}
                            size="sm"
                        />
                    </div>

                    <p className="mt-1.5">
                        <span className="font-medium text-[var(--color-ink)]">추천 이유 </span>
                        {product.reason || '가성비 조건에 맞는 추천 제품이에요.'}
                    </p>
                </div>
            )}

            <div data-export-ignore="true" className="mt-2.5 flex gap-2">
                {onToggleCompare && (
                    <button
                        type="button"
                        onClick={onToggleCompare}
                        className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg py-1.5 text-[11.5px] font-medium transition-colors ${
                            isInCompare
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'border border-[var(--color-border)] text-[var(--color-ink-soft)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'
                        }`}>
                        <span aria-hidden>{isInCompare ? '✓' : '+'}</span>
                        {isInCompare ? `비교함에\u00A0담김` : `비교함\u00A0담기`}
                    </button>
                )}
                <button
                    type="button"
                    onClick={handleShare}
                    disabled={isExporting}
                    className="flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-[var(--color-border)] py-1.5 text-[11.5px] font-medium text-[var(--color-ink-soft)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors disabled:opacity-50">
                    <span aria-hidden>⤓</span>
                    {isExporting ? '저장 중…' : `이미지\u00A0저장`}
                </button>
            </div>

            <a
                href={product.purchaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 flex items-center justify-center gap-1.5 rounded-lg bg-[var(--color-primary)] py-2 text-[12.5px] font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors">
                구매하러 가기
                <ArrowRightIcon />
            </a>
        </div>

        {/* 막대그래프·추천 이유는 상시 노출 안 하고 "상세보기" 눌렀을 때만 바텀시트로 */}
        {compact && showDetail && (
            <div
                className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 sm:items-center sm:px-4"
                onClick={() => setShowDetail(false)}>
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="animate-fade-up w-full max-w-md rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
                    <div className="flex items-center justify-between">
                        <p className="text-[13px] font-semibold text-[var(--color-ink)]">
                            {product.brand} {product.name}
                        </p>
                        <button
                            type="button"
                            onClick={() => setShowDetail(false)}
                            aria-label="닫기"
                            className="text-[18px] leading-none text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition-colors">
                            ✕
                        </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-1.5 rounded-lg bg-[var(--color-primary-soft)]/60 px-3 py-2">
                        <span className="flex items-center gap-1.5">
                            <IngredientTag ingredientId={ingredient.id} size={18} />
                            <span className="text-[11.5px] font-semibold text-[var(--color-ink)]">{ingredient.name}</span>
                        </span>
                        <span className="flex items-center gap-1 text-[12.5px] font-semibold text-[var(--color-accent-text)]">
                            <SparkleIcon />
                            가성비 {product.finalScore}점
                        </span>
                    </div>

                    <div className="mt-3 space-y-2">
                        <ScoreBar
                            label={`핵심성분 배치 (${product.actualPosition}번째)`}
                            value={product.placementScore}
                            color="var(--color-primary)"
                        />
                        <ScoreBar label="ml당 가격" value={product.priceScore} color="var(--color-accent-deep)" delay={50} />
                        <ScoreBar label="예산 여유" value={product.budgetScore} color="#c9a86a" delay={100} />
                    </div>

                    <p className="mt-3 text-[12px] leading-relaxed text-[var(--color-ink-soft)]">
                        <span className="font-medium text-[var(--color-ink)]">추천 이유 </span>
                        {product.reason || '가성비 조건에 맞는 추천 제품이에요.'}
                    </p>
                </div>
            </div>
        )}
        </>
    );
}

function SparkleIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="shrink-0">
            <path d="M12 2.5c.9 4 2.2 6.3 4.5 7.5-2.3 1.2-3.6 3.5-4.5 7.5-.9-4-2.2-6.3-4.5-7.5 2.3-1.2 3.6-3.5 4.5-7.5Z" />
        </svg>
    );
}

function ChevronDownIcon() {
    return (
        <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="shrink-0">
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}
