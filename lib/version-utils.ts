/**
 * バージョン管理ユーティリティ
 */

/**
 * 現在のバージョンを取得する関数
 * version.txtから動的に読み取る
 */
export async function getCurrentVersion(): Promise<string> {
  try {
    const response = await fetch('/version/version.txt', {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
      },
    })
    
    if (!response.ok) {
      throw new Error(`バージョン情報の取得に失敗: ${response.status}`)
    }
    
    const version = await response.text()
    return version.trim()
  } catch (error) {
    console.error('バージョン取得エラー:', error)
    // フォールバック: package.jsonから取得
    return "1.0.1"
  }
}

/**
 * 現在のバージョン（同期版）
 * サーバーサイドで使用
 */
export const CURRENT_VERSION = "1.0.1"

/**
 * バージョン情報ファイルのURL
 */
export const VERSION_URL = process.env.NODE_ENV === 'production' 
  ? "https://ny-an.github.io/pokeshiri-game/version/version.txt"
  : "/version/version.txt"

/**
 * バージョン文字列を比較（セマンティックバージョニング対応）
 * @param version1 比較するバージョン1
 * @param version2 比較するバージョン2
 * @returns version1 > version2 なら 1, version1 < version2 なら -1, 同じなら 0
 */
export function compareVersions(version1: string, version2: string): number {
  const v1Parts = version1.split('.').map(Number)
  const v2Parts = version2.split('.').map(Number)
  
  const maxLength = Math.max(v1Parts.length, v2Parts.length)
  
  for (let i = 0; i < maxLength; i++) {
    const v1Part = v1Parts[i] || 0
    const v2Part = v2Parts[i] || 0
    
    if (v1Part > v2Part) return 1
    if (v1Part < v2Part) return -1
  }
  
  return 0
}

/**
 * 新しいバージョンが利用可能かチェック
 */
export function isNewerVersion(currentVersion: string, latestVersion: string): boolean {
  return compareVersions(latestVersion, currentVersion) > 0
}

/**
 * リモートからバージョン情報を取得
 */
export async function fetchLatestVersion(): Promise<string> {
  try {
    const response = await fetch(VERSION_URL, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache',
      },
    })
    
    if (!response.ok) {
      throw new Error(`バージョン情報の取得に失敗: ${response.status}`)
    }
    
    const version = await response.text()
    return version.trim()
  } catch (error) {
    console.error('バージョンチェックエラー:', error)
    throw error
  }
}

/**
 * バージョンチェックのローカルストレージキー
 */
export const VERSION_CHECK_STORAGE_KEY = "pokeshiri-last-version-check"

/**
 * 最後のバージョンチェック時刻を保存
 */
export function saveLastVersionCheck(): void {
  localStorage.setItem(VERSION_CHECK_STORAGE_KEY, Date.now().toString())
}

/**
 * 前回のバージョンチェックから指定時間経過しているかチェック
 * @param hours チェック間隔（時間）
 */
export function shouldCheckVersion(hours: number = 24): boolean {
  const lastCheck = localStorage.getItem(VERSION_CHECK_STORAGE_KEY)
  if (!lastCheck) return true
  
  const lastCheckTime = parseInt(lastCheck, 10)
  const now = Date.now()
  const hoursSinceLastCheck = (now - lastCheckTime) / (1000 * 60 * 60)
  
  return hoursSinceLastCheck >= hours
}
