"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteAccount } from "@/app/actions/account";
import { useLocalStorage } from "@/lib/useLocalStorage";
import type { FavoriteItem } from "@/types";
import type { SkinProfile } from "@/lib/skinProfile";

interface Props {
  open: boolean;
  onClose: () => void;
}

const CONFIRM_TEXT = "탈퇴합니다";

// 되돌릴 수 없는 액션이라, 버튼 한 번 클릭이 아니라 특정 문구를 직접 타이핑해야
// 탈퇴 버튼이 활성화되는 방식(GitHub 저장소 삭제 등에서 쓰는 패턴)을 씀 —
// 재인증 절차까진 없어도, 최소한 "실수로 눌렀다"는 가능성은 확실히 배제함
export default function DeleteAccountModal({ open, onClose }: Props) {
  const router = useRouter();
  const [confirmInput, setConfirmInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 탈퇴 성공하면 로컬에 남아있던 계정 연동 데이터도 정리 (로그아웃 때와 같은 이유 —
  // 이 브라우저를 나중에 다른 계정이 쓸 수도 있으니)
  const [, setSkinProfile] = useLocalStorage<SkinProfile | null>("ingredientfit:skinProfile", null);
  const [, setFavoriteItems] = useLocalStorage<FavoriteItem[]>("ingredientfit:favorites", []);
  const [, setSkinProfileOwner] = useLocalStorage<string | null>(
    "ingredientfit:skinProfileOwner",
    null
  );
  const [, setFavoritesOwner] = useLocalStorage<string | null>("ingredientfit:favoritesOwner", null);

  if (!open) return null;

  const canSubmit = confirmInput === CONFIRM_TEXT && !loading;

  const handleDelete = async () => {
    if (!canSubmit) return;
    setError(null);
    setLoading(true);

    const result = await deleteAccount();
    setLoading(false);

    if (!result.ok) {
      setError("탈퇴 처리 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.");
      return;
    }

    setSkinProfile(null);
    setFavoriteItems([]);
    setSkinProfileOwner(null);
    setFavoritesOwner(null);

    router.push("/");
    router.refresh();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-[16px] font-bold text-[var(--color-ink)]">정말 탈퇴하시겠어요?</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-ink-soft)]">
          탈퇴하면 즐겨찾기, 피부 프로필, 추천 히스토리를 포함한 모든 데이터가 영구적으로
          삭제되고 복구할 수 없어요.
        </p>

        <p className="mt-4 text-[12.5px] text-[var(--color-ink-soft)]">
          계속하려면 아래에{" "}
          <span className="font-semibold text-[var(--color-ink)]">&quot;{CONFIRM_TEXT}&quot;</span>
          를 입력해주세요.
        </p>
        <input
          type="text"
          value={confirmInput}
          onChange={(e) => setConfirmInput(e.target.value)}
          placeholder={CONFIRM_TEXT}
          className="mt-2 w-full rounded-xl border border-[var(--color-border)] px-3.5 py-2.5 text-[13.5px] outline-none transition-colors focus:border-red-400"
        />

        {error && <p className="mt-2 text-[12.5px] text-red-500">{error}</p>}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-[var(--color-border)] py-2.5 text-[13px] font-medium text-[var(--color-ink-soft)] transition-colors hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!canSubmit}
            className="flex-1 rounded-xl bg-red-500 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "처리 중..." : "탈퇴하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
