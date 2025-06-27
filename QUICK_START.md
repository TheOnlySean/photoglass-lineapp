# 写真眼鏡 クイックスタートガイド

## 1. 環境設定

### 前提条件
- Node.js 18.0以上
- npm または yarn
- LINE開発者アカウント

### プロジェクトセットアップ
```bash
# 依存関係のインストール
npm install

# 環境変数ファイルの作成
cp docs/ENVIRONMENT_CONFIG.md .env.local
```

### 環境変数の設定
`.env.local` ファイルを作成し、以下の内容を追加：

```bash
# LINE Mini App - 開発環境
NEXT_PUBLIC_LIFF_ID=2007656353-xnDmN9Er
NEXT_PUBLIC_CHANNEL_ID=2007656353
CHANNEL_SECRET=abbd89a5c812b3a78906b6bb4ae5f95f

# Feature Flags
ENABLE_PREMIUM_FEATURES=false
ENABLE_TTS=true

# API Rate Limits
FREE_TIER_RATE_LIMIT=10
PREMIUM_TIER_RATE_LIMIT=50
```

## 2. 開発サーバーの起動

```bash
# 開発サーバーを起動
npm run dev
```

アプリケーションは http://localhost:3000 で起動します。

## 3. LINE Mini Appでのテスト

### 開発環境でのテスト方法

1. **LIFF URLを使用**
   - 開発環境URL: https://miniapp.line.me/2007656353-xnDmN9Er
   - LINE アプリでこのURLを開く

2. **ローカル開発サーバーとの連携**
   - ngrokなどのトンネリングツールを使用してローカルサーバーを公開
   - LINE Developers ConsoleでEndpoint URLを更新

### ngrokを使用した開発環境設定

```bash
# ngrokのインストール（初回のみ）
npm install -g ngrok

# ローカルサーバーを公開
ngrok http 3000
```

生成されたHTTPS URLをLINE Developers ConsoleのLIFF設定で使用してください。

## 4. 機能テスト

### 基本機能の確認
1. LIFF初期化の確認
2. ユーザープロフィール取得
3. シェア機能のテスト
4. アプリ終了機能

### デバッグ方法
```bash
# リンターの実行
npm run lint

# フォーマッターの実行
npm run format

# テストの実行
npm test
```

## 5. トラブルシューティング

### よくある問題

1. **LIFF初期化エラー**
   - LIFF IDが正しく設定されているか確認
   - 環境変数が正しく読み込まれているか確認

2. **ユーザープロフィール取得エラー**
   - LINEアプリ内でアクセスしているか確認
   - 適切な権限が設定されているか確認

3. **シェア機能エラー**
   - LINEアプリ内でのみ動作することを確認
   - メッセージ形式が正しいか確認

### ログの確認
```bash
# 開発サーバーのログを確認
npm run dev

# ブラウザの開発者ツールでコンソールログを確認
```

## 6. 次のステップ

基本設定が完了したら、以下の機能実装に進んでください：

1. **カメラ機能の実装**
2. **AI画像解析の統合**
3. **TTS機能の実装**
4. **データベース連携**
5. **プレミアム機能の実装**

詳細な実装ガイドは `docs/` ディレクトリの各ドキュメントを参照してください。 