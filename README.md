# ポケモンしりとりゲーム

ポケモンの名前を使ったしりとりゲームです。Next.jsとTypeScriptで構築されています。

## プロジェクト情報

- **デプロイ先**: GitHub Pages
- **公開URL**: https://nyama.github.io/pokeshiri-game/
- **CI/CD**: GitHub Actions（自動デプロイ、統計データ3時間ごと更新）
- **フレームワーク**: Next.js 14 (App Router)
- **UI**: Material Design風、Bootstrap対応

## 概要

このゲームは、ポケモンの名前を使ってしりとりを楽しむWebアプリケーションです。プレイヤーは順番にポケモンの名前を入力し、前のポケモン名の最後の文字で始まるポケモン名を答えます。

## ゲームルール

### 基本ルール
1. **しりとり**: 前のポケモンの最後の文字で始まるポケモン名を入力
2. **ゴール**: ランダムに選ばれたゴールポケモンを目指す
3. **重複禁止**: 一度使ったポケモンは再使用不可
4. **制限ポケモン**: フォルム違いなど一部のポケモンは使用不可

### スコアシステム
- **基本点**: 正解1つにつき1ポイント
- **タイプコンボ**: 前のポケモンとタイプが一致すると連続コンボでボーナス点
  - コンボ数に応じて追加ポイント（1コンボ目+2pt、2コンボ目+3pt...）
- **ゴールボーナス**: ゴール到達時に+10ポイント
- **パスペナルティ**: パス使用時に-2ポイント

### ゲーム機能
- **パス**: 3回まで使用可能（-2ポイント、次の文字をランダム変更）
- **ヒント**: ゴールポケモンの一部を表示（使用すると記録に残る）
- **プログレス**: 図鑑登録数に応じた達成度表示

## 機能

- ポケモン名によるしりとりゲーム
- スコア表示
- ゲーム履歴の表示
- レスポンシブデザイン
- PWA対応

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS + Bootstrap対応
- **UIコンポーネント**: shadcn/ui (Material Design風)
- **PWA**: Service Worker
- **デプロイ**: GitHub Pages
- **CI/CD**: GitHub Actions

## セットアップ

### 必要な環境

- Node.js 18以上
- npm または pnpm

### インストール

```bash
# 依存関係のインストール
npm install
# または
pnpm install
```

### 開発サーバーの起動

```bash
npm run dev
# または
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認できます。

## 開発ガイドライン

### デザイン
- **UIフレームワーク**: Material Design風のデザインを採用
- **CSSフレームワーク**: Bootstrap使用時はBootstrapクラスを優先
- **レスポンシブ**: モバイルファーストでデザイン

### JavaScript
- **TypeScript**: 型安全性を重視
- **コンポーネント**: React関数コンポーネントを使用

### デプロイメント
- **自動デプロイ**: mainブランチへのpushで自動的にGitHub Pagesにデプロイ
- **統計データ**: GitHub Actionsで3時間ごとに自動更新（stats.jsonは.gitignoreで除外）

## ビルド

```bash
npm run build
# または
pnpm build
```

## プロジェクト構造

```
├── app/                    # Next.js App Router
├── components/             # Reactコンポーネント
│   ├── ui/                # UIコンポーネント
│   └── ...                # ゲーム関連コンポーネント
├── lib/                   # ユーティリティとデータ
├── public/                # 静的ファイル
└── styles/                # スタイルファイル
```

## ライセンス

MIT License