"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { AuthUser } from "@/lib/auth/getUser";

interface Props {
  user: AuthUser | null;
  /** 히어로 위 투명 헤더일 때 흰 글자로 표시 (Header.tsx의 floating 상태 그대로 전달) */
  floating?: boolean;
  /**
   * "icon": 데스크톱 헤더 nav용 — 아바타 아이콘 클릭 시 드롭다운으로 이메일/로그아웃 표시.
   * "inline": 모바일 드로어 / 데스크톱 헤더의 모바일 폭 드롭다운 메뉴용 —
   *           이미 펼쳐진 메뉴 안이라 추가 클릭 없이 한 줄로 항상 표시
   */
  variant?: "icon" | "inline";
}

function PersonIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

// Header.tsx(데스크톱), MobileDrawer.tsx(모바일)가 공유하는 로그인 상태 표시 컴포넌트.
// user는 부모(서버 컴포넌트)가 lib/auth/getUser로 읽어서 내려준 값 —
// 이 컴포넌트 자체는 세션을 직접 읽지 않음
export default function AuthMenu({ user, floating = false, variant = "icon" }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 드롭다운 바깥 클릭하면 닫힘 (variant="icon"일 때만 필요)
  useEffect(() => {
    if (variant !== "icon" || !open) return;
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open, variant]);

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setOpen(false);
    router.refresh(); // 서버 컴포넌트들이 로그아웃된 최신 세션을 다시 읽도록
  };

  // ── 비로그인 ──────────────────────────────────────────
  if (!user) {
    if (variant === "inline") {
      return (
        <Link
          href="/login"
          className="flex items-center gap-2 text-[13.5px] font-medium text-[var(--color-primary)]"
        >
          <PersonIcon />
          로그인
        </Link>
      );
    }
    const iconColorClass = floating
      ? "text-white border-white/60 hover:bg-white/15"
      : "text-[var(--color-ink-soft)] border-[var(--color-border)] hover:bg-gray-100";
    return (
      <Link
        href="/login"
        aria-label="로그인"
        className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${iconColorClass}`}
      >
        <PersonIcon />
      </Link>
    );
  }

  // ── 로그인 상태 ────────────────────────────────────────
  // 닉네임 대신 이메일 앞글자를 아바타로 우선 표시.
  // 카카오 프로필 닉네임은 마이페이지(skin_profiles) 작업할 때
  // user_metadata에서 가져오도록 확장 예정
  const initial = (user.email?.[0] ?? "회").toUpperCase();

  if (variant === "inline") {
    return (
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[12px] font-semibold text-[var(--color-primary)]">
            {initial}
          </span>
          <span className="truncate text-[13px] text-[var(--color-ink)]">{user.email}</span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="shrink-0 text-[12.5px] text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition-colors"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="계정 메뉴"
        aria-expanded={open}
        className={`flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-semibold transition-colors ${
          floating
            ? "bg-white/20 text-white hover:bg-white/30"
            : "bg-[var(--color-primary-soft)] text-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]/70"
        }`}
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-52 rounded-xl border border-[var(--color-border)] bg-white py-2 shadow-lg">
          <p className="truncate px-4 py-1.5 text-[12px] text-[var(--color-ink-faint)]">
            {user.email ?? "회원"}
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="block w-full px-4 py-2 text-left text-[13px] text-[var(--color-ink)] hover:bg-gray-50 transition-colors"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
