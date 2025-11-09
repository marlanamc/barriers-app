# PWA Setup Guide

## ✅ What's Configured

1. **next-pwa** - Installed and configured
2. **manifest.json** - Web app manifest created
3. **PWA Meta Tags** - Added to layout.tsx
4. **Service Worker** - Will be auto-generated on build

## 📱 Icons Needed

You need to create two icon files in the `public/` directory:

- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

### Quick Icon Creation Options:

1. **Use an online tool:**
   - https://www.pwabuilder.com/imageGenerator
   - https://realfavicongenerator.net/

2. **Create simple icons:**
   - Use a purple/pink gradient background
   - Add a simple icon or emoji (like 🧠 or 📊)
   - Export as PNG at the required sizes

3. **Use Figma/Canva:**
   - Create 512x512 design
   - Export at both sizes

## 🚀 Testing PWA

1. **Build the app:**
   ```bash
   npm run build
   npm start
   ```

2. **Test on mobile:**
   - Open the app in Chrome/Safari on your phone
   - Look for "Add to Home Screen" prompt
   - Or use browser menu → "Add to Home Screen"

3. **Test install prompt:**
   - The browser will show an install banner
   - Click to install as a standalone app

## 📝 Notes

- Service worker is **disabled in development** (only works in production build)
- Icons are required for the PWA to work properly
- The app will work offline after first load (cached)
- Theme color is set to purple (#a855f7) to match your design

## 🔧 Customization

Edit `public/manifest.json` to customize:
- App name
- Colors
- Display mode
- Start URL

