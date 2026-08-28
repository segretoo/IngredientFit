import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata: Metadata = {
  title: "비밀번호 찾기 | 성분핏",
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Header />
      <section className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-6 py-14">
        <ForgotPasswordForm />
      </section>
      <Footer />
    </main>
  );
}
