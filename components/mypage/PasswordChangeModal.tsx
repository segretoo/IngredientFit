"use client";

import { useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import PasswordInput from "@/components/auth/PasswordInput";
import { getSupabaseClient } from "@/lib/supabase/client";

interface Props {
  email: string;
  open: boolean;
  onClose: () => void;
}

const MIN_PASSWORD_LENGTH = 6;

// ContactModal.tsx와 동일한 모달 셸 패턴(오버레이 + 중앙 카드 + ✕ 닫기) 재사용
export default function PasswordChangeModal({ email, open, onClose }: Props) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!open) return null;

  const resetAndClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setNewPasswordConfirm("");
    setError(null);
    setDone(false);
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`새 비밀번호는 최소 ${MIN_PASSWORD_LENGTH}자 이상이어야 해요.`);
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setError("새 비밀번호가 일치하지 않아요.");
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) return;

    setSaving(true);

    // 로그인된 세션이라도 현재 비밀번호를 재확인한 뒤에 변경 (재인증)
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });

    if (reauthError) {
      setSaving(false);
      setError("현재 비밀번호가 올바르지 않아요.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 py-8"
      onClick={resetAndClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-up w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[16px] font-bold text-[var(--color-ink)]">비밀번호 변경</h2>
          <button
            type="button"
            onClick={resetAndClose}
            aria-label="닫기"
            className="text-[18px] leading-none text-[var(--color-ink-faint)] transition-colors hover:text-[var(--color-ink)]"
          >
            ✕
          </button>
        </div>

        {done ? (
          <div className="py-2 text-center">
            <p className="text-[13.5px] text-[var(--color-primary)]">비밀번호가 변경됐어요.</p>
            <Button type="button" onClick={resetAndClose} className="mt-4 w-full">
              닫기
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
            {error && <p className="text-[12.5px] text-red-500">{error}</p>}
            <Button type="submit" disabled={saving} className="mt-1 w-full">
              {saving ? "변경 중..." : "비밀번호 변경"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
