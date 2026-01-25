import "./globals.css";
import type { ReactNode } from "react";
import Link from "next/link";

export const metadata = {
  title: "Control Room Runs",
  description: "Read-only Control Room surface for Run observability."
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <header className="app-header">
            <div>
              <p className="app-eyebrow">Mass Relay Control Room (Beta)</p>
              <h1>Operations Control Room</h1>
            </div>
            <span className="app-badge">Read-only</span>
          </header>
          <nav className="app-nav">
            <Link className="app-nav-link" href="/">
              Runs
            </Link>
            <Link className="app-nav-link" href="/playbooks">
              Playbooks
            </Link>
          </nav>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
};

export default RootLayout;
