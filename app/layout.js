import '@fontsource/alexandria/400.css';
import '@fontsource/alexandria/600.css';
import '@fontsource/alexandria/800.css';
import '@fontsource/ibm-plex-sans-arabic/400.css';
import '@fontsource/ibm-plex-sans-arabic/500.css';
import '@fontsource/ibm-plex-sans-arabic/600.css';
import '@fontsource/space-grotesk/400.css';
import '@fontsource/space-grotesk/500.css';
import './globals.css';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://mohamedali.vercel.app'),
  title: 'محمد علي — إعلانات بالذكاء الاصطناعي | AI Film Director',
  description: 'إعلانات سينمائية بالذكاء الاصطناعي لشركات في مصر والخليج: زراعة، رعاية صحية، منتجات وبراندات.',
  openGraph: {
    title: 'محمد علي — إعلانات بالذكاء الاصطناعي',
    description: 'إعلانات سينمائية بالذكاء الاصطناعي لشركات في مصر والخليج.',
    images: ['/og.jpg'],
    type: 'website',
  },
  twitter: { card: 'summary_large_image', images: ['/og.jpg'] },
};

export const viewport = { themeColor: '#0F0E0C', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
