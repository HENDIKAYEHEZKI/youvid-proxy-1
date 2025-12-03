# YouVid Proxy

M3U8 Video Proxy menggunakan Vercel Edge Functions untuk bypass CORS dan streaming video.

## Features
- ✅ M3U8 playlist rewriting
- ✅ TS segment proxying
- ✅ CORS bypass
- ✅ Edge caching global
- ✅ 100GB bandwidth/bulan gratis

## Deploy ke Vercel

### Option 1: Deploy via GitHub (Recommended)

1. **Fork/Upload ke GitHub:**
   - Buat repository baru di GitHub
   - Upload semua file dari folder ini
   - Nama repository: `youvid-proxy-1`, `youvid-proxy-2`, dst

2. **Deploy di Vercel:**
   - Buka https://vercel.com
   - Login dengan GitHub
   - Click **Add New** → **Project**
   - Import repository yang baru dibuat
   - Click **Deploy**
   
3. **Dapatkan URL:**
   - Setelah deploy selesai, copy URL: `https://youvid-proxy-1.vercel.app`
   - Test: `https://youvid-proxy-1.vercel.app/api/proxy?url=VIDEO_URL`

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd vercel-proxy-template
vercel --prod
```

## Usage

```javascript
// Request format
https://YOUR-PROJECT.vercel.app/api/proxy?url=VIDEO_URL&referer=REFERER

// Example
https://youvid-proxy-1.vercel.app/api/proxy?url=https://stream.example.com/video/playlist.m3u8
```

## Multi-Account Setup

Untuk high availability, deploy ke 5 akun berbeda:

1. **Akun 1:** `youvid-proxy-1.vercel.app`
2. **Akun 2:** `youvid-proxy-2.vercel.app`
3. **Akun 3:** `youvid-proxy-3.vercel.app`
4. **Akun 4:** `youvid-proxy-4.vercel.app`
5. **Akun 5:** `youvid-proxy-5.vercel.app`

Total bandwidth: **500GB/bulan gratis**

## Update Config

Tambahkan URL Vercel ke `config_worker_proxy.php`:

```php
'workers' => [
    [
        'enabled' => true,
        'name' => 'Vercel Edge 1',
        'url' => 'https://youvid-proxy-1.vercel.app/api/proxy',
        'priority' => 6,
        'timeout' => 5,
    ],
    // ... tambahkan untuk akun 2-5
],
```

## Monitoring

- Dashboard Vercel: https://vercel.com/dashboard
- Analytics → Bandwidth usage
- Limit: 100GB/month per account

## License

MIT
