"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { recordLeavingPath } from "@/lib/chatNavigationTracker";

// 루트 레이아웃에 항상 마운트해두는 보이지 않는 추적기.
// cleanup에서 "떠나기 직전 경로"를 기록함 — React가 한 커밋 안에서
// 모든 cleanup을 먼저 실행하고 그다음 모든 mount effect를 실행하는 순서를
// 이용한 것(새로 마운트되는 페이지는 cleanup이 없어 항상 나중 단계에서만 실행됨).
// 렌더링하는 UI가 없어서 어느 페이지에 있든 부담 없음
export default function PathTracker() {
  const pathname = usePathname();

  useEffect(() => {
    return () => {
      recordLeavingPath(pathname);
    };
  }, [pathname]);

  return null;
}
