import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import PWARegistration from '@/components/pwa-registration'
import './globals.css'

export const metadata: Metadata = {
  title: 'ポケモンしりとりゲーム',
  description: 'ポケモンの名前でしりとりを楽しもう！連続で正解してハイスコアを目指そう！',
  keywords: ['ポケモン', 'しりとり', 'ゲーム', 'Pokemon', 'Shiritori'],
  authors: [{ name: 'Pokeshiri Game' }],
  creator: 'Pokeshiri Game',
  publisher: 'Pokeshiri Game',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ny-an.github.io/pokeshiri-game'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ポケモンしりとりゲーム',
    description: 'ポケモンの名前でしりとりを楽しもう！連続で正解してハイスコアを目指そう！',
    url: 'https://ny-an.github.io/pokeshiri-game',
    siteName: 'ポケモンしりとりゲーム',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ポケモンしりとりゲーム',
      },
    ],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ポケモンしりとりゲーム',
    description: 'ポケモンの名前でしりとりを楽しもう！連続で正解してハイスコアを目指そう！',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/pokeshiri-game/manifest.json',
  themeColor: '#3b82f6',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ポケモンしりとりゲーム',
  },
  icons: {
    icon: [
      { url: '/pokeshiri-game/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/pokeshiri-game/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/pokeshiri-game/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <head>
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-2KH3T42SLP"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-2KH3T42SLP');
            `,
          }}
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <PWARegistration />
      </body>
    </html>
  )
}
