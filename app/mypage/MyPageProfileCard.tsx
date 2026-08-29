"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PasswordChangeModal from "@/components/mypage/PasswordChangeModal";
import MyPageSectionCard from "@/components/mypage/MyPageSectionCard";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { AuthUser } from "@/lib/auth/getUser";

interface Props {
  user: AuthUser;
}

// 닉네임은 카드 안에서 바로 인라인으로 수정 (별도 폼/페이지 없이 "수정" 클릭 시 입력창으로 전환).
// 비밀번호 변경은 자주 쓰는 기능이 아니라서 페이지에 폼을 항상 띄워두지 않고 모달로 분리 —
// 마이페이지 전체를 스크롤했을 때 계정/피부/즐겨찾기가 비슷한 비중으로 보이게 하기 위함
export default function MyPageProfileCard({ user }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState(user.nickname ?? "");
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const displayName = user.nickname ?? user.email?.split("@")[0] ?? "회원";
  const initial = displayName[0]?.toUpperCase() ?? "회";

  const handleSave = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setSaving(true);
    const { error } = await supabase.auth.updateUser({ data: { nickname: nickname.trim() } });
    setSaving(false);

    if (!error) {
      setEditing(false);
      router.refresh(); // Header 등 서버 컴포넌트가 새 닉네임을 반영하도록
    }
  };

  const handleCancel = () => {
    setNickname(user.nickname ?? "");
    setEditing(false);
  };

  return (
    <MyPageSectionCard title="프로필">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[20px] font-semibold text-[var(--color-primary)]">
          {initial}
        </span>

        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
                autoFocus
                className="min-w-0 flex-1 rounded-lg border border-[var(--color-border)] px-2.5 py-1.5 text-[14px] outline-none transition-colors focus:border-[var(--color-primary)]"
              />
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="shrink-0 text-[12.5px] font-medium text-[var(--color-primary)] disabled:opacity-50"
              >
                저장
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="shrink-0 text-[12.5px] text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition-colors"
              >
                취소
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p className="truncate text-[15px] font-semibold text-[var(--color-ink)]">
                {displayName}
              </p>
              <button
                type="button"
                onClick={() => setEditing(true)}
                aria-label="닉네임 수정"
                className="shrink-0 text-[11.5px] text-[var(--color-ink-faint)] underline-offset-2 transition-colors hover:text-[var(--color-primary)] hover:underline"
              >
                수정
              </button>
            </div>
          )}
          <p className="mt-0.5 truncate text-[12.5px] text-[var(--color-ink-faint)]">
            {user.email}
          </p>
        </div>
      </div>

      {user.hasPassword && (
        <button
          type="button"
          onClick={() => setShowPasswordModal(true)}
          className="mt-4 text-[12.5px] font-medium text-[var(--color-ink-soft)] underline-offset-2 transition-colors hover:text-[var(--color-primary)] hover:underline"
        >
          비밀번호 변경
        </button>
      )}

      {/* 눈에 띄면 안 되지만 찾을 수는 있어야 하는 액션이라, 프로필 카드
          맨 아래에 작고 연한 텍스트 링크로만 배치. 실제 탈퇴 로직은 다음 단계에서 연결 */}
      <button
        type="button"
        className="mt-3 block text-[11px] text-[var(--color-ink-faint)] underline underline-offset-2 transition-colors hover:text-[var(--color-ink-soft)]"
      >
        회원 탈퇴
      </button>

      {user.email && (
        <PasswordChangeModal
          email={user.email}
          open={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </MyPageSectionCard>
  );
}
