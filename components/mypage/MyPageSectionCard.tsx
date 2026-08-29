import type { ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
  // 카드 제목 옆(우측)에 넣을 버튼/링크. 필요할 때만
  action?: ReactNode;
}

// 마이페이지의 모든 섹션(프로필, 피부 프로필, 즐겨찾기 등)이 공유하는 카드 셸.
// 통일된 테두리·여백을 줘서 섹션마다 제각각으로 보이던 걸 정리함.
// flex column + h-full: grid에서 옆 카드보다 짧아도 늘어나서 높이를 맞추고,
// 자식이 justify-between 등으로 내용을 상/하단에 고정 배치할 수 있게 함
export default function MyPageSectionCard({ title, children, action }: Props) {
  return (
    <section className="flex h-full flex-col rounded-2xl p-6 shadow-[inset_0_0_0_1.5px_var(--color-border)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-[var(--color-ink)]">{title}</h2>
        {action}
      </div>
      <div className="mt-4 flex-1">{children}</div>
    </section>
  );
}
