import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getUser } from "@/lib/auth/getUser";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "로그인 | 성분핏",
};

interface Props {
  searchParams: Promise<{ redirect?: string }>;
}

// 이미 로그인된 상태로 /login에 들어오면 바로 튕겨냄.
// redirect 쿼리는 "로그인 안 하고 /chat 갔다가 로그인 유도된" 케이스에서
// 로그인 후 원래 페이지로 되돌아가기 위한 값 — /로 시작 안 하면(외부 URL 등) 무시
export default async function LoginPage({ searchParams }: Props) {
  const [user, params] = await Promise.all([getUser(), searchParams]);
  const redirectTo = params.redirect?.startsWith("/") ? params.redirect : "/";

  if (user) {
    redirect(redirectTo);
  }

  return <LoginForm redirectTo={redirectTo} />;
}
