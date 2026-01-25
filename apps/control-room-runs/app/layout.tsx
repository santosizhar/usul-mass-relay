import "./globals.css";
import type { ReactNode } from "react";
import Link from "next/link";
import { RunRuntimeProvider } from "./components/RunRuntimeProvider";

export const metadata = {
  title: "Control Room Runs",
  description: "Control Room surface for Run observability and HITL actions."
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <RunRuntimeProvider>
          <div className="app-shell">
            <header className="app-header">
              <div>
                <p className="app-eyebrow">Mass Relay Control Room (Beta)</p>
                <h1>Operations Control Room</h1>
              </div>
              <span className="app-badge">HITL enabled</span>
            </header>
            <nav className="app-nav">
              <Link className="app-nav-link" href="/">
                Runs
              </Link>
              <Link className="app-nav-link" href="/review-queue">
                Review queue
              </Link>
              <Link className="app-nav-link" href="/exception-queue">
                Exception queue
              </Link>
              <Link className="app-nav-link" href="/policy-inspection">
                Policy inspection
              </Link>
              <Link className="app-nav-link" href="/playbooks">
                Playbooks
              </Link>
              <Link className="app-nav-link" href="/agent-journal">
                AI journal
              </Link>
            </nav>
            <main>{children}</main>
          </div>
        </RunRuntimeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
