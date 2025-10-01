# ポケモンしりとりゲーム

ポケモンの名前を使ったしりとりゲームです。Next.jsとTypeScriptで構築されています。

## 概要

このゲームは、ポケモンの名前を使ってしりとりを楽しむWebアプリケーションです。プレイヤーは順番にポケモンの名前を入力し、前のポケモン名の最後の文字で始まるポケモン名を答えます。

## 機能

- ポケモン名によるしりとりゲーム
- スコア表示
- ゲーム履歴の表示
- レスポンシブデザイン
- PWA対応

## 技術スタック

- **フレームワーク**: Next.js 14
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **UIコンポーネント**: shadcn/ui
- **PWA**: Service Worker

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