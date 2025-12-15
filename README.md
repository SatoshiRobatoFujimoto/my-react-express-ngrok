# my-react-express-ngrok

React + Express + TypeScript のフルスタックアプリケーション

## プロジェクト構成

```
my-react-express-ngrok/
├── README.md
├── ngrok.yml
├── ngrok.yml.example
├── backend/                 # Express + TypeScript
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       └── index.ts
└── frontend/                # React + TypeScript + Vite
    ├── package.json
    ├── vite.config.ts
    ├── index.html
    ├── public/
    │   └── vite.svg
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── App.css
        ├── index.css
        └── assets/
            └── react.svg
```

## セットアップ

### バックエンドのセットアップ

1. バックエンドディレクトリに移動
```bash
cd backend
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数ファイルを作成（オプション）
```bash
# .env ファイルを作成
PORT=3001
AUTH_USERNAME=admin
AUTH_PASSWORD=password
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=24h
```

デフォルト値:
- PORT: 3001
- AUTH_USERNAME: admin
- AUTH_PASSWORD: password
- JWT_SECRET: your-secret-key-change-in-production（本番環境では必ず変更してください）
- JWT_EXPIRES_IN: 24h

**重要**: 本番環境では以下の環境変数が必須です：
- `JWT_SECRET`: 強力な秘密鍵を設定してください
- `AUTH_USERNAME`: 認証用のユーザー名
- `AUTH_PASSWORD`: 認証用のパスワード

### フロントエンドのセットアップ

1. フロントエンドディレクトリに移動
```bash
cd frontend
```

2. 依存関係をインストール
```bash
npm install
```

## 起動方法

### バックエンドの起動

1. バックエンドディレクトリに移動
```bash
cd backend
```

2. 開発サーバーを起動
```bash
npm run dev
```

バックエンドAPIは `http://localhost:3001` で起動します。

### フロントエンドの起動

1. フロントエンドディレクトリに移動
```bash
cd frontend
```

2. 開発サーバーを起動
```bash
npm run dev
```

フロントエンドは `http://localhost:5173` で起動します。

## ngrokで外部に公開する方法

※新規アカウントでエンドポイントが2つ作成されなかった場合は使用できない可能性があります

1. ngrokをインストール
```bash
brew install ngrok
```

2. authtokenを設定
```bash
ngrok config add-authtoken YOUR_AUTHTOKEN
```

3. `ngrok.yml` を作成（ルートディレクトリ）
```yaml
version: 3
agent:
  authtoken: your_authtoken
tunnels:
  frontend:
    addr: 5173
    proto: http
  backend:
    addr: 3001
    proto: http
```

4. `frontend/.env` を作成
```env
VITE_API_BASE_URL=your-ngrok-backend-url
```

5. `vite.config.ts` の `allowedHosts` を更新
```typescript
allowedHosts: [
  '.ngrok-free.app',
  '.ngrok.app',
  'localhost'
]
```

6. 起動
```bash
# ngrokを起動
ngrok start --all --config ngrok.yml
# 表示されたバックエンドURL（例: https://yyyyyyyyyyyy.ngrok-free.app）をコピー

# 別ターミナルでバックエンド
cd backend && npm run dev

# フロントエンドの.envを修正（VITE_API_BASE_URLにngrokのバックエンドURLを設定）
# VITE_API_BASE_URL=https://yyyyyyyyyyyy.ngrok-free.app

# 別ターミナルでフロントエンド
cd frontend && npm run dev
```

7. ngrokで表示されたフロントエンドURLにアクセス

## 使用方法

1. バックエンドとフロントエンドの両方を起動します
2. ブラウザで `http://localhost:5173` にアクセスします
3. ログインページで認証情報を入力します
   - デフォルトのユーザー名: `admin`
   - デフォルトのパスワード: `password`
4. ログイン成功後、JWTトークンが発行され、localStorageに保存されます
5. ログイン後、ダッシュボードからHealth APIをチェックできます

## 認証について

このアプリケーションはJWT（JSON Web Token）認証を使用しています。

### 認証フロー

1. ユーザーがログイン情報を入力
2. バックエンドの `/api/login` エンドポイントにPOSTリクエストを送信
3. 認証成功後、JWTトークンが発行される
4. トークンはフロントエンドのlocalStorageに保存される（パスワードは保存されません）
5. 以降のAPIリクエストでは、`Authorization: Bearer <token>` ヘッダーでトークンを送信
6. バックエンドでトークンを検証し、有効な場合のみリクエストを処理

### セキュリティ機能

- ✅ パスワードはlocalStorageに保存されません
- ✅ JWTトークンには有効期限が設定されています（デフォルト: 24時間）
- ✅ トークンは署名済みで、改ざんを検知できます
- ✅ 本番環境では環境変数の設定が必須です

## ビルド

### バックエンドのビルド

```bash
cd backend
npm run build
```

ビルド後のファイルは `dist/` ディレクトリに生成されます。

### フロントエンドのビルド

```bash
cd frontend
npm run build
```

ビルド後のファイルは `dist/` ディレクトリに生成されます。

## 技術スタック

### フロントエンド
- React 19
- TypeScript
- Vite
- CSS (Inline Styles)

### バックエンド
- Express
- TypeScript
- JWT認証（jsonwebtoken）
- CORS対応
- dotenv（環境変数管理）

## API エンドポイント

### 公開エンドポイント

- `GET /` - APIの状態確認
- `POST /api/login` - ログイン（JWTトークンを発行）

### 保護されたエンドポイント

- `GET /api/health` - ヘルスチェック（認証必須）

保護されたエンドポイントには、`Authorization: Bearer <token>` ヘッダーが必要です。