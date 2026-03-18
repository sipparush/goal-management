import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import AppProviders from "@/components/AppProviders";

const appSans = Space_Grotesk({
  variable: "--font-app-sans",
  subsets: ["latin"],
});

const appMono = IBM_Plex_Mono({
  variable: "--font-app-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata = {
  title: "Project Management Hub",
  description: "Goal, project, ability, ticket and timeline management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className={`${appSans.variable} ${appMono.variable}`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
