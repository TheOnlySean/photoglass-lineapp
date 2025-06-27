#!/bin/bash

echo "🚀 写真眼鏡 開発環境デプロイスクリプト"
echo "=================================="

# 環境変数チェック
if [ ! -f ".env.local" ]; then
    echo "❌ .env.localファイルが見つかりません"
    echo "docs/ENVIRONMENT_CONFIG.mdを参考に.env.localファイルを作成してください"
    exit 1
fi

# 依存関係のインストール
echo "📦 依存関係をインストール中..."
npm install

# リンターチェック
echo "🔍 コード品質をチェック中..."
npm run lint

# ビルドテスト
echo "🏗️ ビルドをテスト中..."
npm run build

# Vercelにデプロイ
echo "🌐 Vercelにデプロイ中..."
npx vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ デプロイ完了！"
    echo "📋 次の手順："
    echo "1. Vercelから提供されたURLをコピー"
    echo "2. Vercel Dashboardで環境変数を設定"
    echo "3. LINE Developers ConsoleのLIFF設定でEndpoint URLを更新"
    echo "4. LINE アプリでテスト"
else
    echo "❌ デプロイに失敗しました"
    echo "手動でデプロイしてください: npx vercel --prod"
fi 