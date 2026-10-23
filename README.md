# 天天記帳 - 官網自動部署版 v2.0.4

這是 https://paulwang-bookkeeping.netlify.app 的官網原始碼，支援 PWA 自動更新。

## 已修復
- v2.0.4: 修復 +記一筆 按鈕被 Netlify Powered by Netlify 遮住，往上移 75px + 自動隱藏浮水印

## 如何啟用真正全自動部署

### 第一步：建 GitHub Repo
1. 去 https://github.com/new
2. Repo name: `bookkeeping`
3. 選 Public, 不要勾 README
4. Create repository

### 第二步：把這個資料夾推上去
把這個資料夾解壓縮後，在資料夾裡打開 Terminal 貼上：

```bash
git init
git add .
git commit -m "v2.0.4 fix fab button"
git branch -M main
git remote add origin https://github.com/你的帳號/bookkeeping.git
git push -u origin main
```

### 第三步：連到 Netlify
1. 去 https://app.netlify.com → 你的 paulwang-bookkeeping 站
2. Site settings → Build & deploy → Continuous deployment
3. 按 Link to GitHub → 選你的 bookkeeping repo → main 分支
4. Build command 留空或填 echo, Publish directory 填 .
5. Save → Deploys → Trigger deploy

從此以後，你改了 GitHub 就會自動部署到 Netlify。

### 以後怎麼更新？
- 你跟我說要改什麼，我幫你改好新的 index.html
- 你把檔案覆蓋到 GitHub，git push
- Netlify 自動部署，手機 App 滑掉重開就自動跳「發現新版」

### 關掉 Netlify 浮水印（必做）
Site settings → Build & deploy → Post processing → Snippet injection → 關掉 "Add Netlify badge"

