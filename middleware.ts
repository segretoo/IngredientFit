import { NextRequest, NextResponse } from "next/server";

// 데스크톱 경로 → 대응하는 /mobile 경로 매핑
// (app/mobile/chat-intro, app/mobile/programs 같은 모바일 전용 페이지는
// 리다이렉트 대상이 아니라서 여기 안 넣음)
const MOBILE_REDIRECT_MAP: Record<string, string> = {
  "/": "/mobile",
  "/chat": "/mobile/chat",
  "/contact": "/mobile/contact",
  "/event": "/mobile/event",
  "/forgot-password": "/mobile/forgot-password",
  "/login": "/mobile/login",
  "/mypage": "/mobile/mypage",
  "/reset-password": "/mobile/reset-password",
  "/signup": "/mobile/signup",
  "/skin-profile": "/mobile/skin-profile",
  "/faq": "/mobile/faq",
  "/notice": "/mobile/notice",
  "/products": "/mobile/products",
  "/terms": "/mobile/terms",
};

// 흔한 모바일 기기 UA 패턴. 아이패드는 최신 iOS에서 데스크톱 UA로 위장하는
// 경우 많아서 일부러 뺌. 어차피 화면 넓어서 데스크톱 레이아웃이 더 잘 맞음
const MOBILE_UA_REGEX = /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i;

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const target = MOBILE_REDIRECT_MAP[pathname];
  if (!target) return NextResponse.next();

  const userAgent = req.headers.get("user-agent") ?? "";
  if (!MOBILE_UA_REGEX.test(userAgent)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = target;
  // ?concern=wrinkle 같은 쿼리스트링 그대로 유지해서 넘김
  url.search = search;
  return NextResponse.redirect(url);
}

export const config = {
  // API, 정적 파일(_next), 이미지/아이콘/로고는 리다이렉트 대상에서 제외.
  // 위 매핑이 정확히 일치하는 경로만 잡아서 이 필터 없어도 안전하긴 한데,
  // 정적 파일 요청마다 미들웨어 굳이 안 돌게 성능상 미리 걸러주는 용도
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|logo|icons).*)"],
};
