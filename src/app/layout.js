import '@/styles/globals.css';

export const metadata = {
  title: 'SmartPark — IoT Bin Monitoring',
  description: 'Real-time public bin monitoring and management system for smart cities',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className="bg-sp-bg min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
