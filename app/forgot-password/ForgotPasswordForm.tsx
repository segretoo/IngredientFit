"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
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
    // 재설정 링크 클릭 시 기존 OAuth 콜백 라우트(app/auth/callback)를 그대로 재사용 —
    // 코드 교환(exchangeCodeForSession) 로직이 로그인이든 비밀번호 재설정이든 동일함.
    // next로 /reset-password를 지정해서 교환 성공 후 그쪽으로 이동시킴
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setLoading(false);

    // 존재하지 않는 이메일이어도 Supabase는 보안상 성공으로 응답함(계정 존재 여부 노출 방지) —
    // 그래서 에러가 진짜 요청 실패(네트워크/설정 문제)일 때만 표시
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="w-full max-w-sm text-center">
        <h1 className="text-[20px] font-bold text-[var(--color-ink)]">이메일을 확인해주세요</h1>
        <p className="mt-2 text-[13.5px] text-[var(--color-ink-faint)]">
          {email}로 비밀번호 재설정 링크를 보냈어요. 메일함(스팸함도) 확인해주세요.
        </p>
        <Link href="/login" className="mt-6 inline-block text-[13px] font-medium text-[var(--color-primary)]">
          로그인 화면으로
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-[20px] font-bold text-[var(--color-ink)]">비밀번호 찾기</h1>
      <p className="mt-1 text-[13px] text-[var(--color-ink-faint)]">
        가입하신 이메일로 재설정 링크를 보내드려요.
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
        {error && <p className="text-[12.5px] text-red-500">{error}</p>}
        <Button type="submit" disabled={loading} className="mt-1 w-full">
          {loading ? "전송 중..." : "재설정 링크 보내기"}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-[var(--color-ink-faint)]">
        <Link href="/login" className="font-medium text-[var(--color-primary)]">
          로그인 화면으로 돌아가기
        </Link>
      </p>
    </div>
  );
}
