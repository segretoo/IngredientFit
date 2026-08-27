import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import { getUser } from '@/lib/auth/getUser';
import Footer from '@/components/Footer';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import CountUp from '@/components/CountUp';
import TypewriterHeading from '@/components/TypewriterHeading';
import StepIcon from '@/components/StepIcon';
import ResultUIShowcase from '@/components/ResultUIShowcase';
import IconMarquee from '@/components/IconMarquee';
import ConcernIcon from '@/components/ConcernIcon';
import IngredientConverge from '@/components/IngredientConverge';
import MeshGradientBg from '@/components/MeshGradientBg';
import InteractiveScoreDemo from '@/components/InteractiveScoreDemo';
import ScrollProgressLine from '@/components/ScrollProgressLine';
import ScoreDonut from '@/components/ScoreDonut';
import ArrowRightIcon from '@/components/ArrowRightIcon';

const steps = [
    { icon: 'chat', title: '고민 입력', desc: '피부 고민을 선택하거나 입력' },
    { icon: 'search', title: '성분 추천', desc: 'AI가 핵심 성분을 제안' },
    { icon: 'budget', title: '예산 설정', desc: '예산 범위를 선택' },
    { icon: 'cosmetic', title: 'TOP3 결과', desc: '최적의 화장품 추천' },
];

const concerns = [
    { icon: 'wrinkle', label: '주름·탄력' },
    { icon: 'brightening', label: '미백·잡티' },
    { icon: 'hydration', label: '수분·건조' },
    { icon: 'pore', label: '모공·트러블' },
    { icon: 'texture', label: '피부결·광채' },
];

const goodPoints = ['전성분 배치 순서 기반', '용량 대비 가격 비교', '가성비 지수 산출', 'AI 대화형 추천'];

export default async function LandingPage() {
    const user = await getUser();

    return (
        <main className="min-h-screen bg-white">
            <Header transparentOverHero user={user} />

            {/* Hero: 메인 보라색 배경 + 흰 글자로 임팩트 */}
            <section className="relative -mt-[65px] overflow-hidden bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)]">
                <MeshGradientBg variant="hero-dark" />

                {/* 세럼 사진 흐리게 오버레이해서 질감 줌. 밝은 하이라이트가 흰 글자
            묻히게 해서 brightness 낮추고 텍스트 있는 좌측에 어두운 그라데이션
            한 겹 더 깔아서 항상 읽히게 함 */}
                <div className="pointer-events-none absolute inset-0 opacity-[0.16] mix-blend-luminosity">
                    <Image
                        src="/images/hero-serum.jpg"
                        alt=""
                        fill
                        priority
                        sizes="100vw"
                        quality={45}
                        className="scale-125 object-cover object-center blur-[2px] brightness-[0.6]"
                        aria-hidden
                    />
                </div>
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[var(--color-primary-hover)]/70 via-[var(--color-primary-hover)]/25 to-transparent"
                />

                <div className="relative mx-auto min-h-[82vh] max-w-5xl content-center px-6 py-16">
                    <div className="flex min-h-[82vh] max-w-xl flex-col justify-center">
                        <h1 className="break-keep text-[42px] md:text-[60px] font-extrabold leading-[1.15] tracking-tight text-white">
                            <TypewriterHeading
                                lines={[
                                    { text: '비슷한 성분 구성,' },
                                    {
                                        segments: [
                                            { text: '비싼 가격', className: 'text-emphasis-soft' },
                                            { text: '일' },
                                        ],
                                    },
                                    { text: '필요 없어요' },
                                ]}
                            />
                        </h1>
                        <AnimateOnScroll delay={120}>
                            <p className="mt-5 text-[16px] md:text-[17px] text-white/75 leading-relaxed">
                                전성분 배치 순서와 가격을 함께 분석해
                                <br />
                                가격 대비 합리적인 화장품을 찾아드려요
                            </p>
                        </AnimateOnScroll>
                        <AnimateOnScroll delay={240}>
                            <Link
                                href="/chat"
                                className="mt-8 inline-flex w-fit items-center gap-1.5 rounded-xl bg-white px-6 py-3.5 text-[15px] font-semibold text-[var(--color-primary)] hover:bg-white/90 active:scale-[0.98] transition-all">
                                AI 추천 시작
                                <ArrowRightIcon />
                            </Link>
                        </AnimateOnScroll>
                    </div>

                    {/* 아이콘 마퀴를 헤더랑 같은 max-w-5xl 컨테이너 안에 둬서
              우측 끝이 헤더 "AI 추천받기" 버튼 라인과 맞게 함
              (전엔 히어로만 더 넓은 컨테이너라 정렬 어긋나 있었음) */}
                    <div className="pointer-events-none absolute right-6 top-1/2 hidden w-2/5 -translate-y-1/2 md:block">
                        <IconMarquee />
                    </div>
                </div>

                {/* 아래 흰 섹션으로 이어지는 곡선 경계. 화살표보다 먼저 그려서
            화살표가 파도 위에 항상 보이게 함 (순서 반대면 화살표가 파도에 가려
            깜빡이는 것처럼 보임) */}
                <svg
                    aria-hidden
                    viewBox="0 0 1440 60"
                    preserveAspectRatio="none"
                    className="absolute bottom-0 left-0 h-[40px] w-full text-white md:h-[60px]">
                    <path d="M0 60 C 360 0, 1080 0, 1440 60 L1440 60 L0 60 Z" fill="currentColor" />
                </svg>

                <a
                    href="#service"
                    aria-label="아래로 스크롤"
                    className="absolute bottom-20 left-1/2 z-10 hidden -translate-x-1/2 animate-bounce-slow text-white/60 md:block">
                    <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round">
                        <path d="M12 5v14M5 12l7 7 7-7" />
                    </svg>
                </a>
            </section>

            {/* 성분핏이 해결하는 고민 */}
            <section className="py-14">
                <div className="mx-auto max-w-5xl px-6">
                    <AnimateOnScroll>
                        <h2 className="text-center text-[19px] font-bold text-[var(--color-ink)]">
                            이런 고민, 성분핏이 도와드려요
                        </h2>
                    </AnimateOnScroll>
                    <div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-5">
                        {concerns.map((concern, idx) => (
                            <AnimateOnScroll key={concern.label} delay={idx * 90} variant="scale">
                                <Link
                                    href={`/chat?concern=${concern.icon}`}
                                    className="flex flex-col items-center gap-2.5 rounded-2xl border border-[var(--color-border)] px-3 py-5 text-center transition-all hover:-translate-y-[5px] hover:border-[var(--color-primary)]/40 hover:shadow-lg">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                                        <ConcernIcon name={concern.icon} />
                                    </span>
                                    <p className="text-[12.5px] font-semibold text-[var(--color-ink)]">
                                        {concern.label}
                                    </p>
                                </Link>
                            </AnimateOnScroll>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section id="service" className="border-t border-[var(--color-border)] py-20">
                <div className="mx-auto max-w-5xl px-6">
                    <AnimateOnScroll>
                        <h2 className="text-center text-[24px] font-bold text-[var(--color-ink)]">
                            서비스 한 눈에 보기
                        </h2>
                    </AnimateOnScroll>
                    {/* 데스크톱: Figma처럼 화살표로 단계 연결 + 스크롤에 반응하는 진행선 */}
                    <div className="relative mt-14 hidden items-start justify-center gap-3 md:flex">
                        <ScrollProgressLine className="absolute left-[9%] right-[9%] top-[82px] -z-10" />
                        {steps.map((step, idx) => (
                            <div key={step.title} className="flex items-start">
                                <AnimateOnScroll delay={idx * 180} variant="scale">
                                    <Link
                                        href="/chat"
                                        className="group flex w-[184px] flex-col items-center text-center gap-4">
                                        <span className="text-[26px] font-extrabold leading-none text-[var(--color-primary)] transition-transform group-hover:-translate-y-0.5">
                                            {idx + 1}
                                        </span>
                                        <span className="flex h-20 w-20 items-center justify-center rounded-full transition-colors group-hover:bg-[var(--color-primary-soft)]">
                                            <span className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]">
                                                <StepIcon name={step.icon} size={64} />
                                            </span>
                                        </span>
                                        <div>
                                            <p className="text-[14.5px] font-semibold text-[var(--color-ink)]">
                                                {step.title}
                                            </p>
                                            <p className="mt-1 text-[12px] text-[var(--color-ink-faint)]">
                                                {step.desc}
                                            </p>
                                        </div>
                                    </Link>
                                </AnimateOnScroll>
                                {idx < steps.length - 1 && (
                                    <AnimateOnScroll delay={idx * 180 + 90} className="mt-10 px-2">
                                        <span aria-hidden className="text-[var(--color-primary)]/50">
                                            <svg
                                                width="26"
                                                height="26"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round">
                                                <path d="M5 12h14M13 6l6 6-6 6" />
                                            </svg>
                                        </span>
                                    </AnimateOnScroll>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* 모바일: 2x2 그리드 (원 배경 없이 아이콘 크게) */}
                    <div className="mt-12 grid grid-cols-2 gap-10 md:hidden">
                        {steps.map((step, idx) => (
                            <AnimateOnScroll key={step.title} delay={idx * 120} variant="scale">
                                <div className="flex flex-col items-center text-center gap-3">
                                    <span className="text-[22px] font-extrabold leading-none text-[var(--color-primary)]">
                                        {idx + 1}
                                    </span>
                                    <StepIcon name={step.icon} size={44} />
                                    <div>
                                        <p className="text-[13px] font-semibold text-[var(--color-ink)]">
                                            {step.title}
                                        </p>
                                        <p className="mt-1 text-[11.5px] text-[var(--color-ink-faint)]">{step.desc}</p>
                                    </div>
                                </div>
                            </AnimateOnScroll>
                        ))}
                    </div>
                </div>
            </section>

            {/* Compare: 텍스트 나열 대신 실제 결과 화면 목업 + 말풍선 설명 */}
            <section className="bg-[var(--color-primary-soft)]/50 py-16">
                <div className="mx-auto max-w-5xl px-6 grid gap-10 md:grid-cols-[0.85fr_1.15fr] md:items-start">
                    <AnimateOnScroll>
                        <div>
                            <h2 className="text-[22px] font-bold leading-snug text-[var(--color-ink)]">
                                광고성 리뷰 말고
                                <br />
                                <span className="text-[var(--color-primary)]">데이터로</span> 비교하세요
                            </h2>
                            <p className="mt-2.5 text-[12.5px] text-[var(--color-ink-faint)] leading-relaxed">
                                화장품법상 전성분 표기 기준에 근거한
                                <br />
                                객관적 지표로 가성비를 측정해요
                            </p>
                            <ul className="mt-5 space-y-2">
                                {goodPoints.map((p) => (
                                    <li
                                        key={p}
                                        className="flex items-center gap-1.5 text-[12.5px] text-[var(--color-ink-soft)]">
                                        <span aria-hidden className="text-[var(--color-primary)]">
                                            ✓
                                        </span>
                                        {p}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </AnimateOnScroll>

                    <AnimateOnScroll delay={150}>
                        <ResultUIShowcase />
                    </AnimateOnScroll>
                </div>
            </section>

            {/* Scoring formula: 도넛 차트 */}
            <section className="py-14">
                <div className="mx-auto max-w-3xl px-6 text-center">
                    <AnimateOnScroll>
                        <h2 className="text-[20px] font-bold text-[var(--color-ink)]">가성비, 이렇게 계산해요</h2>
                    </AnimateOnScroll>

                    <div className="mt-8 flex flex-col items-center gap-8 sm:flex-row sm:justify-center sm:gap-12">
                        <AnimateOnScroll variant="scale" delay={100}>
                            <IngredientConverge>
                                <ScoreDonut />
                            </IngredientConverge>
                        </AnimateOnScroll>
                        <ul className="space-y-2.5 self-center text-left">
                            {[
                                { color: '#534ab7', label: '전성분 배치 점수', pct: 60 },
                                { color: '#a99ce0', label: '용량 대비 가격 점수', pct: 30 },
                                { color: '#e6e2f7', label: '예산 적합 점수', pct: 10 },
                            ].map((row, idx) => (
                                <AnimateOnScroll key={row.label} delay={250 + idx * 120}>
                                    <LegendRow color={row.color} label={row.label} pct={row.pct} />
                                </AnimateOnScroll>
                            ))}
                        </ul>
                    </div>

                    <AnimateOnScroll delay={500}>
                        <p className="mt-6 text-[11.5px] text-[var(--color-ink-faint)]">
                            베이스 성분(정제수, 글리세린 등) 포함, 전체 전성분 순위 기준
                        </p>
                    </AnimateOnScroll>

                    <AnimateOnScroll delay={600}>
                        <InteractiveScoreDemo />
                    </AnimateOnScroll>
                </div>
            </section>

            {/* 피부타입 진단 티저 */}
            <section className="border-t border-[var(--color-border)] py-14">
                <AnimateOnScroll>
                    <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 text-center md:flex-row md:text-left">
                        <div className="flex-1">
                            <span className="inline-block rounded-full bg-[var(--color-primary-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-primary)]">
                                내 피부 맞춤
                            </span>
                            <h2 className="mt-3 text-[20px] font-bold text-[var(--color-ink)]">
                                4가지 질문으로 내 피부타입을 진단해드려요
                            </h2>
                            <p className="mt-2 text-[13px] text-[var(--color-ink-soft)] leading-relaxed">
                                지성·건성·복합성에 민감도까지, 간단한 설문으로 피부타입을 알아보세요. 진단 결과를
                                저장하면 채팅 추천에서 내 피부에 맞춰 성분 순서를 조정해드려요.
                            </p>
                            <Link
                                href="/skin-profile"
                                className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-primary)] hover:underline">
                                피부타입 진단하기
                                <ArrowRightIcon />
                            </Link>
                        </div>
                        <Link
                            href="/skin-profile"
                            className="group relative flex h-40 w-40 shrink-0 items-center justify-center">
                            <span
                                aria-hidden
                                className="animate-ping-slow absolute inset-0 rounded-full bg-[var(--color-primary-soft)]"
                            />
                            <span
                                aria-hidden
                                className="animate-ping-slow-delayed absolute inset-0 rounded-full bg-[var(--color-primary-soft)]"
                            />
                            <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-[var(--color-primary-soft)] transition-transform group-hover:scale-105">
                                <svg
                                    width="64"
                                    height="64"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="text-[var(--color-primary)]">
                                    <path d="M4 8V6a2 2 0 0 1 2-2h2M4 16v2a2 2 0 0 0 2 2h2M20 8V6a2 2 0 0 0-2-2h-2M20 16v2a2 2 0 0 1-2 2h-2" />
                                    <circle cx="12" cy="12" r="3.2" />
                                </svg>
                            </div>
                        </Link>
                    </div>
                </AnimateOnScroll>
            </section>

            {/* 로드맵 */}
            <section className="border-t border-[var(--color-border)] bg-[var(--color-primary-soft)]/40 py-16">
                <div className="mx-auto max-w-5xl px-6">
                    <AnimateOnScroll>
                        <h2 className="text-center text-[22px] font-bold text-[var(--color-ink)]">
                            성분핏이 만들어갈 다음
                        </h2>
                        <p className="mt-2 text-center text-[12.5px] text-[var(--color-ink-faint)]">
                            지금은 시작이에요. 이렇게 넓혀갈 예정이에요.
                        </p>
                    </AnimateOnScroll>

                    <div className="mt-10 grid gap-4 md:grid-cols-3">
                        {[
                            {
                                badge: '지금',
                                title: 'AI 성분 추천',
                                items: ['AI 채팅 상담', '피부타입 맞춤 추천', '가성비 지수 계산', '화장품 데이터 검색'],
                            },
                            {
                                badge: '다음',
                                title: '더 정확하게, 더 가깝게',
                                items: [
                                    '추천 만족도 피드백 학습',
                                    '화장품 카테고리 확장(크림·토너 등)',
                                    '주요 이커머스 플랫폼 구매 연동 API 도입',
                                    '오픈 기념 이벤트',
                                ],
                            },
                            {
                                badge: '이후',
                                title: '함께 성장하기',
                                items: [
                                    '얼굴 피부 진단(안면인식)',
                                    '로그인 · 상담 내역 저장',
                                    '프리미엄 멤버십 구독',
                                    '브랜드 제휴·데이터 리포트',
                                ],
                            },
                        ].map((phase, idx) => (
                            <AnimateOnScroll key={phase.badge} delay={idx * 130}>
                                <div className="h-full rounded-2xl bg-white p-6 shadow-sm">
                                    <span className="inline-block rounded-full bg-[var(--color-primary-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--color-primary)]">
                                        {phase.badge}
                                    </span>
                                    <p className="mt-3 text-[15px] font-bold text-[var(--color-ink)]">{phase.title}</p>
                                    <ul className="mt-3 space-y-2">
                                        {phase.items.map((item) => (
                                            <li
                                                key={item}
                                                className="flex items-start gap-1.5 text-[12.5px] text-[var(--color-ink-soft)]">
                                                <span aria-hidden className="mt-0.5 text-[var(--color-primary)]">
                                                    ·
                                                </span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </AnimateOnScroll>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <AnimateOnScroll className="mx-6 mb-14 mt-16 md:mx-auto md:max-w-5xl">
                <section className="rounded-3xl bg-[var(--color-primary)] px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-5">
                    <div className="text-center md:text-left">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10.5px] font-medium text-white">
                            <span className="flex gap-0.5">
                                <span className="dot h-1 w-1 rounded-full bg-white" style={{ animationDelay: '0ms' }} />
                                <span
                                    className="dot h-1 w-1 rounded-full bg-white"
                                    style={{ animationDelay: '150ms' }}
                                />
                                <span
                                    className="dot h-1 w-1 rounded-full bg-white"
                                    style={{ animationDelay: '300ms' }}
                                />
                            </span>
                            AI가 지금도 분석하고 있어요
                        </span>
                        <p className="mt-2.5 text-[17px] font-semibold leading-relaxed text-white">
                            지금 내 피부 고민에 맞는
                            <br />
                            화장품을 찾아보세요
                        </p>
                    </div>
                    <Link
                        href="/chat"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-white px-5 py-3 text-[13.5px] font-semibold text-[var(--color-primary)] shadow-lg hover:bg-white/90 active:scale-[0.98] transition-all shrink-0">
                        AI 추천 시작
                        <ArrowRightIcon />
                    </Link>
                </section>
            </AnimateOnScroll>

            <Footer />
        </main>
    );
}

function LegendRow({ color, label, pct }: { color: string; label: string; pct: number }) {
    return (
        <li className="flex items-center gap-2.5 text-[13px]">
            <span aria-hidden className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />
            <span className="w-[152px] text-[var(--color-ink)]">{label}</span>
            <span className="font-semibold text-[var(--color-primary)]">
                <CountUp to={pct} suffix="%" />
            </span>
        </li>
    );
}
