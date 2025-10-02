import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { GameMode } from "@/lib/types"

interface ModeConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  targetMode: GameMode
}

export function ModeConfirmModal({ isOpen, onClose, onConfirm, targetMode }: ModeConfirmModalProps) {
  const getMessage = () => {
    if (targetMode === 'single') {
      return "現在のゲームをリセットしてシングルモードを開始します。よろしいですか？"
    } else {
      return "60秒間のタイムアタックにチャレンジします。よろしいですか？"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>モード変更確認</DialogTitle>
          <DialogDescription className="text-center py-4">
            {getMessage()}
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            キャンセル
          </Button>
          <Button onClick={onConfirm} className="flex-1">
            はい
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
