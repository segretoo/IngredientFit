"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import MobileDrawer from "./MobileDrawer";
import { useFavoritesLoginSync } from "@/lib/useFavoritesLoginSync";
import type { AuthUser } from "@/lib/auth/getUser";

interface Props {
  // app/mobile/layout.tsx(서버 컴포넌트)에서 lib/auth/getUser로 읽어서 내려줌
  user?: AuthUser | null;
}

export default function MobileHeader({ user = null }: Props) {
  useFavoritesLoginSync(user);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  // /mobile 홈(랜딩)에서만 히어로 위 투명 모드.
  // 다른 /mobile/* 페이지는 항상 흰 배경 고정 헤더
  const transparentOverHero = pathname === "/mobile";
  const [scrolled, setScrolled] = useState(!transparentOverHero);

  useEffect(() => {
    if (!transparentOverHero) return;
    function onScroll() {
      setScrolled(window.scrollY > 80);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparentOverHero]);

  const floating = transparentOverHero && !scrolled;

  return (
    <>
      <header
        className={`top-0 z-30 w-full transition-colors duration-300 ${
          transparentOverHero ? "fixed left-0 right-0" : "sticky"
        } ${
          floating
            ? "bg-transparent border-b border-transparent"
            : "bg-white border-b border-[var(--color-border)]"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/mobile" className="flex items-center gap-2">
            <Image
              src="/logo/logo_color.png"
              alt=""
              width={38}
              height={38}
              className={`h-[38px] w-[38px] object-contain transition-all ${
                floating ? "brightness-0 invert" : "[filter:contrast(1.25)_saturate(1.15)]"
              }`}
              priority
            />
            <span className={`text-[15px] font-semibold transition-colors ${floating ? "text-white" : "text-[var(--color-ink)]"}`}>
              성분핏
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="메뉴 열기"
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
              floating ? "text-white hover:bg-white/15" : "text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
        </div>
      </header>
      {/* fixed 헤더가 문서 흐름에서 빠지는 만큼 같은 높이 빈 공간 넣고
          히어로 쪽 음수 마진으로 상쇄. 웹이랑 같은 패턴 */}
      {transparentOverHero && <div className="h-[65px]" aria-hidden />}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} user={user} />
    </>
  );
}
