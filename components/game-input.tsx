import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RotateCcw, Lightbulb } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DAKUTEN_MAP } from "@/lib/constants"

interface GameInputProps {
  currentInput: string
  setCurrentInput: (input: string) => void
  nextChar: string
  message: string
  isAnimating: boolean
  score: number
  passesLeft: number
  showEndConfirm: boolean
  setShowEndConfirm: (show: boolean) => void
  inputRef: React.RefObject<HTMLInputElement>
  handleSubmit: () => void
  handleHint: () => void
  handlePass: () => void
  handleFinish: () => void
  renderCharVariants: (char: string) => React.ReactNode
}

export function GameInput({
  currentInput,
  setCurrentInput,
  nextChar,
  message,
  isAnimating,
  score,
  passesLeft,
  showEndConfirm,
  setShowEndConfirm,
  inputRef,
  handleSubmit,
  handleHint,
  handlePass,
  handleFinish,
  renderCharVariants,
}: GameInputProps) {
  return (
    <div className="space-y-1.5">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">次は{renderCharVariants(nextChar)}で始まるポケモン</p>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="ポケモン名を入力..."
            className="flex-1 h-9"
            disabled={isAnimating}
          />
          <Button onClick={handleSubmit} size="sm" className="px-4" disabled={isAnimating}>
            送信
          </Button>
        </div>
      </div>

      {message && (
        <div className="bg-primary/10 border border-primary rounded-lg p-2 text-center text-sm font-medium animate-in fade-in slide-in-from-top-2">
          {message}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleHint}
          disabled={score < 1 || isAnimating}
          variant="outline"
          size="sm"
          className="flex-1 bg-transparent h-8"
        >
          <Lightbulb className="w-3.5 h-3.5 mr-1" />
          ヒント (-1pt)
        </Button>
        <Button
          onClick={handlePass}
          disabled={passesLeft === 0 || isAnimating}
          variant="outline"
          size="sm"
          className="flex-1 bg-transparent h-8"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          チェンジ (-2pt)
        </Button>
        <Dialog open={showEndConfirm} onOpenChange={setShowEndConfirm}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1 h-8 bg-transparent" disabled={isAnimating}>
              終了
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>ゲームを終了しますか？</DialogTitle>
              <DialogDescription>現在のスコア: {score}pt</DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setShowEndConfirm(false)}
              >
                キャンセル
              </Button>
              <Button className="flex-1" onClick={handleFinish}>
                終了する
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
