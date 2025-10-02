import { Sparkles, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { ChainItem, GameMode } from "@/lib/types"

interface ChainDisplayProps {
  chain: ChainItem[]
  chainEndRef: React.RefObject<HTMLDivElement>
  gameMode: GameMode
  timeLeft?: number
}

export function ChainDisplay({ chain, chainEndRef, gameMode, timeLeft }: ChainDisplayProps) {
  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          しりとりチェーン ({chain.filter((item) => item.type === "pokemon").length}匹)
        </p>
        {gameMode === 'timeattack' && timeLeft !== undefined && (
          <div className="flex items-center gap-1.5 text-sm">
            <Clock className="w-3.5 h-3.5" />
            <span className={`font-mono font-bold ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </div>
      <div className="bg-muted rounded-lg p-2 max-h-32 overflow-y-auto space-y-1">
        {chain.map((item, index) => {
          if (item.type === "pokemon") {
            const pokemonIndex = chain.slice(0, index + 1).filter((i) => i.type === "pokemon").length
            return (
              <div key={index} className="flex items-center gap-2 text-sm animate-in fade-in slide-in-from-left">
                <span className="text-muted-foreground text-xs">{pokemonIndex}.</span>
                <span className="font-medium">{item.pokemon.name}</span>
                <div className="flex gap-1">
                  {item.pokemon.types.map((type) => (
                    <Badge key={type} variant="outline" className="text-xs h-4 px-1.5">
                      {type}
                    </Badge>
                  ))}
                </div>
                {item.points > 0 && <span className="text-xs text-primary font-semibold">+{item.points}pt</span>}
              </div>
            )
          } else if (item.type === "pass") {
            return (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-muted-foreground italic animate-in fade-in slide-in-from-left"
              >
                <span className="text-xs">⏭️</span>
                <span className="text-xs">
                  チェンジ使用: 「{item.fromChar}」→「{item.toChar}」
                </span>
                <span className="text-xs text-destructive font-semibold">{item.points}pt</span>
              </div>
            )
          } else if (item.type === "hint") {
            return (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-amber-600 animate-in fade-in slide-in-from-left"
              >
                <span className="text-xs">💡</span>
                <span className="font-medium">{item.pokemon.name}</span>
                <span className="text-xs">(ヒント)</span>
                <span className="text-xs font-semibold">{item.points}pt</span>
              </div>
            )
          } else {
            return (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-destructive animate-in fade-in slide-in-from-left"
              >
                <span className="text-xs">❌</span>
                <span className="font-medium">{item.pokemon.name}</span>
                <span className="text-xs">(使用済み)</span>
                <span className="text-xs font-semibold">{item.points}pt</span>
              </div>
            )
          }
        })}
        <div ref={chainEndRef}></div>
      </div>
    </div>
  )
}
