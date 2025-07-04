# 写真眼鏡 - LINE Mini App

## プロジェクト概要
写真眼鏡は、中高年者向けのAI搭載写真・テキスト認識LINE Mini Appです。ユーザーが撮影した写真やテキストを、AIが解析して分かりやすい日本語で説明し、音声でも読み上げる機能を提供します。

## 主な機能
- 写真・テキスト認識
- AI による解析と説明
- 音声読み上げ（TTS）
- 結果の共有機能
- プレミアム会員向け保存機能

## 技術スタック
### フロントエンド
- Next.js + React
- LINE LIFF SDK
- TailwindCSS
- Service Worker（キャッシュ管理）

### バックエンド
- Vercel Edge Functions
- Redis（キャッシュ・キュー管理）
- Supabase（データベース）

### AI サービス
- 画像認識：Gemini Pro Vision API
- テキスト生成：GPT API (Completion)
- 音声合成：VOICEVOX（オープンソースTTS）

## システムアーキテクチャ

### 1. フロントエンド層
- クライアントサイドキャッシュ
  - Service Worker による静的リソースキャッシュ
  - 直近の認識結果のローカルストレージ
- 画像前処理
  - クライアントサイド圧縮（最大2MB）
  - WebP形式変換
- リクエスト制御
  - デバウンス処理
  - スロットリング

### 2. 負荷分散層
- Cloudflare CDN
  - グローバルノード配信
  - DDoS保護
  - 静的リソースキャッシュ
- マルチリージョン展開
  - 日本国内の主要地域へのデプロイ
  - 自動フェイルオーバー

### 3. アプリケーション層
- Vercel Edge Functions
  - グローバルエッジノード
  - 自動スケーリング
- リクエストキューシステム
  - Redisキュー
  - ピーク時の負荷平準化
  - タイムアウト処理
- エラーリトライ機構
  - 指数バックオフ
  - サーキットブレーカー

### 4. AIサービス層
- GPTサービスプール
  - 複数APIキーのローテーション
  - 負荷分散
  - 自動フェイルオーバー
- 結果キャッシュ
  - 類似画像認識結果のキャッシュ
  - ホットリクエストキャッシュ
- サービスデグレード
  - タイムアウト時の軽量モデルへの切り替え
  - キューイングメカニズム

### 5. キャッシュ層
- Redisクラスター
  - マスター/スレーブ構成
  - Sentinelモード
- 分散キャッシュ
  - ホットデータキャッシュ
  - キャッシュウォーミング
  - キャッシュ穿透対策

### 6. データストレージ層
- マスター/スレーブ分離
  - 書き込み：マスターDB
  - 読み取り：スレーブDB
- シャーディング
  - ユーザーIDベースの分割
  - 履歴データのアーカイブ

### 7. モニタリング・アラート
- パフォーマンスモニタリング
  - レスポンスタイム
  - サーバーリソース使用率
  - API呼び出し統計
- ビジネスモニタリング
  - 同時接続ユーザー数
  - 認識成功率
  - サービス品質指標

### 8. コスト最適化
- 動的スケーリング
  - リアルタイムトラフィックベース
  - オフピーク時の自動縮小
- 階層化キャッシュ
  - ホットデータのマルチレベルキャッシュ
  - コールドデータの自動デグレード
- AIサービスコスト制御
  - バッチ処理最適化
  - スマートキューイング
  - 結果再利用

### 9. レート制限
- ユーザーレベル制限
  - 1分あたりのリクエスト数制限
  - 無料/プレミアムユーザー別制限
- システムレベル制限
  - 総同時リクエスト数制御
  - サーバー負荷による適応制限

### 10. フェイルオーバー
- マルチリージョン災害対策
- サービスデグレード計画
- 迅速な復旧メカニズム

## パフォーマンス目標
- ピーク時1000+同時接続
- 平均応答時間3秒以内
- サービス可用性99.9%

## 実装フェーズ
### フェーズ1：基本機能実装
- 基本的なアプリケーションフレームワーク
- コア機能の実装
- 基本的なスケーリング対応

### フェーズ2：パフォーマンス最適化
- キャッシュ層の実装
- モニタリングシステムの導入
- パフォーマンスチューニング

### フェーズ3：高可用性実現
- 完全な冗長構成
- 高度なスケーリング
- 包括的な監視・運用体制 