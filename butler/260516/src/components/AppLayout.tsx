import type { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

type AppLayoutProps = {
  title: string;
  query: string;
  onQueryChange: (value: string) => void;
  rightPanelOpen: boolean;
  onToggleRightPanel: () => void;
  marketStrip: ReactNode;
  rightRail: ReactNode;
  children: ReactNode;
};

export function AppLayout({
  title,
  query,
  onQueryChange,
  rightPanelOpen,
  onToggleRightPanel,
  marketStrip,
  rightRail,
  children,
}: AppLayoutProps) {
  return (
    <main className="butler-shell">
      <Sidebar />
      <section className={rightPanelOpen ? "app-frame with-rail" : "app-frame"}>
        <Header title={title} query={query} onQueryChange={onQueryChange} onToggleRightPanel={onToggleRightPanel} />
        {marketStrip}
        <section className="content-area">{children}</section>
      </section>
      {rightPanelOpen && rightRail}
    </main>
  );
}
