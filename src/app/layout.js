import "./globals.css";

export const metadata = {
  title: "GRID·ID — Prediksi Risiko Pemadaman Listrik",
  description:
    "Lapisan kecerdasan AI untuk infrastruktur ketenagalistrikan. Prediksi risiko dari foto warga + prakiraan cuaca resmi BMKG.",
  icons: {
    icon: "/grid-logos.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800;900&family=Poppins:wght@300;400;500;600&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
