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
}

export function ProgressModal({ 
  isOpen, 
  onClose, 
  progress, 
  caughtCount, 
  totalCount, 
  newPokemon 
}: ProgressModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true)
      // 3秒後にクラッカーを停止
      const timer = setTimeout(() => {
        setShowConfetti(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const getProgressMessage = (progress: number) => {
    if (progress >= 1 && progress < 5) {
      return "図鑑を開始しました！"
    } else if (progress >= 5 && progress < 10) {
      return "図鑑コレクター！"
    } else if (progress >= 10 && progress < 15) {
      return "ポケモンマスター候補！"
    } else if (progress >= 15 && progress < 20) {
      return "すごいコレクター！"
    } else if (progress >= 20 && progress < 25) {
      return "伝説のトレーナー！"
    } else if (progress >= 25 && progress < 30) {
      return "ポケモン博士レベル！"
    } else if (progress >= 30 && progress < 35) {
      return "殿堂入りトレーナー！"
    } else if (progress >= 35 && progress < 40) {
      return "神話級コレクター！"
    } else if (progress >= 40 && progress < 45) {
      return "伝説のポケモンハンター！"
    } else if (progress >= 45 && progress < 50) {
      return "究極のポケモンマスター！"
    } else if (progress >= 50 && progress < 60) {
      return "ポケモン界のレジェンド！"
    } else if (progress >= 60 && progress < 70) {
      return "神話に残るトレーナー！"
    } else if (progress >= 70 && progress < 80) {
      return "伝説のポケモンコレクター！"
    } else if (progress >= 80 && progress < 90) {
      return "究極のポケモンハンター！"
    } else if (progress >= 90 && progress < 100) {
      return "神話級ポケモンマスター！"
    } else if (progress >= 100) {
      return "完全制覇！ポケモン界の神！"
    }
    return "おめでとう！"
  }

  const getProgressEmoji = (progress: number) => {
    if (progress >= 1 && progress < 5) {
      return "🎉"
    } else if (progress >= 5 && progress < 10) {
      return "🌟"
    } else if (progress >= 10 && progress < 15) {
      return "⭐"
    } else if (progress >= 15 && progress < 20) {
      return "💫"
    } else if (progress >= 20 && progress < 25) {
      return "✨"
    } else if (progress >= 25 && progress < 30) {
      return "🏆"
    } else if (progress >= 30 && progress < 35) {
      return "👑"
    } else if (progress >= 35 && progress < 40) {
      return "💎"
    } else if (progress >= 40 && progress < 45) {
      return "🔥"
    } else if (progress >= 45 && progress < 50) {
      return "⚡"
    } else if (progress >= 50 && progress < 60) {
      return "🌟"
    } else if (progress >= 60 && progress < 70) {
      return "💫"
    } else if (progress >= 70 && progress < 80) {
      return "✨"
    } else if (progress >= 80 && progress < 90) {
      return "🏆"
    } else if (progress >= 90 && progress < 100) {
      return "👑"
    } else if (progress >= 100) {
      return "💎"
    }
    return "🎉"
  }

  return (
    <>
      {/* クラッカー演出 */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
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
              <span className="text-2xl">
                {['🎉', '🎊', '✨', '⭐', '💫', '🌟'][Math.floor(Math.random() * 6)]}
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
            <div className="text-lg font-semibold">
              {getProgressMessage(progress)}
            </div>
            
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">
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
                className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>

            <Button onClick={onClose} className="w-full">
              続ける
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
