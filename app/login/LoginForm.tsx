"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import KakaoButton from "@/components/auth/KakaoButton";
import AuthTabs from "@/components/auth/AuthTabs";
import PasswordInput from "@/components/auth/PasswordInput";
import { getSupabaseClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Props {
  redirectTo: string;
}

export default function LoginForm({ redirectTo }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const supabase = getSupabaseClient();
    if (!supabase) {
      setError("Supabase 환경변수(.env.local)가 설정되지 않았습니다.");
      return;
    }

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (signInError) {
      setError("이메일 또는 비밀번호가 올바르지 않아요.");
      return;
    }

    router.push(redirectTo);
    router.refresh(); // 헤더 등 서버 컴포넌트가 로그인된 최신 세션을 다시 읽도록
  };

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <Header />
      <section className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-6 py-14">
        <div className="w-full max-w-sm">
          <AuthTabs active="login" redirectTo={redirectTo} />

          <h1 className="mt-6 text-[20px] font-bold text-[var(--color-ink)]">로그인</h1>
          <p className="mt-1 text-[13px] text-[var(--color-ink-faint)]">
            성분핏에 오신 걸 환영해요.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="rounded-xl border border-[var(--color-border)] px-3.5 py-2.5 text-[13.5px] outline-none transition-colors focus:border-[var(--color-primary)]"
            />
            <PasswordInput value={password} onChange={setPassword} autoComplete="current-password" />
            <div className="-mt-1 text-right">
              <Link
                href="/forgot-password"
                className="text-[12px] text-[var(--color-ink-faint)] hover:text-[var(--color-primary)] transition-colors"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>
            {error && <p className="text-[12.5px] text-red-500">{error}</p>}
            <Button type="submit" disabled={loading} className="mt-1 w-full">
              {loading ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3 text-[12px] text-[var(--color-ink-faint)]">
            <span className="h-px flex-1 bg-[var(--color-border)]" />
            또는
            <span className="h-px flex-1 bg-[var(--color-border)]" />
          </div>

          <KakaoButton redirectTo={redirectTo} label="카카오로 로그인" />
        </div>
      </section>
      <Footer />
    </main>
  );
}
