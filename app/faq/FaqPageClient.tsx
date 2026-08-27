"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FaqContent from "@/components/FaqContent";
import ContactModal from "@/components/ContactModal";
import ArrowRightIcon from "@/components/ArrowRightIcon";
import type { AuthUser } from "@/lib/auth/getUser";

interface Props {
  user: AuthUser | null;
}

// 원래 app/faq/page.tsx에 있던 내용 그대로 옮김.
// 문의하기 모달(showContact) state 때문에 클라이언트 컴포넌트 —
// 로그인 세션은 부모(app/faq/page.tsx)가 서버에서 읽어서 prop으로 내려줌
export default function FaqPageClient({ user }: Props) {
  const [showContact, setShowContact] = useState(false);

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Header user={user} />
      <section className="mx-auto w-full max-w-5xl flex-1 px-6 py-14">
        <h1 className="text-[22px] font-bold text-[var(--color-ink)]">FAQ</h1>
        <p className="mt-1.5 text-[13px] text-[var(--color-ink-faint)]">
          자주 묻는 질문을 모았어요.
        </p>
        <div className="mt-8">
          <FaqContent />
        </div>

        <div className="mt-8 rounded-2xl bg-[var(--color-primary-soft)]/50 p-6 text-center">
          <p className="text-[13px] text-[var(--color-ink)]">원하는 답을 못 찾으셨나요?</p>
          <button
            type="button"
            onClick={() => setShowContact(true)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-[12.5px] font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors"
          >
            문의하기
            <ArrowRightIcon />
          </button>
        </div>
      </section>
      <Footer />

      <ContactModal open={showContact} onClose={() => setShowContact(false)} />
    </main>
  );
}
