import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getUser } from "@/lib/auth/getUser";
import SignupForm from "@/app/signup/SignupForm";

export const metadata: Metadata = {
  title: "회원가입 | 성분핏",
};

export default async function MobileSignupPage({
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
      <SignupForm redirectTo={redirectTo} />
    </div>
  );
}
