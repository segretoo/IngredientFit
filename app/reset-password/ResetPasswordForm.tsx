"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import PasswordInput from "@/components/auth/PasswordInput";
import { getSupabaseClient } from "@/lib/supabase/client";

interface Props {
  // /auth/callback에서 재설정 링크의 코드 교환까지 성공해야 세션이 생김.
  // 링크 없이 이 페이지에 직접 들어오면 false — 그 경우 폼 대신 안내만 보여줌
  canReset: boolean;
}

const MIN_PASSWORD_LENGTH = 6;

export default function ResetPasswordForm({ canReset }: Props) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

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
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 1500);
  };

  if (!canReset) {
    return (
      <div className="w-full max-w-sm text-center">
        <h1 className="text-[20px] font-bold text-[var(--color-ink)]">유효하지 않은 접근이에요</h1>
        <p className="mt-2 text-[13.5px] text-[var(--color-ink-faint)]">
          비밀번호 재설정 링크가 만료됐거나 잘못된 경로예요. 다시 요청해주세요.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-block text-[13px] font-medium text-[var(--color-primary)]"
        >
          비밀번호 재설정 다시 요청하기
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="w-full max-w-sm text-center">
        <h1 className="text-[20px] font-bold text-[var(--color-ink)]">비밀번호가 변경됐어요</h1>
        <p className="mt-2 text-[13.5px] text-[var(--color-ink-faint)]">잠시 후 홈으로 이동해요.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-[20px] font-bold text-[var(--color-ink)]">새 비밀번호 설정</h1>
      <p className="mt-1 text-[13px] text-[var(--color-ink-faint)]">
        새로 쓸 비밀번호를 입력해주세요.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
        <div>
          <PasswordInput value={password} onChange={setPassword} autoComplete="new-password" />
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
          {loading ? "변경 중..." : "비밀번호 변경"}
        </Button>
      </form>
    </div>
  );
}
