import type { Metadata } from "next";
import { getUser } from "@/lib/auth/getUser";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = {
  title: "비밀번호 재설정 | 성분핏",
};

// /auth/callback이 재설정 링크의 code를 교환해서 세션을 만든 뒤 여기로 보냄.
// getUser()가 null이면 링크 없이 직접 들어온 것 — 폼 대신 안내 메시지만 보여줌
export default async function ResetPasswordPage() {
  const user = await getUser();

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Header user={user} />
      <section className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-6 py-14">
        <ResetPasswordForm canReset={Boolean(user)} />
      </section>
      <Footer />
    </main>
  );
}
