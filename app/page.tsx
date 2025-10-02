import { PokemonShiritoriGame } from "@/components/pokemon-shiritori-game"
import { VersionLogger } from "@/components/version-logger"
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ポケモンしりとりゲーム - ポケモンの名前でしりとりを楽しもう！',
  description: 'ポケモンの名前でしりとりゲームをプレイしよう！連続で正解してハイスコアを目指そう。無料で楽しめるブラウザゲームです。',
  openGraph: {
    title: 'ポケモンしりとりゲーム - ポケモンの名前でしりとりを楽しもう！',
    description: 'ポケモンの名前でしりとりゲームをプレイしよう！連続で正解してハイスコアを目指そう。無料で楽しめるブラウザゲームです。',
  },
  twitter: {
    title: 'ポケモンしりとりゲーム - ポケモンの名前でしりとりを楽しもう！',
    description: 'ポケモンの名前でしりとりゲームをプレイしよう！連続で正解してハイスコアを目指そう。無料で楽しめるブラウザゲームです。',
  },
}

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <VersionLogger />
      <PokemonShiritoriGame />
    </main>
  )
}
