import type { Metadata } from "next";
import { Manrope, Public_Sans } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-manrope",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-public-sans",
});

export const metadata: Metadata = {
  title: "Northbeam Finance",
  description: "Fixkosten, Ausgaben und Einnahmen im Überblick.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" data-theme="light">
      <body className={`${manrope.variable} ${publicSans.variable} font-body`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `try {
              var t = localStorage.getItem('theme');
              if (t === 'dark' || t === 'light') document.documentElement.dataset.theme = t;
            } catch (e) {}`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
