import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, HelpCircle, BookOpen } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Pokemon } from "@/lib/types"

interface GameHeaderProps {
  startPokemon: Pokemon
  goalPokemon: Pokemon
  showRules: boolean
  setShowRules: (show: boolean) => void
  showPokedex: boolean
  setShowPokedex: (show: boolean) => void
  showDeveloperInfo: boolean
  setShowDeveloperInfo: (show: boolean) => void
  displayCaughtCount: number
  totalCount: number
  completionRate: string
  pokemonHistory: { [name: string]: number }
  allPokemon: any[]
  getMaskedName: (name: string) => string
}

export function GameHeader({
  startPokemon,
  goalPokemon,
  showRules,
  setShowRules,
  showPokedex,
  setShowPokedex,
  showDeveloperInfo,
  setShowDeveloperInfo,
  displayCaughtCount,
  totalCount,
  completionRate,
  pokemonHistory,
  allPokemon,
  getMaskedName,
}: GameHeaderProps) {
  return (
    <div className="text-center space-y-0 relative">
      <h1 className="text-2xl md:text-3xl font-bold text-balance">
        🎮ポケしり
        <Dialog open={showDeveloperInfo} onOpenChange={setShowDeveloperInfo}>
          <DialogTrigger asChild>
            <button className="hover:scale-110 transition-transform inline-block">🥹</button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-center">開発者情報</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 text-center">
              <p className="text-sm text-muted-foreground">このゲームを作った人</p>
              <div className="space-y-2">
                <p className="text-lg font-bold">@GaoGaoPuuun</p>
                <p className="text-sm text-muted-foreground">フォローしてね！</p>
              </div>
              <Button
                onClick={() => window.open("https://twitter.com/GaoGaoPuuun", "_blank")}
                className="w-full bg-black hover:bg-black/90 text-white"
              >
                Xでフォローする
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </h1>
      <p className="text-sm text-muted-foreground">スコアアタック</p>
      <Dialog open={showPokedex} onOpenChange={setShowPokedex}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="absolute left-0 top-0 h-8 w-8">
            <BookOpen className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>ポケモン図鑑</DialogTitle>
            <DialogDescription>
              入力済み: {displayCaughtCount} / {totalCount} ({completionRate}%)
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 pr-2">
            <div className="grid grid-cols-1 gap-2">
              {allPokemon.map((pokemon) => {
                const RESTRICTED_POKEMON = ["ロトム", "オドリドリ", "ミノマダム"]
                const isRestricted = RESTRICTED_POKEMON.includes(pokemon.name)
                const count = pokemonHistory[pokemon.name] || 0
                const isCaught = count > 0 || isRestricted
                return (
                  <div
                    key={pokemon.number}
                    className={`p-2 rounded-lg border text-sm ${
                      isCaught ? "bg-primary/5 border-primary/20" : "bg-muted/50 border-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">No.{pokemon.number}</span>
                        <p className={`font-medium ${isCaught ? "text-foreground" : "text-muted-foreground"}`}>
                          {isCaught ? pokemon.name : getMaskedName(pokemon.name)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {isCaught && (
                          <div className="flex gap-1">
                            {pokemon.type1 ? (
                              <>
                                <Badge variant="outline" className="text-xs h-4 px-1.5">
                                  {pokemon.type1}
                                </Badge>
                                {pokemon.type2 && (
                                  <Badge variant="outline" className="text-xs h-4 px-1.5">
                                    {pokemon.type2}
                                  </Badge>
                                )}
                              </>
                            ) : (
                              <Badge variant="outline" className="text-xs h-4 px-1.5">
                                タイプなし
                              </Badge>
                            )}
                          </div>
                        )}
                        {isRestricted ? (
                          <Badge variant="secondary" className="text-xs h-4 px-1.5 bg-destructive/20">
                            使用不可
                          </Badge>
                        ) : (
                          count > 0 && (
                            <Badge variant="secondary" className="text-xs h-4 px-1.5">
                              {count}回
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showRules} onOpenChange={setShowRules}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-8 w-8">
            <HelpCircle className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>ゲームルール</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 text-sm text-left">
                <div>
                  <h4 className="font-semibold mb-1">基本ルール</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>スタートからゴールまでしりとりでつなぐ</li>
                    <li>ポケモン名が「ー」で終わる場合、その前の文字を使用</li>
                    <li>濁音・半濁音は清音でもOK（例：チ↔ヂ）</li>
                    <li className="font-bold text-primary">✅ ひらがな入力OK</li>
                    <li className="font-bold text-primary">✅ 「ん」で終わってもOK（自動チェンジ）</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">得点システム</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>基本：+1pt</li>
                    <li>タイプ一致コンボ：連鎖数×1pt（1連鎖=1pt、2連鎖=2pt、3連鎖=3pt...）</li>
                    <li>ゴール到達：+10pt</li>
                    <li>任意チェンジ：-2pt（最大3回、コンボリセット）</li>
                    <li>重複使用：-5pt（コンボリセット）</li>
                    <li>ヒント：-1pt（ポケモン名を1つ表示）</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">タイプ一致コンボ</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>前のポケモンとタイプが1つでも同じ場合、コンボ継続</li>
                    <li>コンボが続くほど高得点（例：4連鎖目は+4pt）</li>
                    <li>タイプ不一致でコンボリセット</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">自動チェンジ</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>「ン」で終わる場合、自動的にランダムな文字に変更</li>
                    <li>ペナルティなし</li>
                  </ul>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 space-y-0.5">
          <p className="text-xs text-muted-foreground">スタート</p>
          <div className="bg-primary/10 rounded-lg p-1.5 border-2 border-primary">
            <p className="font-bold text-sm text-primary">{startPokemon.name}</p>
            <div className="flex gap-1 mt-0.5">
              {startPokemon.types.map((type) => (
                <Badge key={type} variant="secondary" className="text-xs h-4 px-1.5">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <ArrowRight className="text-muted-foreground flex-shrink-0 w-4 h-4" />

        <div className="flex-1 space-y-0.5">
          <p className="text-xs text-muted-foreground">ゴール</p>
          <div className="bg-accent/10 rounded-lg p-1.5 border-2 border-accent">
            <p className="font-bold text-sm text-accent">{goalPokemon.name}</p>
            <div className="flex gap-1 mt-0.5">
              {goalPokemon.types.map((type) => (
                <Badge key={type} variant="secondary" className="text-xs h-4 px-1.5">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
