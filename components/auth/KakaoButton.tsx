"use client";

import { getSupabaseClient } from "@/lib/supabase/client";

interface Props {
  /** 로그인 완료 후 돌아갈 경로. app/auth/callback/route.ts의 `next` 파라미터로 전달됨 */
  redirectTo?: string;
  label?: string;
}

// 로그인 페이지, 회원가입 페이지가 공유하는 카카오 버튼.
// 카카오 로그인/가입은 흐름이 동일(계정 없으면 자동 가입)이라 버튼 하나로 충분
export default function KakaoButton({ redirectTo = "/", label = "카카오로 계속하기" }: Props) {
  const handleClick = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      alert("Supabase 환경변수(.env.local)가 설정되지 않았습니다.");
      return;
    }

    const callbackUrl = new URL(`${window.location.origin}/auth/callback`);
    callbackUrl.searchParams.set("next", redirectTo);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo: callbackUrl.toString() },
    });

    if (error) {
      alert(`카카오 로그인 요청 실패: ${error.message}`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] px-4 py-2.5 text-[13.5px] font-semibold text-[#191919] transition-colors hover:bg-[#FDD800]"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 3C6.477 3 2 6.463 2 10.75c0 2.762 1.845 5.19 4.62 6.57-.203.73-.734 2.646-.84 3.058-.132.514.19.507.399.369.164-.108 2.6-1.765 3.655-2.484.706.104 1.436.157 2.166.157 5.523 0 10-3.463 10-7.67C22 6.463 17.523 3 12 3z" />
      </svg>
      {label}
    </button>
  );
}
