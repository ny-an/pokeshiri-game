# タイムアタックモード実装履歴

## 概要
ポケしりゲームにタイムアタック（TA）モードを実装し、Google Analytics統計機能を強化した開発履歴をまとめる。

## 実装日時
2025年10月2日

## 実装内容

### 1. タイムアタックモードの基本実装

#### 1.1 型定義の追加
- **ファイル**: `lib/types.ts`
- **追加内容**: 
  ```typescript
  export type GameMode = "single" | "timeattack"
  ```

#### 1.2 定数の追加
- **ファイル**: `lib/constants.ts`
- **追加内容**:
  ```typescript
  export const HIGH_SCORE_TA_KEY = "pokemon-shiritori-high-score-ta"
  ```

#### 1.3 ゲームユーティリティ関数の更新
- **ファイル**: `lib/game-utils.ts`
- **主な変更**:
  - `saveHighScore()`, `loadHighScore()` にゲームモード対応
  - GA追跡関数に `game_mode` パラメータ追加
  - `trackPokemonAnswer()` に `pokemon_name` パラメータ追加

### 2. UIコンポーネントの実装

#### 2.1 ゲームヘッダーの更新
- **ファイル**: `components/game-header.tsx`
- **追加機能**: `[シングル] [TA]` モード選択UI

#### 2.2 チェーン表示の更新
- **ファイル**: `components/chain-display.tsx`
- **追加機能**: タイマー表示（残り10秒で赤色点滅）

#### 2.3 スコア表示の更新
- **ファイル**: `components/score-display.tsx`
- **追加機能**: タイムアタック時の "(TA)" 表示

#### 2.4 モード切り替え確認モーダル
- **ファイル**: `components/mode-confirm-modal.tsx`
- **新規作成**: モード変更時の確認ダイアログ
- **メッセージ**:
  - シングル: "現在のゲームをリセットしてシングルモードを開始します。よろしいですか？"
  - TA: "60秒間のタイムアタックにチャレンジします。よろしいですか？"

#### 2.5 結果モーダルの更新
- **ファイル**: `components/result-modal.tsx`
- **追加機能**:
  - タイムアタック専用タイトル表示
  - 残り時間 / タイムアップ表示
  - タイムアタックモード明記

### 3. メインゲームロジックの実装

#### 3.1 状態管理の追加
- **ファイル**: `components/pokemon-shiritori-game.tsx`
- **新規状態**:
  ```typescript
  const [gameMode, setGameMode] = useState<GameMode>("single")
  const [timeLeft, setTimeLeft] = useState(60)
  const [isTimeUp, setIsTimeUp] = useState(false)
  const [showModeConfirm, setShowModeConfirm] = useState(false)
  const [targetMode, setTargetMode] = useState<GameMode>("single")
  ```

#### 3.2 タイマー機能
- 60秒カウントダウン
- 時間切れで強制ゲーム終了
- 残り時間×1ptのボーナススコア

#### 3.3 モード切り替え機能
- 確認モーダル付きの安全な切り替え
- ゲームリセット機能
- ハイスコア分離管理

### 4. Google Analytics統計機能の強化

#### 4.1 カスタムパラメータの追加
既存のイベント送信に以下のパラメータを追加：
- `score`: 最終スコア
- `chain_length`: つないだポケモン数
- `game_mode`: ゲームモード（single/timeattack）
- `pokemon_name`: 回答されたポケモン名

#### 4.2 GA4設定要件
以下のカスタムディメンション・指標の設定が必要：

**カスタムディメンション**:
- `Game Mode` (パラメータ: `game_mode`)
- `Pokemon Name` (パラメータ: `pokemon_name`)

**カスタム指標**:
- `Score` (パラメータ: `score`)
- `Chain Length` (パラメータ: `chain_length`)

#### 4.3 統計取得スクリプトの更新
- **ファイル**: `scripts/fetch-analytics.js`
- **主な変更**:
  - ディメンションと指標の正しい分離
  - モード別最高スコア・最長チェーンの取得
  - `metricAggregations: ['MAXIMUM']` で最大値取得
  - エラーハンドリングの強化

#### 4.4 stats.json構造の更新
```json
{
  "maxScore": 0,        // シングル最高スコア
  "maxScoreTA": 0,      // TA最高スコア
  "maxChainLength": 0,  // シングル最長チェーン
  "maxChainLengthTA": 0 // TA最長チェーン
}
```

#### 4.5 統計モーダルの更新
- **ファイル**: `components/stats-modal.tsx`
- **追加機能**:
  - モード別最高記録の表示（2x2グリッド）
  - 自分の記録との比較
  - "🏆 あなたの記録です" 表示

### 5. ドキュメントの更新

#### 5.1 README.md
- **追加セクション**:
  - ゲームモードの説明
  - GA統計項目の詳細
  - カスタムディメンション・指標の説明
  - 実装済み・未実装項目の整理

## 技術的な課題と解決策

### 課題1: カスタムディメンション vs カスタムパラメータの混同
**問題**: GAスクリプトで `score` と `chain_length` をディメンションとして扱っていた
**解決**: ディメンション（分類用）と指標（数値用）を正しく分離

### 課題2: モード別統計の取得
**問題**: 既存のGA設定では基本的なイベント数しか取得できていなかった
**解決**: カスタムディメンション・指標を活用したモード別クエリを実装

### 課題3: ハイスコア管理の分離
**問題**: シングルとタイムアタックで同じハイスコアを使用していた
**解決**: 別々のlocalStorageキーで管理し、統計表示も分離

## 動作確認項目

### 基本機能
- [ ] シングルモードの正常動作
- [ ] タイムアタックモードの正常動作（60秒制限）
- [ ] モード切り替え確認モーダルの表示
- [ ] タイマー表示（残り10秒で赤色点滅）
- [ ] 残り時間ボーナスの計算

### GA統計機能
- [ ] カスタムパラメータの送信確認
- [ ] モード別統計の取得確認
- [ ] 統計モーダルでの正しい表示
- [ ] 自分の記録との比較表示

### エラーハンドリング
- [ ] カスタムディメンション未設定時の0固定値表示
- [ ] GA API エラー時のデフォルトデータ出力
- [ ] タイマー関連のメモリリーク防止

## 今後の改善案

1. **追加統計項目**
   - モード別のクリア率
   - 平均プレイ時間
   - 人気ポケモンランキング

2. **UI/UX改善**
   - タイムアタック専用のビジュアルエフェクト
   - 残り時間警告音
   - モード別のテーマカラー

3. **パフォーマンス最適化**
   - GA統計取得の並列化
   - キャッシュ機能の追加

## 関連ファイル一覧

### 新規作成ファイル
- `components/mode-confirm-modal.tsx`
- `docs/development/timeattack-mode-implementation.md`

### 主要更新ファイル
- `lib/types.ts`
- `lib/constants.ts`
- `lib/game-utils.ts`
- `components/pokemon-shiritori-game.tsx`
- `components/game-header.tsx`
- `components/chain-display.tsx`
- `components/score-display.tsx`
- `components/result-modal.tsx`
- `components/stats-modal.tsx`
- `scripts/fetch-analytics.js`
- `README.md`

## 実装者
開発チーム

## 承認者
プロジェクトオーナー

---

**注意**: この実装にはGoogle Analytics 4でのカスタムディメンション・指標の手動設定が必要です。設定方法については README.md の「GAカスタムパラメータ設定方法」セクションを参照してください。
