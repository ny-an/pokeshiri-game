import { Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { ChainItem } from "@/lib/types"

interface ChainDisplayProps {
  chain: ChainItem[]
  chainEndRef: React.RefObject<HTMLDivElement>
}

export function ChainDisplay({ chain, chainEndRef }: ChainDisplayProps) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5" />
        しりとりチェーン ({chain.filter((item) => item.type === "pokemon").length}匹)
      </p>
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
