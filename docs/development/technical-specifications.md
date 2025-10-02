# ポケしりゲーム 技術仕様書

## システム概要

### プロジェクト情報
- **プロジェクト名**: ポケモンしりとりゲーム（ポケしり）
- **バージョン**: v2.0（タイムアタックモード対応）
- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **デプロイ先**: GitHub Pages
- **公開URL**: https://nyama.github.io/pokeshiri-game/

### アーキテクチャ
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   GitHub        │    │   Google        │
│   (Next.js)     │    │   Actions       │    │   Analytics     │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Game Logic  │ │    │ │ Auto Deploy │ │    │ │ Event       │ │
│ │ UI/UX       │ │    │ │ Stats Update│ │    │ │ Tracking    │ │
│ │ PWA         │ │    │ │ (3h cycle)  │ │    │ │ Analytics   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   stats.json    │
                    │   (Public)      │
                    └─────────────────┘
```

## ゲーム仕様

### ゲームモード

#### シングルモード
- **制限時間**: なし
- **目標**: スタートポケモンからゴールポケモンまでしりとりでつなぐ
- **ハイスコア**: `localStorage` の `pokemon-shiritori-high-score` に保存

#### タイムアタック（TA）モード
- **制限時間**: 60秒
- **目標**: 制限時間内にゴールポケモンに到達
- **ボーナス**: 残り時間×1pt
- **ハイスコア**: `localStorage` の `pokemon-shiritori-high-score-ta` に保存

### スコアシステム
- **基本点**: 正解1つにつき1pt
- **タイプコンボ**: 前のポケモンとタイプが一致すると連続コンボ
  - コンボ数に応じて追加pt（1コンボ目+2pt、2コンボ目+3pt...）
- **ゴールボーナス**: ゴール到達時に+10pt
- **時間ボーナス**: TAモードで残り時間×1pt
- **ペナルティ**: 
  - パス使用: -2pt
  - 重複使用: -5pt
  - ヒント使用: -1pt

### ゲーム機能
- **パス**: 3回まで使用可能（次の文字をランダム変更）
- **ヒント**: 候補ポケモンを1つ表示
- **自動チェンジ**: 「ン」で終わる場合、自動的にランダム文字に変更
- **プログレス**: 図鑑登録数に応じた達成度表示

## 技術仕様

### フロントエンド

#### 技術スタック
- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: shadcn/ui (Material Design風)
- **状態管理**: React Hooks (useState, useEffect, useRef)
- **PWA**: Service Worker対応

#### ディレクトリ構成
```
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── globals.css        # グローバルスタイル
│   ├── layout.tsx         # ルートレイアウト
│   └── page.tsx           # メインページ
├── components/            # Reactコンポーネント
│   ├── ui/               # UIコンポーネント（shadcn/ui）
│   ├── pokemon-shiritori-game.tsx  # メインゲーム
│   ├── game-header.tsx    # ゲームヘッダー
│   ├── score-display.tsx  # スコア表示
│   ├── chain-display.tsx  # チェーン表示
│   ├── game-input.tsx     # 入力フォーム
│   ├── result-modal.tsx   # 結果モーダル
│   ├── stats-modal.tsx    # 統計モーダル
│   └── mode-confirm-modal.tsx  # モード確認モーダル
├── lib/                   # ユーティリティとデータ
│   ├── types.ts          # 型定義
│   ├── constants.ts      # 定数
│   ├── game-utils.ts     # ゲームロジック
│   ├── pokemon-data.ts   # ポケモンデータ処理
│   └── utils.ts          # 汎用ユーティリティ
├── public/               # 静的ファイル
│   ├── data/
│   │   └── pokemon-list.csv  # ポケモンデータ
│   ├── stats.json        # 統計データ（自動生成）
│   └── manifest.json     # PWAマニフェスト
└── scripts/              # ビルドスクリプト
    └── fetch-analytics.js  # GA統計取得
```

#### 主要コンポーネント

##### PokemonShiritoriGame（メインコンポーネント）
```typescript
interface GameState {
  gameMode: GameMode           // ゲームモード
  gameState: GameState         // ゲーム状態
  timeLeft: number            // 残り時間（TAモード）
  isTimeUp: boolean           // 時間切れフラグ
  score: number               // 現在スコア
  highScore: number           // ハイスコア
  chain: ChainItem[]          // しりとりチェーン
  // ... その他の状態
}
```

##### 型定義
```typescript
export type GameMode = "single" | "timeattack"
export type GameState = "playing" | "finished" | "cleared"

export type ChainItem =
  | { type: "pokemon"; pokemon: Pokemon; points: number }
  | { type: "pass"; fromChar: string; toChar: string; points: number }
  | { type: "duplicate"; pokemon: Pokemon; points: number }
  | { type: "hint"; pokemon: Pokemon; points: number }
```

### バックエンド・インフラ

#### GitHub Actions
- **自動デプロイ**: mainブランチへのpushで自動的にGitHub Pagesにデプロイ
- **統計更新**: 3時間ごとにGA統計を取得してstats.jsonを更新

#### Google Analytics 4 統合

##### 送信イベント
```javascript
// ポケモン回答時
gtag('event', 'pokemon_answer', {
  pokemon_name: string  // 回答されたポケモン名
})

// ゲームクリア時
gtag('event', 'game_clear', {
  score: number,        // 最終スコア
  chain_length: number, // つないだポケモン数
  game_mode: string     // ゲームモード
})

// ゲームオーバー時
gtag('event', 'game_over', {
  score: number,        // 最終スコア
  chain_length: number, // つないだポケモン数
  game_mode: string     // ゲームモード
})
```

##### 必要なGA4設定
**カスタムディメンション**:
- Game Mode (`game_mode`)
- Pokemon Name (`pokemon_name`)

**カスタム指標**:
- Score (`score`)
- Chain Length (`chain_length`)

##### 統計データ構造
```json
{
  "totalPokemonAnswers": number,    // 総回答数
  "totalGameClears": number,        // 総クリア数
  "totalGameOvers": number,         // 総ゲームオーバー数
  "totalGames": number,             // 総ゲーム数
  "clearRate": number,              // クリア率（%）
  "averageAnswersPerGame": number,  // 平均回答数/ゲーム
  "maxScore": number,               // シングル最高スコア
  "maxScoreTA": number,             // TA最高スコア
  "maxChainLength": number,         // シングル最長チェーン
  "maxChainLengthTA": number,       // TA最長チェーン
  "serviceStartDate": string,       // サービス開始日
  "lastUpdated": string,            // 最終更新日時
  "error": string                   // エラーメッセージ（任意）
}
```

### データ管理

#### ローカルストレージ
```typescript
// ハイスコア
"pokemon-shiritori-high-score"     // シングルモード
"pokemon-shiritori-high-score-ta"  // タイムアタックモード

// ポケモン履歴
"pokemon-shiritori-history"        // { [name: string]: number }

// 進捗マイルストーン
"pokemon-shiritori-last-shown-milestone"  // number
```

#### ポケモンデータ
- **ソース**: `public/data/pokemon-list.csv`
- **形式**: CSV（名前,タイプ1,タイプ2,図鑑番号）
- **処理**: クライアントサイドで動的読み込み・パース

### セキュリティ・パフォーマンス

#### セキュリティ対策
- **CSP**: Content Security Policy設定
- **HTTPS**: GitHub Pages強制HTTPS
- **環境変数**: GA認証情報の適切な管理

#### パフォーマンス最適化
- **静的生成**: Next.js Static Export
- **コード分割**: 動的import使用
- **画像最適化**: Next.js Image Optimization
- **PWA**: Service Workerによるキャッシュ

### 監視・ログ

#### エラーハンドリング
- **GA API エラー**: デフォルトデータで継続動作
- **ポケモンデータ読み込みエラー**: ローディング状態表示
- **タイマーエラー**: メモリリーク防止

#### ログ出力
```javascript
// 統計取得時
console.log('📊 取得した統計データ:', stats)
console.log('📊 モード別最高記録:', modeStats)

// エラー時
console.error('❌ Analytics API Error:', error)
console.warn('⚠️ カスタムディメンション・指標の取得に失敗')
```

## 開発・運用

### 開発環境
```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 統計データ取得（ローカル）
node scripts/fetch-analytics.js
```

### デプロイメント
1. **自動デプロイ**: mainブランチへのpush
2. **手動デプロイ**: GitHub Actions画面から手動実行
3. **統計更新**: 3時間ごと自動実行

### 監視項目
- [ ] ゲーム動作の正常性
- [ ] 統計データ更新の正常性
- [ ] GA4イベント送信の正常性
- [ ] エラーログの確認
- [ ] パフォーマンス指標

### トラブルシューティング

#### よくある問題
1. **統計データが更新されない**
   - GA4設定の確認
   - GitHub Actions実行ログの確認
   - 認証情報の確認

2. **ゲームが正常に動作しない**
   - ブラウザコンソールエラーの確認
   - ポケモンデータ読み込み状況の確認
   - ローカルストレージの確認

3. **タイマーが正常に動作しない**
   - メモリリークの確認
   - useEffectの依存配列確認
   - コンポーネントアンマウント時の処理確認

## 更新履歴

### v2.1 - 2025年10月2日
#### iPhoneSE対応・モーダル表示改善
**問題**: iPhoneSEサイズの画面でモーダルが操作できない問題
- 画面サイズを超えるモーダルでスクロールできない
- 閉じるボタンが押せない状態になる

**対応内容**:
1. **DialogContentコンポーネント基本修正**
   - `max-h-[calc(100vh-2rem)]` 追加（画面高さ制限）
   - `overflow-y-auto` 追加（スクロール対応）
   - 閉じるボタンに `z-10` 追加（常時操作可能）

2. **全モーダルの個別対応**
   - ルール説明モーダル: `max-h-[90vh]` + sticky header
   - 結果モーダル: `max-h-[90vh] overflow-y-auto`
   - モード確認モーダル: `max-h-[90vh] overflow-y-auto`
   - バージョンチェッカー: `max-h-[90vh] overflow-y-auto`
   - 進捗モーダル: `max-h-[90vh] overflow-y-auto`
   - 開発者情報モーダル: `max-h-[90vh] overflow-y-auto`
   - ポケモン図鑑モーダル: `max-h-[90vh] overflow-y-auto`
   - 統計モーダル: `max-h-[90vh] overflow-y-auto`
   - ゲーム終了確認モーダル: `max-h-[90vh] overflow-y-auto`

3. **技術的改善**
   - JSX構文エラーの修正
   - インデント統一
   - レスポンシブ対応強化

**影響範囲**: 
- `components/ui/dialog.tsx`
- `components/game-header.tsx`
- `components/result-modal.tsx`
- `components/mode-confirm-modal.tsx`
- `components/version-checker.tsx`
- `components/progress-modal.tsx`
- `components/game-input.tsx`
- `components/stats-modal.tsx`

**テスト**: iPhoneSE (375×667px) での動作確認済み

## 今後の拡張予定

### 機能拡張
- [ ] 難易度設定（制限時間変更）
- [ ] マルチプレイヤー対応
- [ ] ランキング機能
- [ ] 実績システム

### 技術改善
- [ ] TypeScript strict mode対応
- [ ] テストカバレッジ向上
- [ ] パフォーマンス最適化
- [x] アクセシビリティ向上（モバイル対応完了）

---

**更新日**: 2025年10月2日  
**バージョン**: 2.1  
**作成者**: 開発チーム
