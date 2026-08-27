import type { Metadata } from "next";
import MobileHeader from "@/components/mobile/MobileHeader";
import { getUser } from "@/lib/auth/getUser";

export const metadata: Metadata = {
  title: "성분핏 모바일",
};

export default async function MobileLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  return (
    <div
      data-mobile-shell
      className="relative mx-auto w-full min-h-screen max-w-[480px] overflow-x-hidden bg-white [transform:translateZ(0)]"
    >
      <MobileHeader user={user} />
      {children}
    </div>
  );
}
