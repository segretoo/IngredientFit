import Image from "next/image";
import IngredientTag from "@/components/IngredientTag";
import ScoreBar from "@/components/ScoreBar";
import ArrowRightIcon from "@/components/ArrowRightIcon";

// 실제 채팅 결과 카드(components/product/ResultCard.tsx) 마크업/스타일 그대로 옮긴 목업.
// 스크린샷 아님. 실제 카드 디자인 바뀌면(즐겨찾기 별, 점수 막대그래프 등)
// 여기도 같이 손봐야 함
//
// 말풍선은 카드 좌우 여백에 두고 설명 줄과 같은 높이(%)로 맞춘 뒤
// 카드 쪽 가리키는 꼬리표 달음. SVG 긴 점선으로 연결하는 방식은
// 다른 섹션까지 새는 렌더링 버그 있어서 걷어냄
export default function ResultUIShowcase() {
  return (
    <div className="relative mx-auto max-w-[340px]">
      <div className="rounded-2xl bg-white p-4 shadow-lg shadow-black/10">
        <div className="flex items-start gap-3">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: "#eef0e0" }}
            aria-hidden
          >
            <Image src="/images/serum-placeholder.png" alt="" width={32} height={32} className="opacity-80" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <span className="inline-block rounded-full bg-[var(--color-primary-soft)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-primary)]">
                추천 1위
              </span>
              <span className="shrink-0 text-[16px] leading-none text-[var(--color-accent-text)]">★</span>
            </div>
            <p className="mt-1 truncate text-[13.5px] font-semibold text-[var(--color-ink)]">
              바이옴 퓨어 비타민 세럼
            </p>
            <p className="mt-0.5 text-[11.5px] text-[var(--color-ink-faint)]">
              가격 11,200원 · 용량 20ml · ml당 560원
            </p>
          </div>
        </div>

        <div className="mt-2.5 rounded-lg bg-[var(--color-primary-soft)]/60 px-3 py-2 text-[11.5px] text-[var(--color-ink-soft)] leading-relaxed">
          <div className="flex items-center justify-between gap-1.5">
            <span className="flex items-center gap-1.5">
              <IngredientTag ingredientId="vitaminc" size={18} />
              <span className="text-[11.5px] font-semibold text-[var(--color-ink)]">비타민C</span>
            </span>
            <span className="flex items-center gap-1 text-[12.5px] font-semibold text-[var(--color-accent-text)]">
              <SparkleIcon />
              93.8
            </span>
          </div>

          <div className="mt-1.5 space-y-1">
            <ScoreBar label="배치 9번째" value={100} color="var(--color-primary)" delay={100} size="sm" />
            <ScoreBar label="ml당 가격" value={78} color="var(--color-accent-deep)" delay={150} size="sm" />
            <ScoreBar label="예산 여유" value={90} color="#c9a86a" delay={200} size="sm" />
          </div>

          <p className="mt-1.5">
            <span className="font-medium text-[var(--color-ink)]">추천 이유 </span>
            비타민C가 9번째로 앞쪽에 배치되어 있고, ml당 가격도 합리적이라 가성비가 좋아요.
          </p>
        </div>

        <div className="mt-2.5 flex gap-2">
          <span className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--color-border)] py-1.5 text-[11.5px] font-medium text-[var(--color-ink-soft)]">
            + 비교함에 담기
          </span>
          <span className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--color-border)] py-1.5 text-[11.5px] font-medium text-[var(--color-ink-soft)]">
            ⤓ 이미지 저장
          </span>
        </div>

        <div className="mt-1.5 flex items-center justify-center gap-1.5 rounded-lg bg-[var(--color-primary)] py-2 text-[12.5px] font-medium text-white">
          구매하러 가기
          <ArrowRightIcon />
        </div>
      </div>

      <Callout side="left" top="38%" style={{ left: -100 }}>
        광고 없이 배치 순위로만 판단해요
      </Callout>
      <Callout side="right" top="46%" style={{ right: -100 }}>
        점수 근거를 막대그래프로 바로 확인
      </Callout>
      <Callout side="left" top="64%" style={{ left: -100 }}>
        이 성분 때문에 추천한다고 알려드려요
      </Callout>
    </div>
  );
}

function Callout({
  children,
  side,
  top,
  style,
}: {
  children: React.ReactNode;
  side: "left" | "right";
  top: string;
  style: { left?: number; right?: number };
}) {
  return (
    <div
      className="absolute hidden w-[100px] -translate-y-1/2 lg:block"
      style={{ top, ...style }}
    >
      <div className="relative rounded-xl bg-[var(--color-ink)] px-2.5 py-2 text-[10.5px] leading-snug text-white shadow-md">
        {children}
        <span
          aria-hidden
          className={`absolute top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-[var(--color-ink)] ${
            side === "left" ? "-right-[3px]" : "-left-[3px]"
          }`}
        />
      </div>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden className="shrink-0">
      <path d="M12 2.5c.9 4 2.2 6.3 4.5 7.5-2.3 1.2-3.6 3.5-4.5 7.5-.9-4-2.2-6.3-4.5-7.5 2.3-1.2 3.6-3.5 4.5-7.5Z" />
    </svg>
  );
}
