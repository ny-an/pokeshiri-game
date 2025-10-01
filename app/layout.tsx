import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
