import type { Metadata } from "next";
import ForgotPasswordForm from "@/app/forgot-password/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "비밀번호 찾기 | 성분핏",
};

export default function MobileForgotPasswordPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-5 py-10">
      <ForgotPasswordForm />
    </div>
  );
}
