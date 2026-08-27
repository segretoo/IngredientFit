import { getUser } from "@/lib/auth/getUser";
import ChatPageClient from "./ChatPageClient";

// 이 페이지는 얇은 서버 컴포넌트 래퍼임 — 세션만 서버에서 읽고
// 실제 상호작용(동의 모달, 채팅창)은 전부 ChatPageClient(클라이언트)에 위임
export default async function ChatPage() {
  const user = await getUser();
  return <ChatPageClient user={user} />;
}
