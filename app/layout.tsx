import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

const title = "Campus Connect";
const description =
  "Meet someone new on video in one tap. No sign-up, no downloads. 18+";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${title} · Random video chat`,
    template: `%s · ${title}`,
  },
  description,
  applicationName: title,
  openGraph: {
    type: "website",
    siteName: title,
    title: `${title} · Random video chat`,
    description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} · Random video chat`,
    description,
  },
  // Keeps search engines away while you're testing with friends.
  // Delete this block when you launch publicly.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}