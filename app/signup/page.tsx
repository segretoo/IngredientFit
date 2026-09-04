import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getUser } from "@/lib/auth/getUser";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SignupForm from "./SignupForm";

export const metadata: Metadata = {
  title: "회원가입 | 성분핏",
};

interface Props {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function SignupPage({ searchParams }: Props) {
  const [user, params] = await Promise.all([getUser(), searchParams]);
  const redirectTo = params.redirect?.startsWith("/") ? params.redirect : "/";

  if (user) {
    redirect(redirectTo);
  }

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Header />
      <section className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-6 py-14">
        <SignupForm redirectTo={redirectTo} />
      </section>
      <Footer />
    </main>
  );
}
