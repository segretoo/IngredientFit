import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getUser } from "@/lib/auth/getUser";
import LoginForm from "@/app/login/LoginForm";

export const metadata: Metadata = {
  title: "로그인 | 성분핏",
};

// 데스크톱 app/login/page.tsx와 동일 로직, Header/Footer만 없음
// (app/mobile/layout.tsx가 MobileHeader를 이미 제공하고, 모바일은 Footer 자체가 없음)
export default async function MobileLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const [user, params] = await Promise.all([getUser(), searchParams]);
  const redirectTo = params.redirect?.startsWith("/") ? params.redirect : "/";

  if (user) {
    redirect(redirectTo);
  }

  return (
    <div className="flex flex-1 items-center justify-center px-5 py-10">
      <LoginForm redirectTo={redirectTo} />
    </div>
  );
}
