import { Zap } from "lucide-react"
import { getLastPokemon, getTypeEmoji } from "@/lib/game-utils"
import type { ChainItem, GameMode } from "@/lib/types"

interface ScoreDisplayProps {
  score: number
  scoreKey: number
  highScore: number
  combo: number
  comboKey: number
  maxCombo: number
  passesLeft: number
  passesKey: number
  chain: ChainItem[]
  gameMode: GameMode
}

export function ScoreDisplay({
  score,
  scoreKey,
  highScore,
  combo,
  comboKey,
  maxCombo,
  passesLeft,
  passesKey,
  chain,
  gameMode,
}: ScoreDisplayProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="bg-card rounded-lg p-1.5 border text-center">
        <p key={scoreKey} className="text-xl font-bold text-primary animate-number-pop">
          {score}
        </p>
        <p className="text-xs text-muted-foreground">スコア</p>
        {highScore > 0 && (
          <p className="text-xs text-muted-foreground mt-0.5">
            最高: {highScore}pt {gameMode === 'timeattack' && '(TA)'}
          </p>
        )}
      </div>
      <div className="bg-card rounded-lg p-1.5 border text-center">
        <div className="flex items-center justify-center gap-1">
          <Zap className="w-4 h-4 text-secondary" />
          <p key={comboKey} className="text-xl font-bold text-secondary animate-number-pop">
            {combo}
          </p>
          <span className="text-xs text-muted-foreground">/ {maxCombo}</span>
        </div>
        <p className="text-xs text-muted-foreground">タイプ一致コンボ</p>
        {combo > 0 &&
          (() => {
            const lastPokemon = getLastPokemon(chain)
            if (lastPokemon) {
              const typeEmoji = getTypeEmoji(lastPokemon.types)
              return (
                <p className="text-sm mt-0.5">
                  {typeEmoji} ×{combo}
                </p>
              )
            }
            return null
          })()}
      </div>
      <div className="bg-card rounded-lg p-1.5 border text-center">
        <p key={passesKey} className="text-xl font-bold animate-number-pop">
          {passesLeft}
        </p>
        <p className="text-xs text-muted-foreground">チェンジ残</p>
      </div>
    </div>
  )
}
