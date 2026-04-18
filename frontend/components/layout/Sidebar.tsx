import type { ReactNode } from "react";

export default function Sidebar({ children }: { children: ReactNode }) {
  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
      {children}
    </aside>
  );
}
