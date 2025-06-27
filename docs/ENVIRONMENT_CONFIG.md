# 環境設定ガイド

## LINE Mini App 環境別設定

### 開発環境 (Developing)
```
NEXT_PUBLIC_LIFF_ID=2007656353-xnDmN9Er
NEXT_PUBLIC_CHANNEL_ID=2007656353
CHANNEL_SECRET=abbd89a5c812b3a78906b6bb4ae5f95f
```

### レビュー環境 (Review)
```
NEXT_PUBLIC_LIFF_ID=2007656354-jRyWPm4L
NEXT_PUBLIC_CHANNEL_ID=2007656354
CHANNEL_SECRET=0a4726c1c0df91876c9428bb479aeca8
```

### 本番環境 (Published)
```
NEXT_PUBLIC_LIFF_ID=2007656355-eOqBNxYy
NEXT_PUBLIC_CHANNEL_ID=2007656355
CHANNEL_SECRET=f7e9d82adb41f162a1436438bbfb5dc1
```

## 環境変数ファイルの作成

### 開発用 (.env.local)
プロジェクトルートに以下の内容で `.env.local` ファイルを作成してください：

```bash
# LINE Mini App - 開発環境
NEXT_PUBLIC_LIFF_ID=2007656353-xnDmN9Er
NEXT_PUBLIC_CHANNEL_ID=2007656353
CHANNEL_SECRET=abbd89a5c812b3a78906b6bb4ae5f95f

# AI Services (後で設定)
GEMINI_API_KEY=
OPENAI_API_KEY=

# Database (後で設定)
DATABASE_URL=

# Redis (後で設定)
REDIS_URL=

# Feature Flags
ENABLE_PREMIUM_FEATURES=false
ENABLE_TTS=true

# API Rate Limits
FREE_TIER_RATE_LIMIT=10
PREMIUM_TIER_RATE_LIMIT=50
```

## 注意事項

1. **セキュリティ**
   - Channel Secretは絶対に公開しないでください
   - .env.localファイルは.gitignoreに含まれています
   - 本番環境では環境変数をVercelの設定で管理してください

2. **環境切り替え**
   - 開発時は Developing 環境の設定を使用
   - テスト時は Review 環境の設定を使用
   - 本番デプロイ時は Published 環境の設定を使用

3. **LIFF URL**
   - Developing: https://miniapp.line.me/2007656353-xnDmN9Er
   - Review: https://miniapp.line.me/2007656354-jRyWPm4L
   - Published: https://miniapp.line.me/2007656355-eOqBNxYy 