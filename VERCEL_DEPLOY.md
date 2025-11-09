# Vercel Deployment Checklist

## ✅ Pre-Deployment

1. **Environment Variables** - Add these in Vercel Dashboard → Settings → Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key

2. **Build Command** - Should be: `npm run build` (default)

3. **Output Directory** - Should be: `.next` (default)

4. **Install Command** - Should be: `npm install` (default)

## 🚀 Deployment Steps

1. **Connect GitHub Repo:**
   - Go to Vercel Dashboard
   - Click "Add New Project"
   - Import your `barriers-app` repository
   - Vercel will auto-detect Next.js settings

2. **Add Environment Variables:**
   - In project settings, go to "Environment Variables"
   - Add both Supabase variables for Production, Preview, and Development

3. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete

## 📱 PWA Testing

After deployment:
1. Visit your Vercel URL on mobile
2. Look for "Add to Home Screen" prompt
3. Install the app
4. Test offline functionality

## 🔧 Important Notes

- **PWA only works in production** - Service worker is disabled in dev mode
- **HTTPS required** - Vercel provides this automatically
- **Icons are included** - Already generated in `/public` folder
- **Build should succeed** - All dependencies are in package.json

## 🐛 Troubleshooting

If build fails:
- Check environment variables are set correctly
- Verify Supabase URL and key are correct
- Check build logs in Vercel dashboard

If PWA doesn't work:
- Make sure you're accessing via HTTPS (Vercel provides this)
- Check browser console for service worker errors
- Verify manifest.json is accessible at `/manifest.json`

