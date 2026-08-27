import { getUser } from "@/lib/auth/getUser";
import FaqPageClient from "./FaqPageClient";

// 얇은 서버 컴포넌트 래퍼 — chat/page.tsx와 동일한 패턴
export default async function FaqPage() {
  const user = await getUser();
  return <FaqPageClient user={user} />;
}
