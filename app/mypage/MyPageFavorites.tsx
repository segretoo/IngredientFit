"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeFavorite } from "@/app/actions/favorites";
import MyPageSectionCard from "@/components/mypage/MyPageSectionCard";
import type { FavoriteProduct } from "@/lib/favorites";

interface Props {
  favorites: FavoriteProduct[];
}

export default function MyPageFavorites({ favorites }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = (productId: string) => {
    setRemovingId(productId);
    startTransition(async () => {
      await removeFavorite(productId);
      router.refresh(); // 서버가 다시 렌더링해서 목록에서 즉시 빠지도록
      setRemovingId(null);
    });
  };

  return (
    <MyPageSectionCard title={`즐겨찾기 (${favorites.length})`}>
      {favorites.length === 0 ? (
        <p className="rounded-xl bg-[var(--color-primary-soft)]/40 px-4 py-8 text-center text-[13px] text-[var(--color-ink-faint)]">
          아직 즐겨찾기한 제품이 없어요. 채팅에서 추천받은 제품의 ☆ 버튼을 눌러 저장해보세요.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {favorites.map((product) => {
            const pricePerMl = Math.round(product.price / product.volumeMl);
            const isRemoving = isPending && removingId === product.id;
            return (
              <div
                key={product.id}
                className="flex items-start gap-3 rounded-xl p-3.5 shadow-[inset_0_0_0_1.5px_var(--color-border)]"
              >
                <div
                  className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: product.imageColor }}
                  aria-hidden
                >
                  <Image src="/images/serum-placeholder.png" alt="" width={28} height={28} className="opacity-80" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-[13px] font-semibold text-[var(--color-ink)]">
                      {product.brand} {product.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleRemove(product.id)}
                      disabled={isRemoving}
                      aria-label="즐겨찾기 해제"
                      className="shrink-0 text-[13px] leading-none text-[var(--color-ink-faint)] transition-colors hover:text-[var(--color-ink)] disabled:opacity-40"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="mt-0.5 text-[11.5px] text-[var(--color-ink-faint)]">
                    {product.price.toLocaleString()}원 · {product.volumeMl}ml · ml당{" "}
                    {pricePerMl.toLocaleString()}원
                  </p>
                  <a
                    href={product.purchaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-[11.5px] font-medium text-[var(--color-primary)] hover:underline"
                  >
                    구매하러 가기
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </MyPageSectionCard>
  );
}
