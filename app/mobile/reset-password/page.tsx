import type { Metadata } from "next";
import { getUser } from "@/lib/auth/getUser";
import ResetPasswordForm from "@/app/reset-password/ResetPasswordForm";

export const metadata: Metadata = {
  title: "비밀번호 재설정 | 성분핏",
};

export default async function MobileResetPasswordPage() {
  const user = await getUser();

  return (
    <div className="flex flex-1 items-center justify-center px-5 py-10">
      <ResetPasswordForm canReset={Boolean(user)} />
    </div>
  );
}
