'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { loadHighScore, loadPersonalStats } from '@/lib/game-utils'
import type { PersonalStats } from '@/lib/types'

interface GameStats {
  totalPokemonAnswers: number
  totalGameClears: number
  totalGameOvers: number
  totalGames: number
  clearRate: number
  averageAnswersPerGame: number
  maxScore: number // シングルモードの最高スコア（後方互換性）
  maxScoreTA: number // タイムアタックモードの最高スコア
  maxChainLength: number // シングルモードの最長チェーン（後方互換性）
  maxChainLengthTA: number // タイムアタックモードの最長チェーン
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
  const [myHighScoreSingle, setMyHighScoreSingle] = useState(0)
  const [myHighScoreTimeattack, setMyHighScoreTimeattack] = useState(0)
  const [personalStats, setPersonalStats] = useState<PersonalStats | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchStats()
      loadMyHighScores()
      loadMyPersonalStats()
    }
  }, [isOpen])

  const loadMyHighScores = () => {
    setMyHighScoreSingle(loadHighScore("single"))
    setMyHighScoreTimeattack(loadHighScore("timeattack"))
  }

  const loadMyPersonalStats = () => {
    setPersonalStats(loadPersonalStats())
  }

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // GitHub PagesのbasePathを考慮
      const basePath = process.env.NODE_ENV === 'production' ? '/pokeshiri-game' : ''
      const response = await fetch(`${basePath}/stats.json`)
      
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* シングルモード最高得点 */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {stats.maxScore > 0 ? stats.maxScore.toLocaleString() : '記録なし'}
              </div>
              <div className="text-sm text-blue-800 font-medium">
                シングル最高得点
              </div>
              {myHighScoreSingle > 0 && myHighScoreSingle >= stats.maxScore && (
                <Badge variant="default" className="mt-2 bg-blue-600">
                  🏆 あなたの記録です
                </Badge>
              )}
              {(!myHighScoreSingle || myHighScoreSingle < stats.maxScore) && stats.maxScore > 0 && (
                <Badge variant="secondary" className="mt-2">
                  ⭐ 累計記録
                </Badge>
              )}
            </div>

            {/* タイムアタック最高得点 */}
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.maxScoreTA > 0 ? stats.maxScoreTA.toLocaleString() : '記録なし'}
              </div>
              <div className="text-sm text-yellow-800 font-medium">
                TA最高得点
              </div>
              {myHighScoreTimeattack > 0 && myHighScoreTimeattack >= stats.maxScoreTA && (
                <Badge variant="default" className="mt-2 bg-yellow-600">
                  🏆 あなたの記録です
                </Badge>
              )}
              {(!myHighScoreTimeattack || myHighScoreTimeattack < stats.maxScoreTA) && stats.maxScoreTA > 0 && (
                <Badge variant="secondary" className="mt-2">
                  ⚡ 累計記録
                </Badge>
              )}
            </div>

            {/* 最長回答（シングル） */}
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {stats.maxChainLength > 0 ? stats.maxChainLength : '記録なし'}
              </div>
              <div className="text-sm text-orange-800 font-medium">
                シングル最長回答
              </div>
              <Badge variant="secondary" className="mt-2">
                🔥 連続
              </Badge>
            </div>

            {/* 最長回答（タイムアタック） */}
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {stats.maxChainLengthTA > 0 ? stats.maxChainLengthTA : '記録なし'}
              </div>
              <div className="text-sm text-purple-800 font-medium">
                TA最長回答
              </div>
              <Badge variant="secondary" className="mt-2">
                ⚡ 連続
              </Badge>
            </div>
          </div>

          {/* 自分の記録 */}
          {personalStats && personalStats.totalGamesPlayed > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  👤 あなたの記録
                </CardTitle>
                <CardDescription>
                  あなたの個人統計データ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 個人統計メイン */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 個人クリア数 */}
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600">
                      {personalStats.totalGameClears.toLocaleString()}
                    </div>
                    <div className="text-sm text-emerald-800 font-medium">
                      クリア数
                    </div>
                    <Badge variant="secondary" className="mt-2">
                      ✅ 成功
                    </Badge>
                  </div>

                  {/* 総回答数 */}
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {personalStats.totalAnswers.toLocaleString()}
                    </div>
                    <div className="text-sm text-blue-800 font-medium">
                      総回答数
                    </div>
                    <Badge variant="secondary" className="mt-2">
                      🎯 回答
                    </Badge>
                  </div>
                </div>

                {/* 個人記録詳細 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* シングルモード記録 */}
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">
                      {personalStats.bestSingleScore.toLocaleString()} pt
                    </div>
                    <div className="text-sm text-blue-800 font-medium">
                      シングル最高得点
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      最長: {personalStats.longestChainSingle} 回答
                    </div>
                  </div>

                  {/* タイムアタック記録 */}
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <div className="text-xl font-bold text-amber-600">
                      {personalStats.bestTimeattackScore.toLocaleString()} pt
                    </div>
                    <div className="text-sm text-amber-800 font-medium">
                      TA最高得点
                    </div>
                    <div className="text-xs text-amber-600 mt-1">
                      最長: {personalStats.longestChainTimeattack} 回答
                    </div>
                  </div>
                </div>

                {/* 個人統計詳細 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">遊んだゲーム数:</span>
                    <span className="font-medium">{personalStats.totalGamesPlayed.toLocaleString()} ゲーム</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">平均回答数/ゲーム:</span>
                    <span className="font-medium">{personalStats.averageAnswersPerGame.toFixed(1)} 回</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">シングルモード:</span>
                    <span className="font-medium">{personalStats.singleModeGames.toLocaleString()} ゲーム</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">タイムアタック:</span>
                    <span className="font-medium">{personalStats.timeattackModeGames.toLocaleString()} ゲーム</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 詳細データ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                📊 詳細データ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
