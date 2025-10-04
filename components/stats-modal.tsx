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
  mostUsedPokemon?: string // 最も使われているポケモン名
  mostUsedPokemonCount?: number // 最も使われているポケモンの使用回数
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
              ゲーム統計
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
            ゲーム統計
          </DialogTitle>
          <DialogDescription>
            最終更新: {formatDate(stats.lastUpdated)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 p-1">
          {/* 自分の記録 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                あなたの記録
              </CardTitle>
              <CardDescription>
                あなたの個人統計データ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {personalStats && personalStats.totalGamesPlayed > 0 ? (
                <>
                  {/* 個人統計メイン - 1行2項目表示 */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* 個人クリア数 */}
                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                      <div className="text-xl font-bold text-emerald-600">
                        {personalStats.totalGameClears.toLocaleString()}
                      </div>
                      <div className="text-xs text-emerald-800 font-medium">
                        クリア数
                      </div>
                    </div>

                    {/* 総回答数 */}
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">
                        {personalStats.totalAnswers.toLocaleString()}
                      </div>
                      <div className="text-xs text-blue-800 font-medium">
                        総回答数
                      </div>
                    </div>
                  </div>

                  {/* 個人記録詳細 - 1行2項目表示 */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* シングルモード記録 */}
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">
                        {personalStats.bestSingleScore.toLocaleString()}
                      </div>
                      <div className="text-xs text-blue-800 font-medium">
                        シングル最高得点
                      </div>
                    </div>

                    {/* タイムアタック記録 */}
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <div className="text-lg font-bold text-amber-600">
                        {personalStats.bestTimeattackScore.toLocaleString()}
                      </div>
                      <div className="text-xs text-amber-800 font-medium">
                        TA最高得点
                      </div>
                    </div>

                    {/* シングル最長チェーン */}
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">
                        {personalStats.longestChainSingle}
                      </div>
                      <div className="text-xs text-green-800 font-medium">
                        シングル最長チェーン
                      </div>
                    </div>

                    {/* TA最長チェーン */}
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">
                        {personalStats.longestChainTimeattack}
                      </div>
                      <div className="text-xs text-purple-800 font-medium">
                        TA最長チェーン
                      </div>
                    </div>

                    {/* シングル最高コンボ */}
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">
                        {personalStats.maxComboSingle || 0}
                      </div>
                      <div className="text-xs text-orange-800 font-medium">
                        シングル最高コンボ
                      </div>
                    </div>

                    {/* TA最高コンボ */}
                    <div className="text-center p-3 bg-pink-50 rounded-lg">
                      <div className="text-lg font-bold text-pink-600">
                        {personalStats.maxComboTimeattack || 0}
                      </div>
                      <div className="text-xs text-pink-800 font-medium">
                        TA最高コンボ
                      </div>
                    </div>
                  </div>

                  {/* 個人統計詳細 - 縦表示に変更 */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-base font-bold text-gray-700">
                        {personalStats.totalGamesPlayed.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">
                        遊んだゲーム数
                      </div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-base font-bold text-gray-700">
                        {personalStats.averageAnswersPerGame.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-600">
                        平均回答数
                      </div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="text-base font-bold text-blue-700">
                        {personalStats.singleModeGames.toLocaleString()}
                      </div>
                      <div className="text-xs text-blue-600">
                        シングル
                      </div>
                    </div>
                    <div className="text-center p-2 bg-amber-50 rounded">
                      <div className="text-base font-bold text-amber-700">
                        {personalStats.timeattackModeGames.toLocaleString()}
                      </div>
                      <div className="text-xs text-amber-600">
                        タイムアタック
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <div className="text-blue-600 mb-2">🎮</div>
                  <p className="text-blue-800 font-medium">
                    まだ記録がありません
                  </p>
                  <p className="text-blue-600 text-sm mt-1">
                    プレイすると作成されます
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 🌍 全体統計 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                みんなの記録
              </CardTitle>
              <CardDescription>
                全プレイヤーの統計データ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* メイン統計 - 1行2項目表示 */}
              <div className="grid grid-cols-2 gap-3">
                {/* 総回答数 */}
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">
                    {stats.totalPokemonAnswers.toLocaleString()}
                  </div>
                  <div className="text-xs text-blue-800 font-medium">
                    総回答数
                  </div>
                </div>

                {/* クリア数 */}
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">
                    {stats.totalGameClears.toLocaleString()}
                  </div>
                  <div className="text-xs text-green-800 font-medium">
                    クリア数
                  </div>
                </div>

                {/* ゲームオーバー数 */}
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className="text-xl font-bold text-red-600">
                    {stats.totalGameOvers.toLocaleString()}
                  </div>
                  <div className="text-xs text-red-800 font-medium">
                    オーバー数
                  </div>
                </div>

                {/* 成功率 */}
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">
                    {stats.clearRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-purple-800 font-medium">
                    成功率
                  </div>
                </div>
              </div>

              {/* 累計データ詳細 - 1行2項目表示 */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-base font-bold text-gray-700">
                    {stats.totalGames.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">
                    総ゲーム数
                  </div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-base font-bold text-gray-700">
                    {stats.averageAnswersPerGame.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-600">
                    平均回答数
                  </div>
                </div>
              </div>

              {/* 最も使われているポケモン */}
              {stats.mostUsedPokemon && stats.mostUsedPokemonCount && (
                <div className="text-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="text-lg font-bold text-yellow-700 mb-1">
                    🏆 {stats.mostUsedPokemon}
                  </div>
                  <div className="text-sm text-yellow-600 font-medium">
                    最も使われているポケモン ({stats.mostUsedPokemonCount}回使用)
                  </div>
                </div>
              )}
              
              {stats.error && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm font-medium mb-2">
                    ⚠️ 記録統計の取得でエラーが発生しました
                  </p>
                  <p className="text-yellow-700 text-xs">
                    Google Analytics 4のカスタムディメンション・指標が未設定の可能性があります。
                    詳細は開発者にお問い合わせください。
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 記録統計 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                世界最高記録
              </CardTitle>
              <CardDescription>
                全プレイヤーの最高記録
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
            {/* シングルモード最高得点 */}
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {stats.maxScore > 0 ? stats.maxScore.toLocaleString() : (stats.error ? '設定未完了' : '記録なし')}
              </div>
              <div className="text-xs text-blue-800 font-medium">
                シングル最高得点
              </div>
              {myHighScoreSingle > 0 && myHighScoreSingle >= stats.maxScore && (
                <div className="text-xs text-blue-600 mt-1">🏆 あなたの記録</div>
              )}
            </div>

            {/* タイムアタック最高得点 */}
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg font-bold text-yellow-600">
                {stats.maxScoreTA > 0 ? stats.maxScoreTA.toLocaleString() : (stats.error ? '設定未完了' : '記録なし')}
              </div>
              <div className="text-xs text-yellow-800 font-medium">
                TA最高得点
              </div>
              {myHighScoreTimeattack > 0 && myHighScoreTimeattack >= stats.maxScoreTA && (
                <div className="text-xs text-yellow-600 mt-1">🏆 あなたの記録</div>
              )}
            </div>

            {/* 最長回答（シングル） */}
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-lg font-bold text-orange-600">
                {stats.maxChainLength > 0 ? stats.maxChainLength : (stats.error ? '設定未完了' : '記録なし')}
              </div>
              <div className="text-xs text-orange-800 font-medium">
                シングル最長チェーン
              </div>
            </div>

            {/* 最長回答（タイムアタック） */}
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                {stats.maxChainLengthTA > 0 ? stats.maxChainLengthTA : (stats.error ? '設定未完了' : '記録なし')}
              </div>
              <div className="text-xs text-purple-800 font-medium">
                TA最長チェーン
              </div>
                  </div>
                </div>
                
                {/* 記録統計のエラーメッセージ */}
                {stats.error && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-orange-800 text-sm font-medium mb-1">
                      📊 記録統計について
                    </p>
                    <p className="text-orange-700 text-xs">
                      現在、Google Analytics 4の設定が未完了のため、全プレイヤーの最高記録を表示できません。
                      個人記録は正常に表示されています。
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
