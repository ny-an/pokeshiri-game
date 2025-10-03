"use client"

import React, { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Share2 } from "lucide-react"
import { getProgressMessage } from "@/lib/progress-messages"

interface ProgressModalProps {
  isOpen: boolean
  onClose: () => void
  progress: number
  caughtCount: number
  totalCount: number
  newPokemon?: string
  is100Percent?: boolean
  handleShareProgressToX?: () => void
}

export function ProgressModal({ 
  isOpen, 
  onClose, 
  progress, 
  caughtCount, 
  totalCount, 
  newPokemon,
  is100Percent = false,
  handleShareProgressToX
}: ProgressModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [confettiTimer, setConfettiTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // 既存のタイマーをクリア
    if (confettiTimer) {
      clearTimeout(confettiTimer)
      setConfettiTimer(null)
    }

    if (isOpen) {
      setShowConfetti(true)
    } else {
      // モーダルが閉じられた時は、指定秒数後にクラッカーを停止
      if (showConfetti) {
        const duration = is100Percent ? 10000 : 3000
        const timer = setTimeout(() => {
          setShowConfetti(false)
          setConfettiTimer(null)
        }, duration)
        setConfettiTimer(timer)
      }
    }

    // クリーンアップ関数
    return () => {
      if (confettiTimer) {
        clearTimeout(confettiTimer)
        setConfettiTimer(null)
      }
    }
  }, [isOpen, is100Percent, showConfetti])


  const getProgressEmoji = (progress: number) => {
    if (progress >= 100) {
      return "👑💎🏆"
    } else if (progress >= 1 && progress < 5) {
      return "🌟"
    } else if (progress >= 5 && progress < 10) {
      return "🚀"
    } else if (progress >= 10 && progress < 15) {
      return "🗺️"
    } else if (progress >= 15 && progress < 20) {
      return "🤝"
    } else if (progress >= 20 && progress < 25) {
      return "⚔️"
    } else if (progress >= 25 && progress < 30) {
      return "📚"
    } else if (progress >= 30 && progress < 35) {
      return "🚪"
    } else if (progress >= 35 && progress < 40) {
      return "🌌"
    } else if (progress >= 40 && progress < 45) {
      return "⚡"
    } else if (progress >= 45 && progress < 50) {
      return "🐉"
    } else if (progress >= 50 && progress < 55) {
      return "🌌"
    } else if (progress >= 55 && progress < 60) {
      return "🚪"
    } else if (progress >= 60 && progress < 65) {
      return "👼"
    } else if (progress >= 65 && progress < 70) {
      return "☁️"
    } else if (progress >= 70 && progress < 75) {
      return "🔮"
    } else if (progress >= 75 && progress < 80) {
      return "⭐"
    } else if (progress >= 80 && progress < 85) {
      return "👁️"
    } else if (progress >= 85 && progress < 90) {
      return "🔑"
    } else if (progress >= 90 && progress < 95) {
      return "👑"
    } else if (progress >= 95 && progress < 100) {
      return "💎"
    }
    return "🎉"
  }

  // 進捗に応じたクラッカー演出の絵文字数を取得
  const getConfettiCount = (progress: number) => {
    if (progress >= 100) {
      return 150 // 100%達成時は最大
    } else if (progress >= 90) {
      return 120
    } else if (progress >= 80) {
      return 100
    } else if (progress >= 70) {
      return 80
    } else if (progress >= 60) {
      return 70
    } else if (progress >= 50) {
      return 60
    } else if (progress >= 40) {
      return 50
    } else if (progress >= 30) {
      return 40
    } else if (progress >= 20) {
      return 35
    } else if (progress >= 10) {
      return 30
    } else if (progress >= 5) {
      return 25
    } else {
      return 20 // 1%達成時は最小
    }
  }

  // 進捗に応じたクラッカー演出の絵文字サイズを取得
  const getConfettiSize = (progress: number) => {
    if (progress >= 100) {
      return "text-5xl" // 100%達成時は最大
    } else if (progress >= 80) {
      return "text-4xl"
    } else if (progress >= 60) {
      return "text-3xl"
    } else if (progress >= 40) {
      return "text-2xl"
    } else if (progress >= 20) {
      return "text-xl"
    } else {
      return "text-lg" // 1%達成時は最小
    }
  }

  // 進捗に応じたクラッカー演出の絵文字セットを取得
  const getConfettiEmojis = (progress: number) => {
    if (progress >= 100) {
      return ['🎉', '🎊', '✨', '⭐', '💫', '🌟', '👑', '💎', '🏆', '🔥', '⚡', '💖', '🌈', '🎆', '🎇', '💝', '🎁', '🎀', '🦄', '🌠']
    } else if (progress >= 80) {
      return ['🎉', '🎊', '✨', '⭐', '💫', '🌟', '👑', '💎', '🏆', '🔥', '⚡', '💖', '🌈', '🎆']
    } else if (progress >= 60) {
      return ['🎉', '🎊', '✨', '⭐', '💫', '🌟', '👑', '💎', '🏆', '🔥', '⚡', '💖']
    } else if (progress >= 40) {
      return ['🎉', '🎊', '✨', '⭐', '💫', '🌟', '👑', '💎', '🏆', '🔥']
    } else if (progress >= 20) {
      return ['🎉', '🎊', '✨', '⭐', '💫', '🌟', '👑', '💎']
    } else if (progress >= 10) {
      return ['🎉', '🎊', '✨', '⭐', '💫', '🌟']
    } else if (progress >= 5) {
      return ['🎉', '🎊', '✨', '⭐', '💫']
    } else {
      return ['🎉', '🎊', '✨', '⭐'] // 1%達成時は基本の4つ
    }
  }

  return (
    <>
      {/* クラッカー演出 */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(getConfettiCount(progress))].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti-fade"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              <span className={getConfettiSize(progress)}>
                {getConfettiEmojis(progress)[Math.floor(Math.random() * getConfettiEmojis(progress).length)]}
              </span>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              {getProgressEmoji(progress)} 図鑑進捗達成！
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 text-center">
            <div className={`font-semibold ${is100Percent ? 'text-2xl text-yellow-600' : 'text-lg'}`}>
              {getProgressMessage(progress)}
            </div>
            
            {is100Percent && (
              <div className="space-y-2 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg border-2 border-yellow-300">
                <div className="text-lg font-bold text-yellow-800">
                  🎊 おめでとうございます！ 🎊
                </div>
                <div className="text-sm text-yellow-700">
                  すべてのポケモンを制覇しました！
                </div>
                <div className="text-sm text-yellow-700">
                  本当にありがとうございます！
                </div>
                <div className="text-sm text-yellow-700">
                  あなたは真のポケモンマスターです！
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <div className={`font-bold text-primary ${is100Percent ? 'text-4xl' : 'text-3xl'}`}>
                {progress.toFixed(1)}%
              </div>
              
              <div className="flex justify-center items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {caughtCount}匹
                </Badge>
                <span className="text-muted-foreground">/</span>
                <Badge variant="outline" className="text-sm">
                  {totalCount}匹
                </Badge>
              </div>
            </div>

            {newPokemon && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">新しく登録されたポケモン</div>
                <div className="font-semibold text-lg">{newPokemon}</div>
              </div>
            )}

            <div className="w-full bg-secondary rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                  is100Percent ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-primary'
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>

            <div className="space-y-2">
              {handleShareProgressToX && (
                <Button 
                  onClick={handleShareProgressToX} 
                  size="sm" 
                  className="w-full bg-black hover:bg-black/90 text-white"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  進捗をシェア！
                </Button>
              )}
              <Button onClick={onClose} className={`w-full ${is100Percent ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : ''}`}>
                {is100Percent ? '🎉 続ける' : '続ける'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
