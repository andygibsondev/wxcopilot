# PWA Setup Guide for WxCopilot

This document explains how to complete the PWA (Progressive Web App) setup for WxCopilot.

## Current Implementation

The app includes:
- ✅ Web App Manifest (`/public/manifest.json`)
- ✅ Service Worker (`/public/sw.js`)
- ✅ Loading Screen (`/components/LoadingScreen.tsx`)
- ✅ Service Worker Registration (`/components/ServiceWorkerRegistration.tsx`)
- ✅ PWA meta tags in layout

## Generating App Icons

### Option 1: Use an Online Generator (Recommended)

1. **Create a base icon** (512x512px minimum) with the WxCopilot branding
2. Use one of these free tools:
   - [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator) - Microsoft's tool
   - [Real Favicon Generator](https://realfavicongenerator.net/) - Comprehensive favicon/PWA generator
   - [Maskable.app](https://maskable.app/) - For creating maskable icons

3. Upload your 512x512 icon and download the generated pack

4. Place the icons in `/public/icons/` with these names:
   - `icon-72x72.png`
   - `icon-96x96.png`
   - `icon-128x128.png`
   - `icon-144x144.png`
   - `icon-152x152.png`
   - `icon-192x192.png`
   - `icon-384x384.png`
   - `icon-512x512.png`
   - `icon-maskable-192x192.png`
   - `icon-maskable-512x512.png`

### Option 2: Use ImageMagick CLI

If you have ImageMagick installed:

```bash
# From your base 512x512 icon
cd public/icons

# Generate all sizes
convert icon-512x512.png -resize 72x72 icon-72x72.png
convert icon-512x512.png -resize 96x96 icon-96x96.png
convert icon-512x512.png -resize 128x128 icon-128x128.png
convert icon-512x512.png -resize 144x144 icon-144x144.png
convert icon-512x512.png -resize 152x152 icon-152x152.png
convert icon-512x512.png -resize 192x192 icon-192x192.png
convert icon-512x512.png -resize 384x384 icon-384x384.png

# Apple touch icons
convert icon-512x512.png -resize 180x180 icon-180x180.png
convert icon-512x512.png -resize 120x120 icon-120x120.png
convert icon-512x512.png -resize 114x114 icon-114x114.png
convert icon-512x512.png -resize 76x76 icon-76x76.png
convert icon-512x512.png -resize 60x60 icon-60x60.png
convert icon-512x512.png -resize 57x57 icon-57x57.png

# Favicons
convert icon-512x512.png -resize 32x32 icon-32x32.png
convert icon-512x512.png -resize 16x16 icon-16x16.png
```

## Generating Splash Screens (iOS)

iOS requires specific splash screen sizes for a native app-like experience.

### Required Sizes:
- 640x1136 (iPhone 5/SE)
- 750x1334 (iPhone 6/7/8)
- 1242x2208 (iPhone 6+/7+/8+)
- 1125x2436 (iPhone X/XS/11 Pro)
- 1284x2778 (iPhone 12/13/14 Pro Max)

### Creating Splash Screens:

1. Design a splash screen with:
   - Dark background (#0f172a)
   - Centered airplane emoji or logo
   - "WxCopilot" text below

2. Save in `/public/splash/` as:
   - `splash-640x1136.png`
   - `splash-750x1334.png`
   - `splash-1242x2208.png`
   - `splash-1125x2436.png`
   - `splash-1284x2778.png`

## Testing the PWA

### Chrome DevTools:
1. Open Chrome DevTools (F12)
2. Go to "Application" tab
3. Check "Manifest" section for errors
4. Check "Service Workers" section for registration

### Lighthouse Audit:
1. Open Chrome DevTools
2. Go to "Lighthouse" tab
3. Select "Progressive Web App" category
4. Run audit

### Install Test:
1. Visit your deployed site
2. Look for the install prompt in the address bar
3. On mobile: "Add to Home Screen" option in browser menu

## Offline Support

The service worker caches:
- Static pages
- CSS/JS assets
- Images

API calls are NOT cached (always fetch fresh weather data).

## Updating the PWA

When you update the app:
1. Update `CACHE_NAME` in `/public/sw.js` (e.g., 'wxcopilot-v2')
2. Users will get the new version on next visit

## Resources

- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [PWA Builder](https://www.pwabuilder.com/)
- [Workbox (Advanced Service Workers)](https://developers.google.com/web/tools/workbox)
- [Apple PWA Guidelines](https://developer.apple.com/design/human-interface-guidelines/web-apps)

