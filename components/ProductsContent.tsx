'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { categories, getAllUniqueIngredients, getCategory, getIngredient } from '@/lib/ingredients';
import type { CategoryKey, Product } from '@/types';
import ProductDetailModal from '@/components/product/ProductDetailModal';
import ArrowRightIcon from '@/components/ArrowRightIcon';
import RequestProductModal from '@/components/RequestProductModal';
import IngredientTag from '@/components/IngredientTag';
import { getIngredientColor } from '@/lib/ingredientVisual';
import { addFavorite, removeFavorite } from '@/app/actions/favorites';
import type { AuthUser } from '@/lib/auth/getUser';

const PAGE_SIZE = 12; // 3열 x 4행 (모바일에선 1열 x 12행)

type SortKey = 'name' | 'priceAsc' | 'priceDesc' | 'pricePerMlAsc' | 'pricePerMlDesc' | 'volumeAsc' | 'volumeDesc';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
    { value: 'name', label: '기본순' },
    { value: 'pricePerMlAsc', label: 'ml당 가격 낮은순' },
    { value: 'pricePerMlDesc', label: 'ml당 가격 높은순' },
    { value: 'priceAsc', label: '전체 가격 낮은순' },
    { value: 'priceDesc', label: '전체 가격 높은순' },
    { value: 'volumeAsc', label: '용량 작은순' },
    { value: 'volumeDesc', label: '용량 큰순' },
];

function sortProducts(list: Product[], sortKey: SortKey): Product[] {
    const arr = [...list];
    switch (sortKey) {
        case 'priceAsc':
            return arr.sort((a, b) => a.price - b.price);
        case 'priceDesc':
            return arr.sort((a, b) => b.price - a.price);
        case 'pricePerMlAsc':
            return arr.sort((a, b) => a.price / a.volumeMl - b.price / b.volumeMl);
        case 'pricePerMlDesc':
            return arr.sort((a, b) => b.price / b.volumeMl - a.price / a.volumeMl);
        case 'volumeAsc':
            return arr.sort((a, b) => a.volumeMl - b.volumeMl);
        case 'volumeDesc':
            return arr.sort((a, b) => b.volumeMl - a.volumeMl);
        default:
            return arr.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    }
}

interface Props {
    // 모바일(480px 컨테이너)에선 항상 1열, 상단 CTA도 세로로 쌓음
    compact?: boolean;
    // Supabase 연동 후엔 lib/products.ts 정적 배열 직접 import 안 함.
    // 부모 서버 컴포넌트(app/products/page.tsx)가 getAllProducts()로 조회해서 props로 내려줌.
    // "use client" 유지하면서 최신 Supabase 데이터 쓰려고 이렇게 함
    products: Product[];
    // 로그인 상태(비로그인이면 별 눌러도 /login으로 보냄) + 이미 즐겨찾기한 product_id 목록(초기값)
    user?: AuthUser | null;
    favoriteIds?: string[];
}

export default function ProductsContent({ compact = false, products, user = null, favoriteIds = [] }: Props) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<CategoryKey | 'all'>('all');
    const [filterIngredient, setFilterIngredient] = useState<string>('all');
    const [sortKey, setSortKey] = useState<SortKey>('name');
    const [page, setPage] = useState(1);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [favoriteIdSet, setFavoriteIdSet] = useState<Set<string>>(() => new Set(favoriteIds));

    // 즐겨찾기 여부와 무관하게 카드 자체의 클릭(상세 모달 열기) 동작은 그대로 유지하면서
    // 별 버튼만 별도로 토글되게 함(이벤트 버블링 막음). 비로그인이면 로그인 페이지로 유도 —
    // 여기 즐겨찾기는 채팅(로컬 폴백 있음)과 달리 계정 저장 전용이라 로그인 필수
    function handleToggleFavorite(productId: string) {
        if (!user) {
            router.push('/login?redirect=/products');
            return;
        }

        const alreadyFavorited = favoriteIdSet.has(productId);
        setFavoriteIdSet((prev) => {
            const next = new Set(prev);
            if (alreadyFavorited) next.delete(productId);
            else next.add(productId);
            return next;
        });

        const action = alreadyFavorited ? removeFavorite(productId) : addFavorite(productId);
        action.catch((err) => {
            console.error('[favorites] 동기화 실패:', err);
            // 실패했으면 화면 표시를 원래대로 되돌림
            setFavoriteIdSet((prev) => {
                const next = new Set(prev);
                if (alreadyFavorited) next.add(productId);
                else next.delete(productId);
                return next;
            });
        });
    }

    const availableIngredients =
        filterCategory === 'all' ? getAllUniqueIngredients() : getCategory(filterCategory).ingredients;

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        let list = products.filter((p) => {
            const ingredientName = getIngredient(p.ingredientId)?.name ?? '';
            const matchesQuery =
                !q ||
                p.name.toLowerCase().includes(q) ||
                p.brand.toLowerCase().includes(q) ||
                ingredientName.toLowerCase().includes(q);
            const matchesIngredient = filterIngredient === 'all' || p.ingredientId === filterIngredient;
            const matchesCategory =
                filterCategory === 'all' ||
                getCategory(filterCategory).ingredients.some((i) => i.id === p.ingredientId);
            return matchesQuery && matchesIngredient && matchesCategory;
        });
        list = sortProducts(list, sortKey);
        return list;
    }, [products, query, filterCategory, filterIngredient, sortKey]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    // "성분핏 추천" 뱃지: 같은 성분 제품 중 ml당 가격 최저인 것에 표시.
    // 이 페이지엔 예산 조건이 없어서 객관적으로 계산 가능한 "용량 대비 가격"만 기준으로 씀
    const bestValueIds = useMemo(() => {
        const byIngredient = new Map<string, Product>();
        for (const p of products) {
            const current = byIngredient.get(p.ingredientId);
            if (!current || p.price / p.volumeMl < current.price / current.volumeMl) {
                byIngredient.set(p.ingredientId, p);
            }
        }
        return new Set(Array.from(byIngredient.values()).map((p) => p.id));
    }, [products]);

    function resetToFirstPage() {
        setPage(1);
    }

    return (
        <>
            <div className={`flex flex-wrap items-start justify-between gap-4 ${compact ? 'flex-col' : ''}`}>
                <div>
                    <h1
                        className={
                            compact
                                ? 'text-[18px] font-bold text-[var(--color-ink)]'
                                : 'text-[22px] font-bold text-[var(--color-ink)]'
                        }>
                        화장품 검색
                    </h1>
                    <p className="mt-1.5 text-[12.5px] text-[var(--color-ink-faint)]">
                        성분핏 DB에 등록된 세럼 {products.length}종을 바로 검색해보세요. 채팅 없이도 둘러볼 수 있어요.
                    </p>
                </div>
                <Link
                    href={compact ? '/mobile/chat' : '/chat'}
                    className={`inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent-deep)] px-4 py-2.5 text-[12.5px] font-semibold text-white hover:brightness-110 transition-all shrink-0 ${
                        compact ? 'w-full justify-center' : ''
                    }`}>
                    내 고민에 맞게 AI로 추천받기
                    <ArrowRightIcon />
                </Link>
            </div>

            <div className="mt-6 space-y-3">
                <input
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        resetToFirstPage();
                    }}
                    placeholder="제품명, 브랜드, 성분명으로 검색 (예: 레티놀, 셀루틴)"
                    className={`w-full rounded-lg border border-[var(--color-border)] px-3.5 py-2.5 text-[13px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] outline-none focus:border-[var(--color-primary)] transition-colors ${
                        compact ? '' : 'max-w-md'
                    }`}
                />

                <div className="flex flex-wrap gap-2.5">
                    <select
                        value={filterCategory}
                        onChange={(e) => {
                            setFilterCategory(e.target.value as CategoryKey | 'all');
                            setFilterIngredient('all');
                            resetToFirstPage();
                        }}
                        className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[12.5px] text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)] transition-colors">
                        <option value="all">전체 고민</option>
                        {categories.map((c) => (
                            <option key={c.key} value={c.key}>
                                {c.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filterIngredient}
                        onChange={(e) => {
                            setFilterIngredient(e.target.value);
                            resetToFirstPage();
                        }}
                        className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[12.5px] text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)] transition-colors">
                        <option value="all">전체 성분</option>
                        {availableIngredients.map((i) => (
                            <option key={i.id} value={i.id}>
                                {i.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={sortKey}
                        onChange={(e) => {
                            setSortKey(e.target.value as SortKey);
                            resetToFirstPage();
                        }}
                        className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-[12.5px] text-[var(--color-ink)] outline-none focus:border-[var(--color-primary)] transition-colors">
                        {SORT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    {(filterCategory !== 'all' || filterIngredient !== 'all' || sortKey !== 'name' || query) && (
                        <button
                            type="button"
                            onClick={() => {
                                setQuery('');
                                setFilterCategory('all');
                                setFilterIngredient('all');
                                setSortKey('name');
                                resetToFirstPage();
                            }}
                            className="rounded-lg px-3 py-2 text-[12.5px] text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition-colors">
                            필터 초기화
                        </button>
                    )}
                </div>
            </div>

            <p className="mt-4 text-[11.5px] text-[var(--color-ink-faint)]">{filtered.length}개 제품</p>

            {filtered.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-[var(--color-border)] p-8 text-center">
                    <p className="text-[13.5px] font-medium text-[var(--color-ink)]">
                        조건에 맞는 제품을 찾지 못했어요.
                    </p>
                    <p className="mt-1.5 text-[12.5px] text-[var(--color-ink-faint)]">
                        아직 DB에 없는 제품일 수 있어요. 추가해달라고 요청해보세요.
                    </p>
                    <button
                        type="button"
                        onClick={() => setShowRequestModal(true)}
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-[12.5px] font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors">
                        이 제품 추가 요청하기
                        <ArrowRightIcon />
                    </button>
                </div>
            ) : (
                <>
                    <div className={`mt-4 grid gap-3 ${compact ? '' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
                        {paginated.map((p) => {
                            const ingredient = getIngredient(p.ingredientId);
                            const pricePerMl = Math.round(p.price / p.volumeMl);
                            const isBestValue = bestValueIds.has(p.id);
                            const accentColor = getIngredientColor(p.ingredientId);
                            return (
                                <div
                                    key={p.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => setSelectedProduct(p)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') setSelectedProduct(p);
                                    }}
                                    className="relative cursor-pointer rounded-xl border p-4 text-left shadow-none transition-shadow hover:shadow-md"
                                    style={{
                                        borderColor: `${accentColor}40`,
                                        backgroundColor: `${accentColor}0d`,
                                    }}>
                                    {/* 카드 전체 클릭(상세 모달)과 별 토글이 겹치지 않게 절대 위치로 분리 */}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleFavorite(p.id);
                                        }}
                                        aria-label={favoriteIdSet.has(p.id) ? '즐겨찾기 해제' : '즐겨찾기에 담기'}
                                        aria-pressed={favoriteIdSet.has(p.id)}
                                        className={`absolute right-3 top-3 text-[16px] leading-none transition-colors ${
                                            favoriteIdSet.has(p.id)
                                                ? 'text-[var(--color-primary)]'
                                                : 'text-[var(--color-ink-faint)] hover:text-[var(--color-primary)]'
                                        }`}>
                                        {favoriteIdSet.has(p.id) ? '★' : '☆'}
                                    </button>
                                    <div className="flex items-start gap-3 pr-5">
                                        {/* 더미 제품이라 실사진 없음. 파스텔 배경(imageColor) + 공용 세럼 아이콘 플레이스홀더 */}
                                        <div
                                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
                                            style={{ backgroundColor: p.imageColor }}
                                            aria-hidden>
                                            <Image
                                                src="/images/serum-placeholder.png"
                                                alt=""
                                                width={26}
                                                height={26}
                                                className="opacity-80"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-[13px] font-semibold text-[var(--color-ink)]">
                                                {p.brand} {p.name}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-[var(--color-ink-faint)]">
                                                {p.price.toLocaleString()}원 · {p.volumeMl}ml · ml당{' '}
                                                {pricePerMl.toLocaleString()}원
                                            </p>
                                        </div>
                                    </div>
                                    {/* 성분 태그랑 같은 줄, 같은 스타일(둥근 필)로 둬서 통일감.
                    태그 행이 이름 줄과 별개라 배지 있어도 카드 높이 안 변함 */}
                                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                                        {ingredient && (
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary-soft)] py-1 pl-1 pr-2.5 text-[11px] font-medium text-[var(--color-primary)]">
                                                <IngredientTag ingredientId={ingredient.id} size={18} />
                                                {ingredient.name}
                                            </span>
                                        )}
                                        {isBestValue && (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-accent-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-accent-text)]">
                                                <SparkleIcon />
                                                성분핏 추천
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] text-[var(--color-ink-soft)] hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                <ChevronIcon direction="left" />
                                이전
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                                <button
                                    key={n}
                                    type="button"
                                    onClick={() => setPage(n)}
                                    className={`h-7 w-7 rounded-lg text-[12px] font-medium transition-colors ${
                                        n === currentPage
                                            ? 'bg-[var(--color-primary)] text-white'
                                            : 'text-[var(--color-ink-soft)] hover:bg-gray-50'
                                    }`}>
                                    {n}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] text-[var(--color-ink-soft)] hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                다음
                                <ChevronIcon direction="right" />
                            </button>
                        </div>
                    )}

                    <div className="mt-10 rounded-2xl bg-[var(--color-primary-soft)]/50 p-6 text-center">
                        <p className="text-[13px] text-[var(--color-ink)]">
                            찾는 제품이 목록에 없나요? 추가해달라고 알려주세요.
                        </p>
                        <button
                            type="button"
                            onClick={() => setShowRequestModal(true)}
                            className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-primary)] px-4 py-2 text-[12.5px] font-medium text-[var(--color-primary)] hover:bg-white transition-colors">
                            제품 추가 요청하기
                            <ArrowRightIcon />
                        </button>
                    </div>
                </>
            )}

            <ProductDetailModal
                product={selectedProduct}
                isBestValue={selectedProduct ? bestValueIds.has(selectedProduct.id) : false}
                isFavorite={selectedProduct ? favoriteIdSet.has(selectedProduct.id) : false}
                onToggleFavorite={selectedProduct ? () => handleToggleFavorite(selectedProduct.id) : undefined}
                onClose={() => setSelectedProduct(null)}
            />
            <RequestProductModal
                open={showRequestModal}
                initialName={query}
                onClose={() => setShowRequestModal(false)}
            />
        </>
    );
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden>
            {direction === 'left' ? <path d="m15 18-6-6 6-6" /> : <path d="m9 18 6-6-6-6" />}
        </svg>
    );
}

function SparkleIcon() {
    return (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="shrink-0">
            <path d="M12 2.5c.9 4 2.2 6.3 4.5 7.5-2.3 1.2-3.6 3.5-4.5 7.5-.9-4-2.2-6.3-4.5-7.5 2.3-1.2 3.6-3.5 4.5-7.5Z" />
        </svg>
    );
}
