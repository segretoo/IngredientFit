import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';

// 카카오(및 향후 추가할 다른 OAuth) 로그인 완료 후 돌아오는 콜백 주소.
// Supabase 대시보드에 등록한 "Callback URL"이나 카카오 콘솔 Redirect URI는
// project.supabase.co 쪽 주소라 이거랑 다른 값 — 혼동 주의
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';

    if (code) {
        const supabase = await getSupabaseServerClient();

        if (supabase) {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (!error) {
                return NextResponse.redirect(`${origin}${next}`);
            }
            console.error('[auth/callback] 세션 교환 실패:', error.message);
        }
    }

    return NextResponse.redirect(`${origin}/auth/test?error=1`);
}
