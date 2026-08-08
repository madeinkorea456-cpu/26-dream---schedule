import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "26기 드림이 시간표",
  description: "인천대학교 홍보대사 드림이 26기 팀 활동가능 시간표 취합 도구",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
