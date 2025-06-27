# 写真眼鏡 開発ガイドライン

## コーディング規約

### 1. 基本原則
- TypeScriptを使用し、型定義を明確にする
- コンポーネントは関数コンポーネントを使用
- Hooksの命名は`use`プレフィックスを使用
- ファイル名はPascalCase（コンポーネント）またはcamelCase（その他）を使用

### 2. ディレクトリ構造
```
src/
├── app/                    # App Router
├── components/             # 共通コンポーネント
│   ├── ui/                # 基本UIコンポーネント
│   └── features/          # 機能別コンポーネント
├── hooks/                 # カスタムフック
├── lib/                   # ユーティリティ
├── styles/                # スタイル定義
└── types/                 # 型定義
```

### 3. コンポーネント規約
- 1ファイル1コンポーネント
- Props型は明示的に定義
- 大きなコンポーネントは小さく分割
- コメントは日本語で記述

例：
```typescript
type ButtonProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      {label}
    </button>
  );
};
```

### 4. スタイリング規約
- TailwindCSSを使用
- 共通スタイルはユーティリティクラスとして定義
- カスタムスタイルは`styles/`ディレクトリに配置

### 5. 状態管理
- ローカル状態：React Hooks
- グローバル状態：Zustand
- サーバー状態：React Query

### 6. エラー処理
- エラーバウンダリを適切に配置
- ユーザーフレンドリーなエラーメッセージ
- エラーログの収集

### 7. パフォーマンス最適化
- 不要なレンダリングを防ぐ
- 画像の最適化
- コードスプリッティング

### 8. セキュリティ
- ユーザー入力のバリデーション
- XSS対策
- CSRF対策

### 9. テスト
- ユニットテスト：Jest + React Testing Library
- E2Eテスト：Cypress
- カバレッジ目標：80%以上

### 10. コミット規約
```
feat: 新機能
fix: バグ修正
docs: ドキュメントのみの変更
style: コードの意味に影響を与えない変更
refactor: リファクタリング
test: テストコード
chore: ビルドプロセスやツールの変更
```

## 開発フロー

### 1. ブランチ戦略
- main: プロダクション環境
- develop: 開発環境
- feature/*: 機能開発
- fix/*: バグ修正
- release/*: リリース準備

### 2. レビュープロセス
- PRテンプレートに従う
- レビュー担当者を指定
- CI/CDチェックをパス
- コードオーナーの承認

### 3. デプロイメント
- 開発環境：自動デプロイ
- ステージング環境：手動承認後
- 本番環境：手動承認後

### 4. 品質管理
- ESLintによる静的解析
- Prettierによるコード整形
- TypeScriptの厳格な型チェック
- テストの自動実行

## トラブルシューティング

### 1. 開発環境セットアップ
```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# テストの実行
npm test

# リントチェック
npm run lint
```

### 2. 一般的な問題
- 環境変数の設定
- APIキーの取得
- デバッグ方法
- ログの確認方法

### 3. パフォーマンス問題
- レンダリングの最適化
- メモリリークの防止
- ネットワークの最適化

## サポート

- 技術的な質問：GitHub Issues
- バグ報告：GitHub Issues
- セキュリティ問題：security@example.com 