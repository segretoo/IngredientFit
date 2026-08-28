import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getUser } from "@/lib/auth/getUser";
import SignupForm from "./SignupForm";

export const metadata: Metadata = {
  title: "회원가입 | 성분핏",
};

interface Props {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function SignupPage({ searchParams }: Props) {
  const [user, params] = await Promise.all([getUser(), searchParams]);
  const redirectTo = params.redirect?.startsWith("/") ? params.redirect : "/";

  if (user) {
    redirect(redirectTo);
  }

  return <SignupForm redirectTo={redirectTo} />;
}
