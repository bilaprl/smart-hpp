import "./globals.css";
import { ThemeProvider } from "../components/ThemeContext";

export const metadata = {
  title: "SmartHPP - Solusi Keuangan UMKM",
  description: "Sistem manajemen keuangan cerdas untuk UMKM.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&family=Open+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Round"
          rel="stylesheet"
        />
      </head>
      <body
        className="m-0 p-0 w-full overflow-x-hidden bg-smart-bg text-smart-text font-sans antialiased flex flex-col min-h-screen selection:bg-smart-lime selection:text-smart-dark transition-colors duration-300"
        suppressHydrationWarning
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
