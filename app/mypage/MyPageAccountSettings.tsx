"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import PasswordInput from "@/components/auth/PasswordInput";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { AuthUser } from "@/lib/auth/getUser";

interface Props {
  user: AuthUser;
}

const MIN_PASSWORD_LENGTH = 6;

export default function MyPageAccountSettings({ user }: Props) {
  const router = useRouter();

  // ── 닉네임 ──────────────────────────────────────────
  const [nickname, setNickname] = useState(user.nickname ?? "");
  const [nicknameSaving, setNicknameSaving] = useState(false);
  const [nicknameMessage, setNicknameMessage] = useState<string | null>(null);

  const handleNicknameSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setNicknameMessage(null);

    const supabase = getSupabaseClient();
    if (!supabase) return;

    setNicknameSaving(true);
    const { error } = await supabase.auth.updateUser({ data: { nickname: nickname.trim() } });
    setNicknameSaving(false);

    if (error) {
      setNicknameMessage(`저장 실패: ${error.message}`);
      return;
    }
    setNicknameMessage("저장됐어요.");
    router.refresh(); // Header 등 서버 컴포넌트가 새 닉네임을 반영하도록
  };

  // ── 비밀번호 변경 ────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordDone, setPasswordDone] = useState(false);

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordDone(false);

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`새 비밀번호는 최소 ${MIN_PASSWORD_LENGTH}자 이상이어야 해요.`);
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setPasswordError("새 비밀번호가 일치하지 않아요.");
      return;
    }
    if (!user.email) {
      setPasswordError("이메일 정보를 확인할 수 없어요.");
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) return;

    setPasswordSaving(true);

    // 로그인된 세션이라도 현재 비밀번호를 다시 확인한 뒤에 변경 —
    // 자리 비운 사이 남이 접근해도 비밀번호를 못 바꾸게 하기 위한 최소한의 재인증
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (reauthError) {
      setPasswordSaving(false);
      setPasswordError("현재 비밀번호가 올바르지 않아요.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordSaving(false);

    if (updateError) {
      setPasswordError(updateError.message);
      return;
    }

    setPasswordDone(true);
    setCurrentPassword("");
    setNewPassword("");
    setNewPasswordConfirm("");
  };

  return (
    <div className="space-y-8">
      <h2 className="text-[15px] font-semibold text-[var(--color-ink)]">계정 설정</h2>

      {/* 닉네임 */}
      <div>
        <label className="text-[13px] font-medium text-[var(--color-ink)]">닉네임</label>
        <form onSubmit={handleNicknameSubmit} className="mt-2 flex max-w-sm gap-2">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임을 입력해주세요"
            maxLength={20}
            className="flex-1 rounded-xl border border-[var(--color-border)] px-3.5 py-2.5 text-[13.5px] outline-none transition-colors focus:border-[var(--color-primary)]"
          />
          <Button type="submit" disabled={nicknameSaving} className="shrink-0">
            {nicknameSaving ? "저장 중..." : "저장"}
          </Button>
        </form>
        {nicknameMessage && (
          <p className="mt-1.5 text-[12px] text-[var(--color-ink-faint)]">{nicknameMessage}</p>
        )}
      </div>

      {/* 비밀번호 변경 */}
      <div>
        <label className="text-[13px] font-medium text-[var(--color-ink)]">비밀번호 변경</label>

        {!user.hasPassword ? (
          <p className="mt-2 text-[13px] text-[var(--color-ink-faint)]">
            카카오 계정으로 가입하셔서 별도 비밀번호가 없어요.
          </p>
        ) : passwordDone ? (
          <p className="mt-2 text-[13px] text-[var(--color-primary)]">비밀번호가 변경됐어요.</p>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="mt-2 flex max-w-sm flex-col gap-3">
            <PasswordInput
              value={currentPassword}
              onChange={setCurrentPassword}
              placeholder="현재 비밀번호"
              autoComplete="current-password"
            />
            <PasswordInput
              value={newPassword}
              onChange={setNewPassword}
              placeholder="새 비밀번호"
              autoComplete="new-password"
            />
            <PasswordInput
              value={newPasswordConfirm}
              onChange={setNewPasswordConfirm}
              placeholder="새 비밀번호 확인"
              autoComplete="new-password"
            />
            {passwordError && <p className="text-[12.5px] text-red-500">{passwordError}</p>}
            <Button type="submit" disabled={passwordSaving} className="w-full">
              {passwordSaving ? "변경 중..." : "비밀번호 변경"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
