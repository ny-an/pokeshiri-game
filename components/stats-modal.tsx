'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface GameStats {
  totalPokemonAnswers: number
  totalGameClears: number
  totalGameOvers: number
  totalGames: number
  clearRate: number
  averageAnswersPerGame: number
  maxScore: number
  maxChainLength: number
  serviceStartDate: string
  lastUpdated: string
  error?: string
}

interface StatsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function StatsModal({ isOpen, onClose }: StatsModalProps) {
  const [stats, setStats] = useState<GameStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchStats()
    }
  }, [isOpen])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/stats.json')
      
      if (!response.ok) {
        throw new Error('統計データの取得に失敗しました')
      }
      
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error('Stats fetch error:', err)
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatServiceDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              📊 ゲーム統計（累計）
            </DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (error || !stats) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              ⚠️ エラー
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center">
            <p className="text-red-500 mb-4">
              {error || '統計データの読み込みに失敗しました'}
            </p>
            <Button onClick={fetchStats} variant="outline">
              再試行
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            📊 ゲーム統計（累計）
          </DialogTitle>
          <DialogDescription>
            最終更新: {formatDate(stats.lastUpdated)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 p-1">
          {/* メイン統計カード */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 総回答数 */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalPokemonAnswers.toLocaleString()}
              </div>
              <div className="text-sm text-blue-800 font-medium">
                総回答数
              </div>
              <Badge variant="secondary" className="mt-2">
                🎯 回答
              </Badge>
            </div>

            {/* クリア数 */}
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {stats.totalGameClears.toLocaleString()}
              </div>
              <div className="text-sm text-green-800 font-medium">
                クリア数
              </div>
              <Badge variant="secondary" className="mt-2">
                🏆 成功
              </Badge>
            </div>

            {/* ゲームオーバー数 */}
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {stats.totalGameOvers.toLocaleString()}
              </div>
              <div className="text-sm text-red-800 font-medium">
                オーバー数
              </div>
              <Badge variant="secondary" className="mt-2">
                💥 失敗
              </Badge>
            </div>

            {/* 成功率 */}
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {stats.clearRate.toFixed(1)}%
              </div>
              <div className="text-sm text-purple-800 font-medium">
                成功率
              </div>
              <Badge variant="secondary" className="mt-2">
                📈 率
              </Badge>
            </div>
          </div>

          {/* 記録統計 */}
          <div className="grid grid-cols-2 gap-4">
            {/* 最高得点 */}
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.maxScore > 0 ? stats.maxScore.toLocaleString() : '取得中...'}
              </div>
              <div className="text-sm text-yellow-800 font-medium">
                最高得点
              </div>
              <Badge variant="secondary" className="mt-2">
                ⭐ 得点
              </Badge>
            </div>

            {/* 最長回答 */}
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {stats.maxChainLength > 0 ? stats.maxChainLength : '取得中...'}
              </div>
              <div className="text-sm text-orange-800 font-medium">
                最長回答
              </div>
              <Badge variant="secondary" className="mt-2">
                🔥 連続
              </Badge>
            </div>
          </div>

          {/* 詳細データ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                📊 詳細データ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">総ゲーム数:</span>
                  <span className="font-medium">{stats.totalGames.toLocaleString()} ゲーム</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">平均回答数/ゲーム:</span>
                  <span className="font-medium">{stats.averageAnswersPerGame.toFixed(1)} 回</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">サービス開始:</span>
                  <span className="font-medium">{formatServiceDate(stats.serviceStartDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">データ更新間隔:</span>
                  <span className="font-medium">3時間ごと</span>
                </div>
              </div>
              
              {stats.error && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    ⚠️ 一部のデータ取得でエラーが発生しました: {stats.error}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 初回表示の場合のメッセージ */}
          {stats.totalGames === 0 && (
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="text-blue-600 mb-2">🎮</div>
              <p className="text-blue-800 font-medium">
                まだゲームデータがありません
              </p>
              <p className="text-blue-600 text-sm mt-1">
                ゲームをプレイして統計を蓄積しましょう！
              </p>
            </div>
          )}

          {/* 閉じるボタン */}
          <div className="flex justify-center pt-4">
            <Button onClick={onClose} variant="outline" className="px-8">
              閉じる
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
