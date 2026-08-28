import { getUser } from "@/lib/auth/getUser";
import MobileChatPageClient from "./MobileChatPageClient";

// 얇은 서버 컴포넌트 래퍼 — app/chat/page.tsx와 동일 패턴
export default async function MobileChatPage() {
  const user = await getUser();
  return <MobileChatPageClient user={user} />;
}
