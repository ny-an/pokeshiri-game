import { Button } from "@/components/ui/button"
import { Share2, RotateCcw } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { GameState, ChainItem, Pokemon, GameMode } from "@/lib/types"

interface ResultModalProps {
  showResultModal: boolean
  setShowResultModal: (show: boolean) => void
  gameState: GameState
  gameMode: GameMode
  score: number
  highScore: number
  chain: ChainItem[]
  maxCombo: number
  passesLeft: number
  usedHint: boolean
  startPokemon: Pokemon
  goalPokemon: Pokemon
  timeLeft?: number
  isTimeUp?: boolean
  handleShareToX: () => void
  handleReset: () => void
  onClose?: () => void
}

export function ResultModal({
  showResultModal,
  setShowResultModal,
  gameState,
  gameMode,
  score,
  highScore,
  chain,
  maxCombo,
  passesLeft,
  usedHint,
  startPokemon,
  goalPokemon,
  timeLeft,
  isTimeUp,
  handleShareToX,
  handleReset,
  onClose,
}: ResultModalProps) {
  const getTitle = () => {
    if (gameMode === 'timeattack') {
      if (gameState === "cleared") {
        return "🎉 タイムアタック クリア！ 🎉"
      } else if (isTimeUp) {
        return "⏰ タイムアップ！"
      } else {
        return "タイムアタック 終了"
      }
    }
    return gameState === "cleared" ? "🎉 クリア！ 🎉" : "ゲーム終了"
  }

  const formatTime = (seconds: number) => {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`
  }
  return (
    <Dialog open={showResultModal} onOpenChange={() => {}}>
      <DialogContent className="max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {getTitle()}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="text-center space-y-2">
            <p className="text-5xl font-bold text-primary">{score}pt</p>
            {score > highScore && highScore > 0 && (
              <p className="text-sm font-bold text-secondary">
                🎊 {gameMode === 'timeattack' ? 'タイムアタック' : ''}最高記録更新！ 🎊
              </p>
            )}
          </div>

          <div className="space-y-2 bg-muted rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">つないだ数</span>
              <span className="text-lg font-bold">{chain.filter((item) => item.type === "pokemon").length}匹</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">最大コンボ</span>
              <span className="text-lg font-bold">{maxCombo}連鎖</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">チェンジ使用</span>
              <span className="text-lg font-bold">{3 - passesLeft}回</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">ヒント</span>
              <span className="text-lg font-bold">{usedHint ? "使用" : "未使用"}</span>
            </div>
            {gameMode === 'timeattack' && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {isTimeUp ? "タイムアップ" : "残り時間"}
                </span>
                <span className="text-lg font-bold">
                  {isTimeUp ? "0:00" : formatTime(timeLeft || 0)}
                </span>
              </div>
            )}
          </div>

          {!usedHint && gameState === "cleared" && (
            <p className="text-center text-sm font-bold text-secondary">✨ ヒントなしでクリア！ ✨</p>
          )}

          <div className="text-center text-xs text-muted-foreground">
            {startPokemon.name} → {goalPokemon.name}
            {gameMode === 'timeattack' && <div className="mt-1">タイムアタックモード</div>}
          </div>

          <div className="space-y-2">
            <Button onClick={handleShareToX} size="sm" className="w-full bg-black hover:bg-black/90 text-white">
              <Share2 className="w-4 h-4 mr-2" />
              同じ問題でチャレンジ！
            </Button>
            <Button
              onClick={() => {
                setShowResultModal(false)
                if (onClose) {
                  onClose()
                }
                handleReset()
              }}
              size="sm"
              className="w-full bg-transparent"
              variant="outline"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              もう一度プレイ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
