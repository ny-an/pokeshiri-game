"use client"

import React, { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ProgressModalProps {
  isOpen: boolean
  onClose: () => void
  progress: number
  caughtCount: number
  totalCount: number
  newPokemon?: string
  is100Percent?: boolean
}

export function ProgressModal({ 
  isOpen, 
  onClose, 
  progress, 
  caughtCount, 
  totalCount, 
  newPokemon,
  is100Percent = false
}: ProgressModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true)
      // 100%達成時は10秒、通常時は3秒後にクラッカーを停止
      const duration = is100Percent ? 10000 : 3000
      const timer = setTimeout(() => {
        setShowConfetti(false)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isOpen, is100Percent])

  const getProgressMessage = (progress: number) => {
    if (progress >= 100) {
      return "🎉🎉🎉 完全制覇！ポケモン界の神！ 🎉🎉🎉"
    } else if (progress >= 1 && progress < 5) {
      return "さあ、伝説の始まりだ！"
    } else if (progress >= 5 && progress < 10) {
      return "最初の一歩を踏み出した"
    } else if (progress >= 10 && progress < 15) {
      return "冒険が本格的に始まる"
    } else if (progress >= 15 && progress < 20) {
      return "仲間たちとの絆が深まる"
    } else if (progress >= 20 && progress < 25) {
      return "真のトレーナーへの道を歩む"
    } else if (progress >= 25 && progress < 30) {
      return "知識と経験が積み重なる"
    } else if (progress >= 30 && progress < 35) {
      return "伝説への扉が開かれる"
    } else if (progress >= 35 && progress < 40) {
      return "神話の世界に足を踏み入れる"
    } else if (progress >= 40 && progress < 45) {
      return "古の力が目覚め始める"
    } else if (progress >= 45 && progress < 50) {
      return "伝説のポケモンが姿を現す"
    } else if (progress >= 50 && progress < 55) {
      return "時空を超えた冒険が始まる"
    } else if (progress >= 55 && progress < 60) {
      return "異次元の扉が開かれる"
    } else if (progress >= 60 && progress < 65) {
      return "神々の領域に近づく"
    } else if (progress >= 65 && progress < 70) {
      return "天界の門をくぐる"
    } else if (progress >= 70 && progress < 75) {
      return "宇宙の真理に触れる"
    } else if (progress >= 75 && progress < 80) {
      return "星々の記憶を読み解く"
    } else if (progress >= 80 && progress < 85) {
      return "究極の存在と対峙する"
    } else if (progress >= 85 && progress < 90) {
      return "創造の秘密を解き明かす"
    } else if (progress >= 90 && progress < 95) {
      return "創造主の座に手が届く"
    } else if (progress >= 95 && progress < 100) {
      return "神の領域に到達する"
    }
    return "おめでとう！"
  }

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

  return (
    <>
      {/* クラッカー演出 */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(is100Percent ? 100 : 50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <span className={is100Percent ? "text-4xl" : "text-2xl"}>
                {is100Percent 
                  ? ['🎉', '🎊', '✨', '⭐', '💫', '🌟', '👑', '💎', '🏆', '🔥', '⚡', '💖'][Math.floor(Math.random() * 12)]
                  : ['🎉', '🎊', '✨', '⭐', '💫', '🌟'][Math.floor(Math.random() * 6)]
                }
              </span>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
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

            <Button onClick={onClose} className={`w-full ${is100Percent ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : ''}`}>
              {is100Percent ? '🎉 ありがとう！' : '続ける'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
