import type { ReactNode } from "react";

export default function AppShell({
  sidebar,
  children,
}: {
  sidebar: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="h-screen flex bg-slate-50">
      {sidebar}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
