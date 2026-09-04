"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import KakaoButton from "@/components/auth/KakaoButton";
import AuthTabs from "@/components/auth/AuthTabs";
import PasswordInput from "@/components/auth/PasswordInput";
import { getSupabaseClient } from "@/lib/supabase/client";

interface Props {
  redirectTo: string;
}

const MIN_PASSWORD_LENGTH = 6;

export default function SignupForm({ redirectTo }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`비밀번호는 최소 ${MIN_PASSWORD_LENGTH}자 이상이어야 해요.`);
      return;
    }
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않아요.");
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setError("Supabase 환경변수(.env.local)가 설정되지 않았습니다.");
      return;
    }

    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // Supabase 대시보드의 "Confirm email" 설정에 따라 결과가 갈림:
    // 꺼져 있으면 가입과 동시에 session이 와서 바로 로그인됨.
    // 켜져 있으면 session이 없고 인증 메일부터 확인해야 함
    if (data.session) {
      router.push(redirectTo);
      router.refresh();
    } else {
      setNeedsEmailConfirm(true);
    }
  };

  if (needsEmailConfirm) {
    return (
      <div className="w-full max-w-sm text-center">
        <h1 className="text-[20px] font-bold text-[var(--color-ink)]">인증 메일을 보냈어요</h1>
        <p className="mt-2 text-[13.5px] text-[var(--color-ink-faint)]">
          {email}로 발송된 메일의 링크를 눌러 가입을 완료해주세요.
        </p>
        <Link href="/login" className="mt-6 inline-block text-[13px] font-medium text-[var(--color-primary)]">
          로그인 화면으로
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <AuthTabs active="signup" redirectTo={redirectTo} />

      <h1 className="mt-6 text-[20px] font-bold text-[var(--color-ink)]">회원가입</h1>
      <p className="mt-1 text-[13px] text-[var(--color-ink-faint)]">
        몇 초면 가입할 수 있어요.
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
        <div>
          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder="비밀번호"
            autoComplete="new-password"
          />
          <p className="mt-1.5 pl-0.5 text-[11.5px] text-[var(--color-ink-faint)]">
            최소 {MIN_PASSWORD_LENGTH}자 이상으로 입력해주세요.
          </p>
        </div>
        <PasswordInput
          value={passwordConfirm}
          onChange={setPasswordConfirm}
          placeholder="비밀번호 확인"
          autoComplete="new-password"
        />
        {error && <p className="text-[12.5px] text-red-500">{error}</p>}
        <Button type="submit" disabled={loading} className="mt-1 w-full">
          {loading ? "가입 중..." : "회원가입"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-[12px] text-[var(--color-ink-faint)]">
        <span className="h-px flex-1 bg-[var(--color-border)]" />
        또는
        <span className="h-px flex-1 bg-[var(--color-border)]" />
      </div>

      <KakaoButton redirectTo={redirectTo} label="카카오로 시작하기" />
    </div>
  );
}
