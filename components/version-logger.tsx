'use client'

import { useEffect } from 'react'
import { getCurrentVersion } from '@/lib/version-utils'

/**
 * バージョン情報をコンソールに出力するコンポーネント
 */
export function VersionLogger() {
  useEffect(() => {
    // バージョン情報をコンソールに出力（タイマーで少し遅延させてStrict Mode対策）
    const timer = setTimeout(async () => {
      try {
        const version = await getCurrentVersion()
        console.log(`🎮 ポケモンしりとりゲーム v${version}`)
        console.log('🚀 アプリケーションが正常に起動しました')
      } catch (error) {
        console.error('バージョン情報の取得に失敗しました:', error)
      }
    }, 100) // 100ms遅延

    return () => clearTimeout(timer)
  }, [])

  // このコンポーネントは何も描画しない
  return null
}
