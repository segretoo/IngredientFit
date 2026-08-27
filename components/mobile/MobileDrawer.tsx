"use client";

import Link from "next/link";
import AuthMenu from "@/components/auth/AuthMenu";
import type { AuthUser } from "@/lib/auth/getUser";

const LINKS = [
  { href: "/mobile", label: "홈" },
  { href: "/mobile/chat", label: "AI 상담" },
  { href: "/mobile/products", label: "화장품 검색" },
  { href: "/mobile/skin-profile", label: "피부타입" },
  { href: "/mobile/notice", label: "공지사항" },
  { href: "/mobile/event", label: "이벤트" },
  { href: "/mobile/faq", label: "FAQ" },
  { href: "/mobile/terms", label: "이용약관" },
  { href: "/mobile/contact", label: "문의하기" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  user?: AuthUser | null;
}

export default function MobileDrawer({ open, onClose, user = null }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/20" />
      <nav
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-up absolute right-0 top-0 h-full w-[78%] max-w-[300px] bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <span className="text-[14px] font-semibold text-[var(--color-ink)]">메뉴</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="메뉴 닫기"
            className="text-[18px] leading-none text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="border-b border-[var(--color-border)] px-5 py-3.5">
          <AuthMenu user={user} variant="inline" />
        </div>
        <ul className="py-2">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onClose}
                className="block px-5 py-3.5 text-[14px] text-[var(--color-ink)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)] transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
