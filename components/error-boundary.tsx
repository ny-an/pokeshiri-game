"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card } from '../components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // エラーが発生したときにstateを更新
    console.error('🚨 ErrorBoundary caught an error:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // エラーログを出力
    console.error('🚨 ErrorBoundary componentDidCatch:', error, errorInfo)
    
    // より詳細なエラー情報をログに記録
    console.group('🔍 詳細エラー情報')
    console.error('Error:', error)
    console.error('Error Stack:', error.stack)
    console.error('Component Stack:', errorInfo.componentStack)
    console.groupEnd()

    // ユーザー用の簡単な情報も出力
    console.log('💡 ユーザー向け情報: アプリケーションでエラーが発生しました')
    console.log('📋 対処法:')
    console.log('1. ブラウザをリロードしてください')
    console.log('2. それでも解決しない場合は、シークレットモードまたは他のブラウザで試してください')
    console.log('3. 問題が継続する場合は、開発者にお知らせください')
  }

  render() {
    if (this.state.hasError) {
      // カスタムフォールバックUIがある場合はそれを使用
      if (this.props.fallback) {
        return this.props.fallback
      }

      // デフォルトのエラーUI
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              🚨 アプリケーションエラーが発生しました
            </h2>
            <p className="text-gray-600 mb-4">
              予期しないエラーが発生しました。ブラウザをリロードして再試行してください。
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>💡 解決方法：</p>
              <p><strong>📱 スマホの場合：</strong></p>
              <p>1. ページを下に引っ張ってリロード</p>
              <p>2. アドレスバーをタップ→更新</p>
              <p>3. ブラウザの更新ボタンをタップ</p>
              <p><strong>💻 PCの場合：</strong></p>
              <p>1. ページをリロード（F5キーまたはCtrl+R）</p>
              <p>2. それでも解決しない場合は、シークレットモードで試してください</p>
              <p>3. 他のブラウザでも動作を確認してください</p>
            </div>
            <button 
              onClick={() => {
                try {
                  window.location.reload()
                } catch (error) {
                  console.error('リロード失敗、別の方法でリロード:', error)
                  // モバイル環境などでの代替手段
                  window.location.href = window.location.href
                }
              }}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 active:bg-blue-700"
            >
              📱 ページを再読み込み
            </button>
            <details className="mt-4 text-left">
              <summary className="text-sm text-gray-400 cursor-pointer">
                技術詳細（開発者向け）
              </summary>
              <pre className="mt-2 text-xs text-gray-500 bg-gray-100 p-2 rounded overflow-auto">
                {this.state.error?.toString()}
                {'\n\n'}
                {this.state.error?.stack}
              </pre>
            </details>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
