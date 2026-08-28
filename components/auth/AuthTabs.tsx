"use client";

import Link from "next/link";

interface Props {
  active: "login" | "signup";
  redirectTo: string;
}

// 로그인/회원가입 페이지 상단 탭. 페이지는 /login, /signup으로 분리돼있지만
// 지금 어느 화면인지 헷갈리지 않도록 세그먼트 컨트롤 형태로 표시 + 즉시 전환 가능
export default function AuthTabs({ active, redirectTo }: Props) {
  const query = redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : "";

  const tabClass = (tab: "login" | "signup") =>
    `flex-1 rounded-lg py-2 text-center text-[13px] font-semibold transition-colors ${
      active === tab
        ? "bg-white text-[var(--color-primary)] shadow-sm"
        : "text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]"
    }`;

  return (
    <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
      <Link href={`/login${query}`} className={tabClass("login")}>
        로그인
      </Link>
      <Link href={`/signup${query}`} className={tabClass("signup")}>
        회원가입
      </Link>
    </div>
  );
}
