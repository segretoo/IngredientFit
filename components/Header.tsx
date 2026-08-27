"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import AuthMenu from "@/components/auth/AuthMenu";
import type { AuthUser } from "@/lib/auth/getUser";

interface Props {
  // 랜딩 히어로 위에 얹히는 모드. 스크롤 전엔 투명+흰 글자,
  // 히어로 벗어나면 흰 배경 헤더로 전환.
  // 다른 페이지는 이 prop 없이 항상 흰 배경 고정 헤더
  transparentOverHero?: boolean;
  // 서버 컴포넌트 페이지에서 lib/auth/getUser로 읽어서 내려주는 로그인 사용자 정보.
  // Header 자체는 스크롤 로직 때문에 클라이언트 컴포넌트라 세션을 직접 못 읽음
  user?: AuthUser | null;
}

const LINKS = [
  { href: "/#service", label: "서비스 소개" },
  { href: "/products", label: "화장품 검색" },
  { href: "/skin-profile", label: "피부타입" },
  { href: "/notice", label: "공지사항" },
  { href: "/event", label: "이벤트" },
  { href: "/faq", label: "FAQ" },
];

export default function Header({ transparentOverHero = false, user = null }: Props) {
  const [scrolled, setScrolled] = useState(!transparentOverHero);
  const [menuOpen, setMenuOpen] = useState(false);

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
  const linkClass = floating
    ? "hover:text-white transition-colors"
    : "hover:text-[var(--color-ink)] transition-colors";

  return (
    <>
      <header
        className={`w-full transition-colors duration-300 ${
          transparentOverHero ? "fixed top-0 left-0 right-0 z-50" : "relative"
        } ${
          floating
            ? "bg-transparent border-b border-transparent"
            : "bg-white border-b border-[var(--color-border)]"
        }`}
      >
        <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
          <Link
            href="/"
            className={`flex items-center gap-2 font-semibold text-[15px] transition-colors ${
              floating ? "text-white" : "text-[var(--color-ink)]"
            }`}
          >
            <Image
              src="/logo/logo_color.png"
              alt=""
              width={46}
              height={46}
              className={`h-[46px] w-[46px] object-contain transition-all ${
                floating ? "brightness-0 invert" : "[filter:contrast(1.25)_saturate(1.15)]"
              }`}
            />
            성분핏
          </Link>

          {/* 데스크톱 폭(md 이상)에서만 가로 메뉴 전체 노출 */}
          <nav
            className={`hidden md:flex items-center gap-5 text-[13px] transition-colors ${
              floating ? "text-white/85" : "text-[var(--color-ink-soft)]"
            }`}
          >
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ))}
            <span
              className={`h-4 w-px ${floating ? "bg-white/30" : "bg-[var(--color-border)]"}`}
              aria-hidden
            />
            <Link
              href="/chat"
              className={`rounded-lg border-[1.5px] px-3.5 py-[7px] text-[12.5px] font-semibold transition-colors ${
                floating
                  ? "border-white text-white hover:bg-white/15"
                  : "border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]"
              }`}
            >
              AI 추천받기
            </Link>
            <AuthMenu user={user} floating={floating} />
          </nav>

          {/* md 미만(좁은 창, 태블릿 폭)에선 햄버거로 대체 */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={menuOpen}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:hidden ${
              floating ? "text-white hover:bg-white/15" : "text-[var(--color-ink)] hover:bg-gray-100"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>

        {/* 모바일 드롭다운 메뉴 */}
        {menuOpen && (
          <nav className="animate-fade-up border-t border-[var(--color-border)] bg-white px-6 py-3 md:hidden">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block py-2.5 text-[13.5px] text-[var(--color-ink-soft)] hover:text-[var(--color-primary)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/chat"
              onClick={() => setMenuOpen(false)}
              className="mt-2 block rounded-lg border-[1.5px] border-[var(--color-primary)] px-3.5 py-2.5 text-center text-[13px] font-semibold text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)] transition-colors"
            >
              AI 추천받기
            </Link>
            <div className="mt-3 border-t border-[var(--color-border)] pt-3">
              <AuthMenu user={user} variant="inline" />
            </div>
          </nav>
        )}
      </header>
      {/* fixed 헤더는 문서 흐름에서 빠져서 헤더 높이만큼 자리 차지용 div 필요.
          스크롤 상태 따라 넣었다 뺐다 하면 화면 확 밀리는 버그 있어서 항상 고정으로 넣음.
          히어로 쪽에서 -mt-[65px] 음수 마진으로 상쇄해서 맨 위까지 차 보이게 함 */}
      {transparentOverHero && <div className="h-[65px]" aria-hidden />}
    </>
  );
}
