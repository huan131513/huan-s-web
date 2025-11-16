# X-like Social Media App

一個類似 X (Twitter) 的即時發文和互動應用程式，使用 Next.js 14、NextAuth v4、Prisma 和 Neon PostgreSQL 構建。

## 🌐 線上部署

**部署連結：** [https://wp1141-three.vercel.app](https://wp1141-three.vercel.app)

### 如何使用部署的應用

1. **訪問應用**
   - 直接在瀏覽器中打開 [https://wp1141-three.vercel.app](https://wp1141-three.vercel.app)
   - 應用會自動重定向到登入頁面

2. **登入方式**
   - **Google OAuth 登入**：點擊「使用 Google 登入」按鈕
   - **GitHub OAuth 登入**：點擊「使用 GitHub 登入」按鈕
   - **User ID 登入**：先使用 OAuth 登入後，可以使用 User ID 快速切換帳號

3. **功能說明**
   - 登入後可以查看所有貼文的主 Feed
   - 可以發表新貼文
   - 可以查看和編輯個人檔案
   - 支援多種登入方式，每個 OAuth 提供者會創建獨立的帳號

---

## 💻 本地開發環境設置

如果部署連結失效或需要在本地運行，請按照以下步驟設置：

### 環境要求

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 或 **yarn** >= 1.22.0
- **Git** (用於版本控制)
- **Neon PostgreSQL** 帳號（免費版即可）

### 步驟 1: 克隆專案

```bash
git clone <repository-url>
cd hw5
```

### 步驟 2: 安裝依賴

```bash
npm install
```

### 步驟 3: 設置環境變數

在專案根目錄創建 `.env.local` 文件，並添加以下環境變數：

```env
# ============================================
# 資料庫配置（必需）
# ============================================
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# ============================================
# NextAuth 配置（必需）
# ============================================
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# ============================================
# OAuth 配置（可選，但需要配置才能使用 OAuth 登入）
# ============================================
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

#### 環境變數詳細說明

**1. DATABASE_URL**
- 前往 [Neon Console](https://console.neon.tech/) 創建專案
- 複製連接字串到 `DATABASE_URL`

**2. NEXTAUTH_SECRET**
- 生成方式：
  ```bash
  # 使用 OpenSSL
  openssl rand -base64 32
  
  # 或使用 Node.js
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```

**3. NEXTAUTH_URL**
- 本地開發：`http://localhost:3000`
- 生產環境：你的 Vercel 部署 URL

**4. OAuth 憑證（可選）**
- **Google OAuth**：前往 [Google Cloud Console](https://console.cloud.google.com/) 創建 OAuth 應用
- **GitHub OAuth**：前往 GitHub Settings → Developer settings → OAuth Apps 創建應用

### 步驟 4: 初始化資料庫

```bash
# 生成 Prisma Client
npm run prisma:generate

# 測試資料庫連接
npm run db:test

# 運行資料庫遷移（創建資料表）
npm run migrate

# 驗證資料表是否創建成功
npm run db:verify
```

### 步驟 5: 啟動開發伺服器

```bash
npm run dev
```

### 步驟 6: 打開瀏覽器

訪問 [http://localhost:3000](http://localhost:3000)

---

## 📋 專案結構

```
hw5/
├── app/                    # Next.js App Router 頁面
│   ├── api/               # API 路由
│   │   ├── auth/         # NextAuth 認證路由
│   │   ├── posts/        # 貼文 API
│   │   └── users/        # 用戶 API
│   ├── home/             # 首頁
│   ├── login/            # 登入頁面
│   └── profile/          # 個人檔案頁面
├── components/            # React 組件
├── lib/                   # 工具函數和配置
│   ├── auth.ts          # NextAuth 配置
│   ├── db/              # 資料庫相關
│   └── prisma.ts        # Prisma 客戶端
├── prisma/               # Prisma schema
│   └── schema.prisma    # 資料庫 schema 定義
├── scripts/              # 工具腳本
├── .env.local          # 環境變數（不提交到 Git）
├── next.config.mjs     # Next.js 配置
├── package.json        # 專案依賴
└── README.md          # 本文件
```

## 🛠 技術棧

- **Next.js 14** - React 全端框架（App Router）
- **TypeScript** - 類型安全
- **Tailwind CSS** - 樣式設計
- **NextAuth v4** - 身份驗證和授權
- **Prisma** - ORM 資料庫工具
- **Neon PostgreSQL** - 雲端 PostgreSQL 資料庫
- **@neondatabase/serverless** - Neon 資料庫客戶端
- **Lucide React** - 圖標庫
- **bcryptjs** - 密碼加密

## 📝 可用命令

```bash
# 開發
npm run dev              # 啟動開發伺服器

# 構建
npm run build            # 構建生產版本
npm run start            # 啟動生產伺服器

# 資料庫
npm run db:test          # 測試資料庫連接
npm run db:verify        # 驗證資料表
npm run migrate          # 運行資料庫遷移
npm run prisma:generate  # 生成 Prisma Client
npm run prisma:studio    # 打開 Prisma Studio

# 其他
npm run lint             # 代碼檢查
```

## 🗄 資料庫 Schema

### Users 表
- `id` (UUID) - 主鍵
- `userId` (VARCHAR) - 用戶 ID（唯一，1-10 位數字）
- `username` (VARCHAR) - 使用者名稱（唯一）
- `displayName` (VARCHAR) - 顯示名稱
- `email` (VARCHAR) - 電子郵件
- `passwordHash` (VARCHAR) - 密碼雜湊（可為 null，OAuth 用戶沒有密碼）
- `provider` (VARCHAR) - OAuth 提供者（google, github, 或 null）
- `providerAccountId` (VARCHAR) - OAuth 帳號 ID
- `bio` (TEXT) - 個人簡介
- `createdAt`, `updatedAt` - 時間戳

### Posts 表
- `id` (UUID) - 主鍵
- `authorId` (UUID) - 作者 ID（外鍵到 users）
- `content` (TEXT) - 貼文內容
- `media` (JSON) - 媒體 URL 陣列
- `likesCount` (INTEGER) - 讚數
- `createdAt`, `updatedAt` - 時間戳

## ⚠️ 重要注意事項

### 環境變數安全
- **絕對不要**將 `.env.local` 文件提交到版本控制
- 確保 `.env.local` 在 `.gitignore` 中
- 生產環境的環境變數應在 Vercel Dashboard 中設置

### 資料庫連接
- 使用 Neon 的連接池 URL（包含 `pooler`）
- 確保連接字串包含 `sslmode=require`
- 本地開發和生產環境可以使用同一個資料庫

### OAuth 配置
- 如果使用 OAuth，需要更新 OAuth 應用程式的回調 URL：
  - 本地開發：`http://localhost:3000/api/auth/callback/google` 或 `http://localhost:3000/api/auth/callback/github`
  - 生產環境：`https://wp1141-three.vercel.app/api/auth/callback/google` 或 `https://wp1141-three.vercel.app/api/auth/callback/github`

## ❓ 常見問題

### Q1: 部署連結無法訪問

**可能原因：**
- Vercel 部署失敗
- 環境變數未正確設置
- 資料庫連接失敗

**解決方法：**
- 檢查 Vercel Dashboard 中的部署日誌
- 確認所有環境變數都已設置
- 使用本地開發環境（見上方「本地開發環境設置」）

### Q2: 本地啟動時出現 "DATABASE_URL is not set" 錯誤

**解決方法：**
1. 確認 `.env.local` 文件存在於專案根目錄
2. 確認 `DATABASE_URL` 變數名稱正確（大小寫敏感）
3. 重啟開發伺服器（`Ctrl+C` 停止，然後重新執行 `npm run dev`）

### Q3: NextAuth 登入失敗

**解決方法：**
1. 確認 `NEXTAUTH_SECRET` 已設置且長度足夠（至少 32 字元）
2. 確認 `NEXTAUTH_URL` 設置正確
3. 如果使用 OAuth，確認 OAuth 憑證正確且回調 URL 設置正確

### Q4: 資料庫遷移失敗

**解決方法：**
1. 確認 `DATABASE_URL` 正確且資料庫可訪問
2. 確認資料庫用戶有足夠權限
3. 嘗試手動執行遷移：`npx tsx scripts/migrate.ts`

### Q5: 如何重置資料庫？

```bash
# 重置資料庫（⚠️ 警告：會刪除所有資料）
npm run db:reset

# 然後重新運行遷移
npm run migrate
```

### Q6: 如何查看資料庫內容？

```bash
# 使用 Prisma Studio
npm run prisma:studio

# 或使用 Neon Console 的 SQL Editor
```

## 📄 授權

本專案僅供學習使用。

## 🤝 貢獻

如有任何問題或建議，歡迎提出 Issue 或 Pull Request。

---

**部署連結：** [https://wp1141-three.vercel.app](https://wp1141-three.vercel.app)

**如果部署連結失效，請參考上方「本地開發環境設置」章節在本地運行應用。**

