"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RefreshCw, Download, AlertCircle } from "lucide-react"
import { 
  CURRENT_VERSION, 
  fetchLatestVersion, 
  isNewerVersion, 
  shouldCheckVersion, 
  saveLastVersionCheck 
} from "@/lib/version-utils"

interface VersionCheckerProps {
  onUpdateAvailable?: (newVersion: string) => void
}

export function VersionChecker({ onUpdateAvailable }: VersionCheckerProps) {
  const [showUpdateModal, setShowUpdateModal] = useState(false)
  const [latestVersion, setLatestVersion] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkForUpdates = async () => {
    setIsChecking(true)
    setError(null)
    
    try {
      const version = await fetchLatestVersion()
      setLatestVersion(version)
      
      // バージョン比較
      if (isNewerVersion(CURRENT_VERSION, version)) {
        setShowUpdateModal(true)
        onUpdateAvailable?.(version)
      }
      
    } catch (err) {
      console.error('バージョンチェックエラー:', err)
      setError(err instanceof Error ? err.message : 'バージョンチェックに失敗しました')
    } finally {
      setIsChecking(false)
    }
  }

  // コンポーネントマウント時に自動チェック
  useEffect(() => {
    // 前回チェックから24時間経過していない場合はスキップ
    if (!shouldCheckVersion(24)) {
      return
    }

    // 初回チェックは少し遅延させる（ゲーム読み込み完了後）
    const timer = setTimeout(() => {
      checkForUpdates()
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [])

  const handleRefresh = () => {
    // 現在のURLパラメータを保持してリフレッシュ
    const currentUrl = new URL(window.location.href)
    const searchParams = currentUrl.searchParams
    
    // Service Workerのキャッシュをクリア
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.update()
        })
      })
    }
    
    // ページをリロード（キャッシュをクリア）
    window.location.href = `${window.location.pathname}?${searchParams.toString()}&_t=${Date.now()}`
  }

  const handleDismiss = () => {
    setShowUpdateModal(false)
    // 今日はもうチェックしない（24時間後まで）
    saveLastVersionCheck()
  }

  return (
    <>
      <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-500" />
              アップデートが利用可能です
            </DialogTitle>
            <DialogDescription className="text-left space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <strong>現在:</strong> v{CURRENT_VERSION}
                </div>
                <div>
                  <strong>最新:</strong> v{latestVersion}
                </div>
              </div>
              
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  最新の機能と修正を利用するために、ページを更新することをお勧めします。
                  現在の問題設定（スタート・ゴールポケモン）は保持されます。
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="w-full sm:w-auto"
            >
              後で更新
            </Button>
            <Button
              onClick={handleRefresh}
              className="w-full sm:w-auto flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              今すぐ更新
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* デバッグ用：手動チェックボタン（開発時のみ表示） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            variant="outline"
            size="sm"
            onClick={checkForUpdates}
            disabled={isChecking}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'チェック中...' : 'バージョンチェック'}
          </Button>
          {error && (
            <div className="mt-2 p-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded max-w-xs">
              {error}
            </div>
          )}
          {latestVersion && (
            <div className="mt-1 p-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
              最新: v{latestVersion}
            </div>
          )}
        </div>
      )}
    </>
  )
}
