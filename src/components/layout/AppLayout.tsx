// front/src/components/layout/AppLayout.tsx

import { Header } from "./Header";
import { Footer } from "./Footer";
import { BottomNav } from "./BottomNav";
import type { ReactNode } from "react";

export type Props = { 
  children: ReactNode 
};

export function AppLayout({ children }: Props) {
  return (
    <div className="app-root">
      {/* ブラウザ全体の背景（グレー） */}

      <div className="app-shell">
        {/* スマホ本体（白い枠） */}

        <Header />

        <main className="app-main">
          {children}
        </main>

        <Footer />
        <BottomNav />
      </div>
    </div>
  );
}
