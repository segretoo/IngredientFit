"use client";

const CHAT_PATHS = ["/chat", "/mobile/chat"];

// "새로고침"과 "다른 페이지 갔다가 채팅으로 돌아옴"을 구분하기 위한 값.
// localStorage가 아니라 순수 JS 모듈 변수 — 새로고침하면 메모리가 초기화되니
// 자동으로 null이 되고, SPA 내부 이동일 때만 값이 남아있음.
//
// PathTracker(app/layout.tsx에 항상 마운트)가 경로를 벗어날 때(effect cleanup)
// recordLeavingPath를 호출해 기록함. React는 한 커밋 안에서
// "모든 컴포넌트의 cleanup을 먼저 실행 → 그다음 모든 mount effect 실행" 순서를
// 보장하기 때문에(새로 마운트되는 ChatWindow는 cleanup할 게 없어 1단계를 건너뜀),
// ChatWindow의 mount effect가 이 값을 읽을 땐 이미 기록이 끝나있음이 보장됨
let lastPathname: string | null = null;

export function recordLeavingPath(pathname: string): void {
  lastPathname = pathname;
}

/**
 * ChatWindow가 마운트 시 한 번만 호출.
 * true면 "직전 페이지가 채팅이 아니었다"는 뜻 — 호출 즉시 내부 값도 비워서
 * 같은 세션에서 재판정 없이 딱 한 번만 적용되게 함
 */
export function consumeCameFromOutsideChat(): boolean {
  const previous = lastPathname;
  lastPathname = null;
  if (previous === null) return false; // 새로고침 등 최초 진입 — 초기화 안 함
  return !CHAT_PATHS.includes(previous);
}
