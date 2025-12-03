# Vercel Deployment - Step by Step Guide

## 🎯 Prerequisites
- 5 Email addresses (Gmail, Outlook, dll)
- 5 GitHub accounts (bisa buat baru atau gunakan existing)
- Browser (Chrome/Firefox)

---

## 📝 Account 1 Setup (Ulangi untuk Account 2-5)

### Step 1: Create GitHub Repository

1. **Login GitHub** (akun pertama)
   - Buka: https://github.com/login

2. **Create New Repository**
   - Click: **New** (atau https://github.com/new)
   - Repository name: `youvid-proxy-1`
   - Description: `M3U8 Video Proxy`
   - Set: **Public**
   - ✅ Add README file
   - Click: **Create repository**

### Step 2: Upload Files ke GitHub

**Option A: Via Web (Mudah)**

1. Di repository page, click: **Add file** → **Upload files**

2. Drag & drop semua file dari folder `vercel-proxy-template/`:
   ```
   api/proxy.js
   package.json
   vercel.json
   README.md
   .gitignore
   ```

3. Commit message: `Initial commit`

4. Click: **Commit changes**

**Option B: Via Git (Advanced)**

```bash
cd /home/isimentega/public_html/mp4youvidorg/vercel-proxy-template

git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/youvid-proxy-1.git
git push -u origin main
```

### Step 3: Deploy ke Vercel

1. **Buka Vercel**
   - URL: https://vercel.com/signup
   - Click: **Continue with GitHub**
   - Authorize Vercel

2. **Import Project**
   - Click: **Add New...** → **Project**
   - Pilih repository: `youvid-proxy-1`
   - Click: **Import**

3. **Configure Project**
   - Project Name: `youvid-proxy-1` (auto-filled)
   - Framework Preset: **Other**
   - Root Directory: `./` (default)
   - Build Settings: (biarkan default)
   - Click: **Deploy**

4. **Wait for Deployment**
   - Progress bar akan muncul
   - Tunggu ~30-60 detik
   - Selesai! 🎉

### Step 4: Get URL & Test

1. **Copy Production URL**
   - Setelah deploy selesai
   - Copy URL: `https://youvid-proxy-1.vercel.app`

2. **Test Endpoint**
   - Buka terminal atau browser
   - Test URL:
   ```
   https://youvid-proxy-1.vercel.app/api/proxy?url=https://stream.kingbokep.video/laura-pakai-kebaya-merah-auto-anggun/playlist.m3u8
   ```
   
3. **Expected Result:**
   - Status: 200 OK
   - Response: M3U8 playlist dengan URL yang sudah di-rewrite
   - Headers: CORS enabled

---

## 🔁 Repeat for Account 2-5

### Account 2:
- GitHub repo: `youvid-proxy-2`
- Vercel URL: `https://youvid-proxy-2.vercel.app`

### Account 3:
- GitHub repo: `youvid-proxy-3`
- Vercel URL: `https://youvid-proxy-3.vercel.app`

### Account 4:
- GitHub repo: `youvid-proxy-4`
- Vercel URL: `https://youvid-proxy-4.vercel.app`

### Account 5:
- GitHub repo: `youvid-proxy-5`
- Vercel URL: `https://youvid-proxy-5.vercel.app`

---

## ⚙️ Update Config di Server

Setelah deploy semua 5 Vercel Edge Functions, update config:

**File: config_worker_proxy.php**

```php
'workers' => [
    // Existing Cloudflare Worker
    [
        'enabled' => true,
        'name' => 'Worker A - Main',
        'url' => 'https://youvid.haruncell03.workers.dev/',
        'priority' => 1,
        'timeout' => 5,
    ],
    
    // Vercel Edge Functions (tambahkan ini)
    [
        'enabled' => true,
        'name' => 'Vercel Edge 1',
        'url' => 'https://youvid-proxy-1.vercel.app/api/proxy',
        'priority' => 2,
        'timeout' => 5,
        'max_retries' => 1,
    ],
    [
        'enabled' => true,
        'name' => 'Vercel Edge 2',
        'url' => 'https://youvid-proxy-2.vercel.app/api/proxy',
        'priority' => 3,
        'timeout' => 5,
        'max_retries' => 1,
    ],
    [
        'enabled' => true,
        'name' => 'Vercel Edge 3',
        'url' => 'https://youvid-proxy-3.vercel.app/api/proxy',
        'priority' => 4,
        'timeout' => 5,
        'max_retries' => 1,
    ],
    [
        'enabled' => true,
        'name' => 'Vercel Edge 4',
        'url' => 'https://youvid-proxy-4.vercel.app/api/proxy',
        'priority' => 5,
        'timeout' => 5,
        'max_retries' => 1,
    ],
    [
        'enabled' => true,
        'name' => 'Vercel Edge 5',
        'url' => 'https://youvid-proxy-5.vercel.app/api/proxy',
        'priority' => 6,
        'timeout' => 5,
        'max_retries' => 1,
    ],
],
```

---

## ✅ Verify Setup

### Test dari Dashboard

1. Buka: `https://mp4.youvid.org/dashboard_worker_proxy.php`
2. Click: **Test All Endpoints**
3. Semua Vercel Edge Functions harus menunjukkan: ✅ **Online**

### Test Fallback Chain

1. Disable Cloudflare Worker di config
2. Refresh video di play3.php
3. Video harus tetap jalan melalui Vercel Edge 1
4. Check Network tab → lihat request ke `youvid-proxy-1.vercel.app`

---

## 📊 Monitor Usage

### Vercel Dashboard

1. Login: https://vercel.com/dashboard
2. Click project: `youvid-proxy-1`
3. Tab **Analytics**:
   - Bandwidth usage
   - Request count
   - Edge network performance

### Limits

- ✅ **Bandwidth:** 100GB/month per account
- ✅ **Requests:** Unlimited
- ✅ **Edge Regions:** Global
- ⚠️ **Build Time:** 45 minutes/month (tidak relevan karena tidak ada build)

---

## 🔄 Update Code

Jika perlu update code di semua Vercel deployment:

1. **Edit code** di GitHub repository
2. Commit changes
3. Vercel **auto-deploy** dalam ~30 detik
4. Ulangi untuk semua 5 repositories

---

## 🚨 Troubleshooting

### Vercel deployment gagal:
- Check `vercel.json` format JSON benar
- Pastikan folder `api/` ada
- File `api/proxy.js` harus ada

### Edge function return 500:
- Check Vercel logs: Dashboard → Project → Logs
- Lihat error message
- Fix code dan commit lagi

### CORS error masih muncul:
- Pastikan `getCorsHeaders()` di-call di semua response
- Check browser console untuk error details

### Bandwidth limit tercapai:
- Check usage di Vercel dashboard
- Jika >90GB, disable worker tersebut di config
- Sistem auto-fallback ke worker lain

---

## 💡 Tips

1. **Gunakan email berbeda** untuk setiap Vercel account
2. **Deploy berurutan** - test 1 dulu sebelum deploy yang lain
3. **Save URLs** - buat spreadsheet untuk track semua URL
4. **Monitor daily** - cek usage untuk avoid limit
5. **Update config** - enable/disable based on usage

---

## 🎉 Success Checklist

- [ ] 5 GitHub repositories created
- [ ] 5 Vercel projects deployed
- [ ] All URLs collected
- [ ] Config updated di server
- [ ] All workers tested (green status)
- [ ] Video playback working with fallback

---

**Time needed:** ~15-20 minutes per account = ~1.5 jam total

**Result:** 500GB/month gratis bandwidth dengan high availability! 🚀
