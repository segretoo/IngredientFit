'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { categories, getCategory, getIngredientInCategory } from '@/lib/ingredients';
import { budgetOptions, getBudget, parseBudgetText } from '@/lib/budgets';
import { useLocalStorage } from '@/lib/useLocalStorage';
import type { SkinProfile } from '@/lib/skinProfile';
import type {
    ChatMessage,
    SelectedConditions,
    ScoredProduct,
    CategoryKey,
    AiResultMessage,
    CompareItem,
    FavoriteItem,
} from '@/types';
import IngredientCard from './IngredientCard';
import SidePanel from './SidePanel';
import ChatInput from './ChatInput';
import ScoreExplainer from './ScoreExplainer';
import CompareModal from './CompareModal';
import FavoritesModal from './FavoritesModal';
import HeaderConditionsPanel from './HeaderConditionsPanel';
import ResultCarousel from './ResultCarousel';
import MobileActionFabs from './MobileActionFabs';
import UtilityToolbar from './UtilityToolbar';
import ContactModal from '@/components/ContactModal';
import type { AuthUser } from '@/lib/auth/getUser';
import { addFavorite, removeFavorite } from '@/app/actions/favorites';

const MAX_COMPARE_ITEMS = 4;

const WELCOME_ID = 'welcome';

const initialMessages: ChatMessage[] = [
    {
        id: WELCOME_ID,
        role: 'ai',
        kind: 'intro',
        text: '안녕하세요! 피부 고민을 편하게 말씀해 주세요.',
        createdAt: Date.now(),
    },
];

const initialConditions: SelectedConditions = {
    categoryKey: null,
    ingredientId: null,
    budgetId: null,
};

function makeId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// useLocalStorage initialValue에 인라인 [] 넘기면 렌더마다 새 배열이라
// 내부 useMemo가 매번 재계산됨. 모듈 상수로 참조 고정
const initialCompareItems: CompareItem[] = [];
const initialFavoriteItems: FavoriteItem[] = [];
const EMPTY_IDS: string[] = [];

// 피부타입 프로필 localStorage 키. /skin-profile 페이지가 저장하고 여기서 읽음.
// 없으면 null (프로필 설정 안 한 상태)
const initialSkinProfile: SkinProfile | null = null;

// 함수 참조는 고정하고 최신 구현 호출하는 용도. memo된 MessageBubble에
// 넘기는 핸들러 참조가 렌더마다 바뀌면 memo 무력화돼서 이렇게 함
function useStableCallback<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
    const ref = useRef(fn);
    useEffect(() => {
        ref.current = fn;
    });
    return useCallback((...args: A) => ref.current(...args), []);
}

interface ChatWindowProps {
    // /mobile 페이지가 480px 컨테이너 안이어도 브라우저 창이 넓으면 md: 기준이
    // 진짜 뷰포트 너비로 판단돼서 2단 레이아웃이 좁은 컨테이너에서 찌그러짐.
    // true 주면 뷰포트 크기 상관없이 항상 1단으로 쌓음
    forceStacked?: boolean;
    // 부모(서버 컴포넌트)가 lib/auth/getUser로 읽어서 내려줌.
    // 로그인 상태면 즐겨찾기 토글 시 DB(favorites 테이블)에도 동기화함
    user?: AuthUser | null;
}

export default function ChatWindow({ forceStacked = false, user = null }: ChatWindowProps) {
    const [messages, setMessages, hydrated] = useLocalStorage<ChatMessage[]>('ingredientfit:messages', initialMessages);
    const [conditions, setConditions] = useLocalStorage<SelectedConditions>(
        'ingredientfit:conditions',
        initialConditions,
    );
    const [isTyping, setIsTyping] = useState(false);
    const [showScoreExplainer, setShowScoreExplainer] = useState(false);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [showFavoritesModal, setShowFavoritesModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    // 모바일 헤더의 "선택한 조건 / 처음부터 다시 시작하기" 드롭다운 패널
    const [showHeaderConditions, setShowHeaderConditions] = useState(false);
    const [previewIngredientId, setPreviewIngredientId] = useState<string | null>(null);
    const [compareItems, setCompareItems, compareHydrated] = useLocalStorage<CompareItem[]>(
        'ingredientfit:compare',
        initialCompareItems,
    );
    const [favoriteItems, setFavoriteItems, favoriteHydrated] = useLocalStorage<FavoriteItem[]>(
        'ingredientfit:favorites',
        initialFavoriteItems,
    );
    const [skinProfile] = useLocalStorage<SkinProfile | null>(
        'ingredientfit:skinProfile',
        initialSkinProfile,
    );
    const scrollRef = useRef<HTMLDivElement>(null);
    const headerConditionsRef = useRef<HTMLDivElement>(null);
    // 결과 카드처럼 세로로 긴 메시지 새로 추가됐을 때 그 메시지 시작 지점으로
    // 스크롤하는 용도 (아래 useEffect에서 씀)
    const lastMessageRef = useRef<HTMLDivElement>(null);
    const searchParams = useSearchParams();
    const autoTriggeredRef = useRef(false);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;
        const last = messages[messages.length - 1];
        // 결과 카드(kind === "result")는 세로로 길어서 무조건 맨 아래로 스크롤하면
        // 카드 상단(배지/썸네일/제품명)이 잘림. 그래서 모바일(forceStacked, 카드 1개씩
        // 풀와이드)에서는 카드 시작 지점 보이게 스크롤
        //
        // 데스크톱(카드 2개씩 + 페이지네이션 점)은 카드가 더 짧고 점까지 보이는 게
        // 자연스러워서 기존처럼 끝까지 스크롤
        //
        // scrollIntoView() 쓰면 페이지 전체 스크롤까지 같이 움직여서
        // 헤더/푸터 밀리는 버그 있었음. 그래서 getBoundingClientRect로
        // 좌표 직접 계산해서 이 컨테이너 안쪽만 스크롤하게 함
        if (forceStacked && last?.role === 'ai' && last.kind === 'result' && lastMessageRef.current) {
            const containerRect = container.getBoundingClientRect();
            const messageRect = lastMessageRef.current.getBoundingClientRect();
            const targetTop = container.scrollTop + (messageRect.top - containerRect.top);
            container.scrollTo({ top: targetTop, behavior: 'smooth' });
        } else {
            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        }
    }, [messages, isTyping, forceStacked]);

    // 랜딩 "이런 고민" 카드에서 /chat?concern=wrinkle 같은 링크로 들어오면
    // 그 고민을 자동 입력한 것처럼 바로 성분 추천까지 진행.
    // localStorage에 이전 대화 남아있으면 건드리지 않음
    useEffect(() => {
        if (!hydrated || autoTriggeredRef.current) return;
        const concern = searchParams.get('concern');
        if (!concern) return;
        const isFreshChat = messages.length === 1 && messages[0].id === WELCOME_ID && !conditions.categoryKey;
        if (!isFreshChat) return;
        const category = categories.find((c) => c.key === concern);
        if (!category) return;
        autoTriggeredRef.current = true;
        handleConcernInput(`${category.label} 고민이에요`);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hydrated, searchParams, messages, conditions]);

    // 헤더 드롭다운(선택한 조건 / 처음부터 다시 시작하기) 바깥 탭하면 닫힘
    useEffect(() => {
        if (!showHeaderConditions) return;
        function handleClickOutside(e: MouseEvent) {
            if (headerConditionsRef.current && !headerConditionsRef.current.contains(e.target as Node)) {
                setShowHeaderConditions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showHeaderConditions]);

    const lastMessageId = messages[messages.length - 1]?.id;

    const step: 'concern' | 'ingredient' | 'budget' | 'result' = !conditions.categoryKey
        ? 'concern'
        : !conditions.ingredientId
          ? 'ingredient'
          : !conditions.budgetId
            ? 'budget'
            : 'result';

    function pushUser(text: string) {
        setMessages((prev) => [...prev, { id: makeId(), role: 'user', text, createdAt: Date.now() }]);
    }

    function pushAiText(text: string) {
        setMessages((prev) => [...prev, { id: makeId(), role: 'ai', kind: 'text', text, createdAt: Date.now() }]);
    }

    async function handleConcernInput(text: string) {
        pushUser(text);
        setIsTyping(true);
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, skinProfile }),
            });
            // 서버 오류를 "지원하지 않는 질문" 안내로 오인하면 안 돼서 여기서 거름
            if (!res.ok) throw new Error(`chat api ${res.status}`);
            const data = await res.json();
            applyConcernApiResponse(data);
        } catch {
            pushAiText('성분 분석 중 문제가 생겼어요. 다시 한 번 말씀해 주시겠어요?');
        } finally {
            setIsTyping(false);
        }
    }

    // /api/chat 응답 하나를 메시지로 반영. handleConcernInput과
    // tryHandleTopicSwitch가 API 중복 호출 안 하고 이 함수 같이 씀
    function applyConcernApiResponse(data: {
        clarifyingQuestion?: string;
        categoryKey?: CategoryKey | null;
        usedAi?: boolean;
        intro?: string;
        ingredients?: unknown;
        safetyNotice?: string;
        skinTypeNotice?: string;
    }) {
        if (typeof data.clarifyingQuestion === 'string' && data.clarifyingQuestion) {
            // 너무 막연한 문장이면 카테고리 억지로 고르는 대신 되물어봄.
            // intro 메시지로 넣으면 카테고리 칩도 다시 떠서 직접 답하거나
            // 칩 눌러 바로 골라도 됨. 멀티턴처럼 자연스럽게 이어짐
            setMessages((prev) => [
                ...prev,
                {
                    id: makeId(),
                    role: 'ai',
                    kind: 'intro',
                    text: data.clarifyingQuestion as string,
                    createdAt: Date.now(),
                },
            ]);
            return;
        }

        if (!data.categoryKey) {
            // 5개 고민 카테고리 어디에도 안 맞는 질문. 억지로 고르지 말고
            // 다시 물어봄. 새 intro 메시지 넣으면 카테고리 칩도 다시 뜸
            setMessages((prev) => [
                ...prev,
                {
                    id: makeId(),
                    role: 'ai',
                    kind: 'intro',
                    text: '죄송해요, 그 부분은 제가 도와드리기 어려워요. 피부 고민을 알려주시면 성분을 추천해드릴게요!',
                    createdAt: Date.now(),
                },
            ]);
            return;
        }

        const categoryKey = data.categoryKey as CategoryKey;
        const usedAi = Boolean(data.usedAi);
        const intro = typeof data.intro === 'string' ? data.intro : undefined;
        const ingredients = Array.isArray(data.ingredients) ? data.ingredients : undefined;
        const safetyNotice = typeof data.safetyNotice === 'string' ? data.safetyNotice : undefined;
        const skinTypeNotice = typeof data.skinTypeNotice === 'string' ? data.skinTypeNotice : undefined;

        setMessages((prev) => [
            ...prev,
            {
                id: makeId(),
                role: 'ai',
                kind: 'ingredients',
                categoryKey,
                intro,
                ingredients,
                safetyNotice,
                skinTypeNotice,
                usedAi,
                createdAt: Date.now(),
            },
        ]);
        setConditions({ categoryKey, ingredientId: null, budgetId: null });
    }

    function handleIngredientSelect(categoryKey: CategoryKey, ingredientId: string, ingredientName: string) {
        if (isTyping) return;
        pushUser(`${ingredientName}로 찾아줘요!`);
        setConditions((prev) => ({ ...prev, categoryKey, ingredientId }));
        setIsTyping(true);
        window.setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                {
                    id: makeId(),
                    role: 'ai',
                    kind: 'budget-prompt',
                    ingredientName,
                    createdAt: Date.now(),
                },
            ]);
            setIsTyping(false);
        }, 450);
    }

    async function handleBudgetSelect(budgetId: string) {
        if (isTyping) return;
        const budget = getBudget(budgetId);
        pushUser(budget.label);
        setIsTyping(true);

        const ingredientId = conditions.ingredientId!;
        const categoryKey = conditions.categoryKey!;

        try {
            const res = await fetch('/api/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ingredientId, budgetId }),
            });
            // 서버 오류를 "조건에 맞는 제품 없음"으로 오인해서 조건까지 확정하면 안 됨
            if (!res.ok) throw new Error(`recommend api ${res.status}`);
            const data = await res.json();
            const results: ScoredProduct[] = data.results ?? [];

            setConditions((prev) => ({ ...prev, budgetId }));
            setMessages((prev) => [
                ...prev,
                {
                    id: makeId(),
                    role: 'ai',
                    kind: 'result',
                    categoryKey,
                    ingredientId,
                    budgetId,
                    results,
                    createdAt: Date.now(),
                },
            ]);
        } catch {
            pushAiText('추천 계산 중 문제가 생겼어요. 예산을 다시 선택해 주시겠어요?');
        } finally {
            setIsTyping(false);
        }
    }

    async function handleSubmit(rawText: string) {
        const text = rawText.trim();
        if (!text || isTyping) return;

        if (step === 'concern') {
            handleConcernInput(text);
            return;
        }

        if (step === 'ingredient') {
            const category = getCategory(conditions.categoryKey!);
            const matched = category.ingredients.find((i) => text.includes(i.name));
            if (matched) {
                handleIngredientSelect(category.key, matched.id, matched.name);
                return;
            }
            // 성분 이름 아니면 아예 다른 고민으로 넘어간 건지 먼저 확인
            const switched = await tryHandleTopicSwitch(text);
            if (!switched) {
                pushUser(text);
                pushAiText('아래 카드 중에서 관심 있는 성분을 선택해주세요 🙂');
            }
            return;
        }

        if (step === 'budget') {
            const parsed = parseBudgetText(text);
            if (parsed) {
                handleBudgetSelect(parsed.id);
                return;
            }
            // 예산 형식 아니면 아예 다른 고민으로 넘어간 건지 먼저 확인
            const switched = await tryHandleTopicSwitch(text);
            if (!switched) {
                pushUser(text);
                pushAiText("예산 범위를 버튼으로 선택하거나 '1만원', '2만원대'처럼 입력해 주세요.");
            }
            return;
        }

        // step === 'result' -> start a new round in the same conversation
        setConditions(initialConditions);
        handleConcernInput(text);
    }

    // 성분/예산 선택 단계에서 입력이 형식에 안 맞으면 화제가 다른 고민으로
    // 바뀐 건지 조용히 확인. 진짜 새 고민이면 그걸로 새로 시작하고,
    // 아니면(그냥 형식 잘못 입력) false 반환해서 기존 안내 문구 뜨게 함
    async function tryHandleTopicSwitch(text: string): Promise<boolean> {
        setIsTyping(true);
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, skinProfile }),
            });
            if (!res.ok) return false;
            const data = await res.json();
            if (data.categoryKey && !data.clarifyingQuestion) {
                pushUser(text);
                setConditions(initialConditions);
                applyConcernApiResponse(data);
                return true;
            }
            return false;
        } catch {
            return false;
        } finally {
            setIsTyping(false);
        }
    }

    function handleRestart() {
        setConditions(initialConditions);
        setMessages(initialMessages);
    }

    function handleEditCategory() {
        setConditions(initialConditions);
        setMessages((prev) => [
            ...prev,
            {
                id: makeId(),
                role: 'ai',
                kind: 'intro',
                text: '어떤 고민으로 다시 찾아볼까요?',
                createdAt: Date.now(),
            },
        ]);
    }

    function handleEditIngredient() {
        if (!conditions.categoryKey) return;
        const categoryKey = conditions.categoryKey;
        setConditions((prev) => ({ ...prev, ingredientId: null, budgetId: null }));
        setMessages((prev) => [
            ...prev,
            { id: makeId(), role: 'ai', kind: 'ingredients', categoryKey, createdAt: Date.now() },
        ]);
    }

    function handleEditBudget() {
        if (!conditions.categoryKey || !conditions.ingredientId) return;
        const ing = getIngredientInCategory(conditions.categoryKey, conditions.ingredientId);
        setConditions((prev) => ({ ...prev, budgetId: null }));
        setMessages((prev) => [
            ...prev,
            {
                id: makeId(),
                role: 'ai',
                kind: 'budget-prompt',
                ingredientName: ing?.name ?? '선택한 성분',
                createdAt: Date.now(),
            },
        ]);
    }

    function handleToggleCompare(product: ScoredProduct, ingredientName: string, categoryLabel: string) {
        // 초과 여부는 렌더 시점 state 말고 updater가 실제로 본 prev 기준으로 판정
        let overflowed = false;
        setCompareItems((prev) => {
            const exists = prev.some((item) => item.id === product.id);
            if (exists) return prev.filter((item) => item.id !== product.id);
            if (prev.length >= MAX_COMPARE_ITEMS) {
                overflowed = true;
                return prev;
            }
            return [...prev, { id: product.id, product, ingredientName, categoryLabel, addedAt: Date.now() }];
        });
        if (overflowed) {
            pushAiText(`비교함은 최대 ${MAX_COMPARE_ITEMS}개까지 담을 수 있어요. 하나를 빼고 다시 담아주세요.`);
        }
    }

    function handleRemoveFromCompare(id: string) {
        setCompareItems((prev) => prev.filter((item) => item.id !== id));
    }

    function handleClearCompare() {
        setCompareItems([]);
    }

    function handleToggleFavorite(product: ScoredProduct, ingredientName: string, categoryLabel: string) {
        const alreadyFavorited = favoriteItems.some((item) => item.id === product.id);
        setFavoriteItems((prev) => {
            const exists = prev.some((item) => item.id === product.id);
            if (exists) return prev.filter((item) => item.id !== product.id);
            return [...prev, { id: product.id, product, ingredientName, categoryLabel, addedAt: Date.now() }];
        });

        // 화면(로컬 상태)은 위에서 이미 반영됨. 로그인 상태면 DB에도 반영 시도 —
        // 여기서 실패해도 사용자 액션은 막지 않고 콘솔에만 남김
        if (user) {
            const syncPromise = alreadyFavorited ? removeFavorite(product.id) : addFavorite(product.id);
            syncPromise.catch((err) => console.error('[favorites] 동기화 실패:', err));
        }
    }

    function handleRemoveFromFavorites(id: string) {
        setFavoriteItems((prev) => prev.filter((item) => item.id !== id));
    }

    const category = conditions.categoryKey ? getCategory(conditions.categoryKey) : null;
    const ingredient =
        conditions.categoryKey && conditions.ingredientId
            ? (getIngredientInCategory(conditions.categoryKey, conditions.ingredientId) ?? null)
            : null;
    const budget = conditions.budgetId ? getBudget(conditions.budgetId) : null;

    // 우측 패널에 보여줄 성분: 고르는 중이면 마우스오버(또는 포커스) 중인 성분,
    // 없거나(또는 카테고리가 바뀌어 더 이상 유효하지 않으면) 추천 성분(또는 첫번째)을 기본값으로.
    // 이미 골랐다면 확정된 성분을 계속 보여줌.
    const previewIngredient =
        step === 'ingredient' && category
            ? (category.ingredients.find((i) => i.id === previewIngredientId) ??
              category.ingredients.find((i) => i.recommended) ??
              category.ingredients[0] ??
              null)
            : ingredient;

    const latestResultMessage = useMemo(() => {
        for (let i = messages.length - 1; i >= 0; i--) {
            const m = messages[i];
            if (m.role === 'ai' && m.kind === 'result') return m as AiResultMessage;
        }
        return undefined;
    }, [messages]);

    // memo된 MessageBubble이 효과 있으려면 넘기는 props 참조가 안정적이어야 함.
    // 핸들러는 useStableCallback으로 고정, id 배열은 원본 바뀔 때만 새로 만듦
    const stableToggleCompare = useStableCallback(handleToggleCompare);
    const stableToggleFavorite = useStableCallback(handleToggleFavorite);
    const stableIngredientSelect = useStableCallback(handleIngredientSelect);
    const stableBudgetSelect = useStableCallback(handleBudgetSelect);
    const stableCategoryChip = useStableCallback((key: CategoryKey) => {
        const c = getCategory(key);
        handleConcernInput(`${c.label} 고민이에요`);
    });
    const compareIds = useMemo(() => compareItems.map((item) => item.id), [compareItems]);
    const favoriteIds = useMemo(() => favoriteItems.map((item) => item.id), [favoriteItems]);

    const showSidePanel = step !== 'concern';

    return (
        <div
            className={
                forceStacked
                    ? // 실제 모바일 브라우저는 주소창 때문에 보이는 높이가 계속 바뀌는데
                      // 100vh는 주소창 사라졌을 때 최댓값으로 고정이라 처음 켰을 때 카드가
                      // 화면보다 커져서 헤더/입력창 보려면 스크롤해야 하는 버그 있었음
                      // (크롬 데스크톱 기기 시뮬레이터에선 재현 안 돼서 멀쩡해 보였음).
                      // 100dvh(동적 뷰포트 높이)로 바꾸고 카드도 고정 760px 대신 h-full로
                      // 꽉 채워서 모바일 헤더(65px) 아래 헤더/메시지창/입력창이 항상
                      // 한 화면에 다 들어오게 함
                      'flex h-[calc(100dvh-65px)] flex-col overflow-hidden bg-[var(--color-primary-soft)] px-3 py-3'
                    : 'min-h-[calc(100vh-65px)] bg-[var(--color-primary-soft)] px-4 py-10'
            }>
            <div
                className={`mx-auto flex-1 animate-fade-up grid max-w-4xl gap-4 ${
                    forceStacked ? 'h-full min-h-0' : 'md:grid-cols-[1fr_260px]'
                }`}>
                <div
                    className={`relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ${
                        forceStacked ? 'h-full min-h-0' : 'h-[760px]'
                    }`}>
                    <div ref={headerConditionsRef} className="relative border-b border-[var(--color-border)]">
                        <div className="flex items-center justify-between px-4 py-3">
                            <span className="text-[12.5px] font-semibold text-[var(--color-ink)]">성분핏 AI 상담</span>
                            {forceStacked && (
                                <button
                                    type="button"
                                    onClick={() => setShowHeaderConditions((v) => !v)}
                                    aria-expanded={showHeaderConditions}
                                    aria-label={showHeaderConditions ? '선택한 조건 닫기' : '선택한 조건 보기'}
                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[var(--color-ink-soft)] transition-colors hover:bg-gray-50 ${
                                        showHeaderConditions ? 'bg-gray-50' : ''
                                    }`}>
                                    <HeaderChevronIcon rotated={showHeaderConditions} />
                                </button>
                            )}
                        </div>

                        {forceStacked && showHeaderConditions && (
                            <HeaderConditionsPanel
                                category={category}
                                ingredient={ingredient}
                                budget={budget}
                                onEditCategory={handleEditCategory}
                                onEditIngredient={conditions.ingredientId ? handleEditIngredient : undefined}
                                onEditBudget={conditions.budgetId ? handleEditBudget : undefined}
                                onRestart={handleRestart}
                                onClose={() => setShowHeaderConditions(false)}
                            />
                        )}
                    </div>

                    <div ref={scrollRef} className="chat-scroll flex-1 overflow-y-auto px-6 py-6 space-y-4">
                        {!hydrated ? null : (
                            <>
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        ref={message.id === lastMessageId ? lastMessageRef : undefined}>
                                        {/* previewIngredientId(마우스오버)와 compare/favorite id 목록은
                                            ingredients/result 메시지만 실제로 씀. 해당 종류 아니면 고정값
                                            넘겨서 마우스오버/담기 때 다른 말풍선 리렌더 안 되게 함 */}
                                        <MessageBubble
                                            message={message}
                                            showChips={message.id === lastMessageId && step === 'concern'}
                                            previewIngredientId={
                                                message.role === 'ai' && message.kind === 'ingredients'
                                                    ? previewIngredientId
                                                    : null
                                            }
                                            onIngredientPreview={setPreviewIngredientId}
                                            compareIds={
                                                message.role === 'ai' && message.kind === 'result'
                                                    ? compareIds
                                                    : EMPTY_IDS
                                            }
                                            onToggleCompare={stableToggleCompare}
                                            favoriteIds={
                                                message.role === 'ai' && message.kind === 'result'
                                                    ? favoriteIds
                                                    : EMPTY_IDS
                                            }
                                            onToggleFavorite={stableToggleFavorite}
                                            forceStacked={forceStacked}
                                            hasSkinProfile={skinProfile !== null}
                                            onCategoryChip={stableCategoryChip}
                                            onIngredientSelect={stableIngredientSelect}
                                            onBudgetChip={stableBudgetSelect}
                                            disabled={isTyping}
                                        />
                                    </div>
                                ))}
                                {isTyping && <TypingBubble />}
                            </>
                        )}
                    </div>

                    <ChatInput
                        onSubmit={handleSubmit}
                        disabled={isTyping}
                        leading={
                            forceStacked ? (
                                <MobileActionFabs
                                    compareCount={compareHydrated ? compareItems.length : 0}
                                    favoriteCount={favoriteHydrated ? favoriteItems.length : 0}
                                    onOpenCalc={() => setShowScoreExplainer(true)}
                                    onOpenCompare={() => setShowCompareModal(true)}
                                    onOpenFavorites={() => setShowFavoritesModal(true)}
                                    onOpenContact={() => setShowContactModal(true)}
                                />
                            ) : undefined
                        }
                        placeholder={
                            step === 'concern'
                                ? '피부 고민을 입력해주세요.'
                                : step === 'ingredient'
                                  ? '또는 직접 입력해주세요'
                                  : step === 'budget'
                                    ? '또는 직접 입력해주세요'
                                    : '다른 고민도 물어보세요'
                        }
                    />
                </div>

                {/* 모바일(forceStacked)에선 이 우측 패널 전체(계산법/비교함/선택한 조건/
            다시 시작하기)를 채팅창 헤더 화살표 패널 + 입력창 옆 "+" 메뉴로 옮김.
            대화 길어져도 카드 아래로 스크롤 없이 바로 확인 가능 */}
                {!forceStacked && (
                    <div className="space-y-3">
                        <UtilityToolbar
                            onOpenCalc={() => setShowScoreExplainer(true)}
                            compareCount={compareHydrated ? compareItems.length : 0}
                            onOpenCompare={() => setShowCompareModal(true)}
                            favoriteCount={favoriteHydrated ? favoriteItems.length : 0}
                            onOpenFavorites={() => setShowFavoritesModal(true)}
                            onOpenContact={() => setShowContactModal(true)}
                        />

                        {showSidePanel && (
                            <SidePanel
                                mode="conditions"
                                category={category}
                                ingredient={ingredient}
                                budget={budget}
                                onEditCategory={handleEditCategory}
                                onEditIngredient={conditions.ingredientId ? handleEditIngredient : undefined}
                                onEditBudget={conditions.budgetId ? handleEditBudget : undefined}
                            />
                        )}

                        {step === 'ingredient' && previewIngredient && (
                            <SidePanel mode="detail" ingredient={previewIngredient} />
                        )}
                        {step !== 'ingredient' && ingredient && <SidePanel mode="detail" ingredient={ingredient} />}

                        <button
                            type="button"
                            onClick={handleRestart}
                            className="w-full rounded-xl border border-[var(--color-border)] bg-white py-2.5 text-[12.5px] font-medium text-[var(--color-ink-soft)] hover:bg-gray-50 transition-colors">
                            처음부터 다시 시작하기
                        </button>
                    </div>
                )}
            </div>

            <ScoreExplainer
                open={showScoreExplainer}
                onClose={() => setShowScoreExplainer(false)}
                latestResult={latestResultMessage}
            />

            {compareHydrated && (
                <CompareModal
                    open={showCompareModal}
                    items={compareItems}
                    onClose={() => setShowCompareModal(false)}
                    onRemove={handleRemoveFromCompare}
                    onClearAll={handleClearCompare}
                />
            )}

            {favoriteHydrated && (
                <FavoritesModal
                    open={showFavoritesModal}
                    items={favoriteItems}
                    onClose={() => setShowFavoritesModal(false)}
                    onRemove={handleRemoveFromFavorites}
                />
            )}

            <ContactModal open={showContactModal} onClose={() => setShowContactModal(false)} />
        </div>
    );
}

function HeaderChevronIcon({ rotated }: { rotated: boolean }) {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="transition-transform duration-200"
            style={{ transform: rotated ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}

function AiAvatar() {
    return (
        <span
            aria-hidden
            className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-white text-[11px] font-semibold">
            AI
        </span>
    );
}

function TypingBubble() {
    return (
        <div className="flex items-start gap-2.5 animate-fade-up">
            <AiAvatar />
            <div className="rounded-2xl rounded-tl-sm bg-[var(--color-primary-soft)] px-4 py-3 flex items-center gap-1">
                <span
                    className="dot h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]"
                    style={{ animationDelay: '0ms' }}
                />
                <span
                    className="dot h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]"
                    style={{ animationDelay: '150ms' }}
                />
                <span
                    className="dot h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]"
                    style={{ animationDelay: '300ms' }}
                />
            </div>
        </div>
    );
}

// memo: 키 입력/마우스오버로 ChatWindow 리렌더돼도 props 그대로인 기존
// 말풍선(확정된 메시지)은 다시 안 그림. 대화 길어질수록 효과 큼
const MessageBubble = memo(function MessageBubble({
    message,
    showChips,
    previewIngredientId,
    onIngredientPreview,
    compareIds,
    onToggleCompare,
    favoriteIds,
    onToggleFavorite,
    forceStacked,
    hasSkinProfile,
    onCategoryChip,
    onIngredientSelect,
    onBudgetChip,
    disabled,
}: {
    message: ChatMessage;
    showChips: boolean;
    previewIngredientId: string | null;
    onIngredientPreview: (id: string | null) => void;
    compareIds: string[];
    onToggleCompare: (product: ScoredProduct, ingredientName: string, categoryLabel: string) => void;
    favoriteIds: string[];
    onToggleFavorite: (product: ScoredProduct, ingredientName: string, categoryLabel: string) => void;
    forceStacked: boolean;
    hasSkinProfile: boolean;
    onCategoryChip: (categoryKey: CategoryKey) => void;
    onIngredientSelect: (categoryKey: CategoryKey, ingredientId: string, ingredientName: string) => void;
    onBudgetChip: (budgetId: string) => void;
    disabled: boolean;
}) {
    if (message.role === 'user') {
        return (
            <div className="flex justify-end animate-fade-up">
                <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-[var(--color-primary)] px-4 py-2.5 text-[13px] text-white">
                    {message.text}
                </div>
            </div>
        );
    }

    if (message.kind === 'text') {
        return (
            <div className="flex items-start gap-2.5 animate-fade-up">
                <AiAvatar />
                <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-[var(--color-primary-soft)] px-4 py-3">
                    <p className="text-[13px] text-[var(--color-ink)]">{message.text}</p>
                </div>
            </div>
        );
    }

    if (message.kind === 'intro') {
        return (
            <div className="animate-fade-up space-y-3">
                <div className="flex items-start gap-2.5">
                    <AiAvatar />
                    <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-[var(--color-primary-soft)] px-4 py-3">
                        <p className="text-[13.5px] font-medium text-[var(--color-ink)]">{message.text}</p>
                        <p className="mt-1 text-[11.5px] text-[var(--color-ink-faint)]">
                            예: &ldquo;주름이 고민이에요&rdquo;, &ldquo;트러블이 심해요&rdquo;
                        </p>
                    </div>
                </div>
                {showChips && (
                    <div className="flex flex-wrap gap-2 ml-9">
                        {categories.map((c) => (
                            <button
                                key={c.key}
                                type="button"
                                onClick={() => onCategoryChip(c.key)}
                                disabled={disabled}
                                className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-[11.5px] text-[var(--color-ink-soft)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors disabled:opacity-40">
                                {c.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (message.kind === 'ingredients') {
        const category = getCategory(message.categoryKey);
        // 서버가 안전 조정한 실제 목록 우선, 없으면(옛날 대화 기록 등) 정적 데이터로 폴백
        const ingredientList = message.ingredients ?? category.ingredients;
        const previewBelongsHere = ingredientList.some((i) => i.id === previewIngredientId);
        const activeId = previewBelongsHere
            ? previewIngredientId
            : (ingredientList.find((i) => i.recommended)?.id ?? ingredientList[0]?.id);
        return (
            <div className="flex items-start gap-2.5 animate-fade-up">
                <AiAvatar />
                {/* 다른 텍스트 말풍선은 max-w-[80~85%]인데 성분 카드 리스트는
              ResultCard처럼 실제 박스 콘텐츠라 좁게 담으면 카드가 눌려 보임.
              results 메시지는 이미 이 이유로 폭 넓혔는데 여기만 85%로 남아서
              고민 선택 직후엔 좁다가 결과 나오면 갑자기 넓어지는 것처럼 보였음.
              그래서 두 단계 폭 맞춤 */}
                <div className="w-full min-w-0 space-y-2.5">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-[var(--color-primary-soft)] px-4 py-3">
                        <p className="text-[13.5px] font-medium text-[var(--color-ink)]">
                            {message.intro || category.intro}
                        </p>
                    </div>
                    {message.safetyNotice && (
                        <div className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-3 text-[12px] leading-relaxed text-amber-900">
                            {message.safetyNotice}
                        </div>
                    )}
                    {message.skinTypeNotice ? (
                        // 피부타입 반영해서 순서 바꿨을 때. safety(앰버)랑 구분되게 보라 톤
                        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-primary-soft)] px-3.5 py-3 text-[12px] leading-relaxed text-[var(--color-ink-soft)]">
                            {message.skinTypeNotice}
                        </div>
                    ) : (
                        !hasSkinProfile && (
                            // 프로필 없으면 설정 유도. 있는데 재정렬 안 된 경우(전부 동점)엔 안 뜸
                            <a
                                href={forceStacked ? '/mobile/skin-profile' : '/skin-profile'}
                                className="block rounded-xl border border-dashed border-[var(--color-border)] px-3.5 py-3 text-[12px] leading-relaxed text-[var(--color-ink-soft)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors">
                                💡 피부타입을 설정하면 내 피부에 맞춰 성분 순서를 더 정확하게 추천해드려요.
                            </a>
                        )
                    )}
                    <div className="space-y-2">
                        {ingredientList.map((ingredient) => (
                            <IngredientCard
                                key={ingredient.id}
                                ingredient={ingredient}
                                selected={ingredient.id === activeId}
                                onPreview={() => onIngredientPreview(ingredient.id)}
                                onSelect={() => onIngredientSelect(category.key, ingredient.id, ingredient.name)}
                                compact={forceStacked}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (message.kind === 'budget-prompt') {
        return (
            <div className="flex items-start gap-2.5 animate-fade-up">
                <AiAvatar />
                <div className="max-w-[85%] space-y-2.5">
                    <div className="rounded-2xl rounded-tl-sm bg-[var(--color-primary-soft)] px-4 py-3">
                        <p className="text-[13.5px] font-medium text-[var(--color-ink)]">
                            좋아요! {message.ingredientName}이 상위에 배치된 세럼을 찾아드릴게요. 예산은 어느 정도
                            생각하세요?
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {budgetOptions.map((b) => (
                            <button
                                key={b.id}
                                type="button"
                                onClick={() => onBudgetChip(b.id)}
                                disabled={disabled}
                                className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-[11.5px] text-[var(--color-ink-soft)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors disabled:opacity-40">
                                {b.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // kind === 'result'
    const category = getCategory(message.categoryKey);
    const ingredient = getIngredientInCategory(message.categoryKey, message.ingredientId);
    if (!ingredient) return null;

    return (
        <div className="flex items-start gap-2.5 animate-fade-up">
            <AiAvatar />
            {/* 다른 말풍선은 max-w-[85~90%]인데 결과 카드 캐러셀은 그만큼 좁으면
          카드가 왼쪽으로 치우쳐 보이고 성분명 텍스트 잘림. 그래서 이 메시지만
          채팅창 폭 거의 다 쓰게 넓힘 */}
            <div className="w-full min-w-0 space-y-3.5">
                <div className="rounded-2xl rounded-tl-sm bg-[var(--color-primary-soft)] px-4 py-3">
                    <p className="text-[13.5px] font-medium text-[var(--color-ink)]">
                        선택하신 성분과 예산을 기준으로 TOP{message.results.length} 세럼을 추천드려요.
                    </p>
                    <p className="mt-1 text-[11px] text-[var(--color-ink-faint)]">
                        {category.label} · {ingredient.name} · {getBudget(message.budgetId).label}
                    </p>
                    {message.results.length > 0 && message.results.length < 3 && (
                        <p className="mt-1.5 text-[11px] text-[var(--color-ink-soft)]">
                            지금 이 조건에 맞는 제품은 이 {message.results.length}개가 전부예요.
                        </p>
                    )}
                </div>
                {message.results.length === 0 ? (
                    <div className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-4 text-[12.5px] text-[var(--color-ink-soft)]">
                        아쉽게도 이 예산 범위에는 조건에 맞는 제품이 없어요. 다른 예산을 선택해 보시겠어요?
                    </div>
                ) : (
                    // 결과 3개일 때 2열 그리드면 3번째 카드가 아래로 떨어져 세로로 길어짐.
                    // 그래서 캐러셀로 통일. 처음엔 데스크톱만 2개씩 보여줬는데 카드 폭
                    // 좁아지니 "추천 이유" 문단 줄바꿈 늘어서 오히려 세로로 길어지는
                    // 역효과 있었음. 결국 모바일/데스크톱 구분 없이 카드 1개씩
                    // 풀와이드 + 옆으로 넘기는 방식으로 통일
                    <ResultCarousel
                        results={message.results}
                        ingredient={ingredient}
                        compareIds={compareIds}
                        onToggleCompare={(product) => onToggleCompare(product, ingredient.name, category.label)}
                        favoriteIds={favoriteIds}
                        onToggleFavorite={(product) => onToggleFavorite(product, ingredient.name, category.label)}
                        compact={forceStacked}
                        cardsPerView={1}
                    />
                )}
            </div>
        </div>
    );
});
