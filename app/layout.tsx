import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "MyHRM Pro — Malaysia Edition",
  description: "Malaysia HR Management Application — EA 1955 Compliant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.31.0/dist/tabler-icons.min.css"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ToastProvider>
          <div className="shell">
            <Sidebar />
            <div className="main">
              <Topbar title="MyHRM Pro" />
              <div className="content view">{children}</div>
            </div>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
