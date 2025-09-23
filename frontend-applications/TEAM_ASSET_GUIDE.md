# Team Asset Management Guide

## 🎯 Quick Start for Sales Team

Your team can easily change images by replacing files in these folders:

### 📂 Main Asset Folders

```
frontend-applications/shared/assets/
├── branding/
│   ├── backgrounds/     # Hero background images (7 images)
│   └── logos/          # Company logos (2 variants)
├── products/
│   ├── confectionery/  # Sweet product images
│   ├── seasonal/       # Holiday items
│   ├── premium/        # Luxury products
│   └── categories/     # Category header images
└── marketing/
    ├── banners/        # Promotional banners
    ├── campaigns/      # Marketing campaigns
    └── social/         # Social media content
```

## 🔄 How to Change Images

### 1. Hero Backgrounds (Website Homepage)
**Location:** `shared/assets/branding/backgrounds/`
- Replace any of these 7 files:
  - `BG01.png`
  - `BG-02.png` 
  - `BG-03.png`
  - `BG-04.png`
  - `BG-5.png`
  - `BG-06.png`
  - `BG-07.png`
- Keep the same filename
- Website automatically rotates through all backgrounds

### 2. Company Logo
**Location:** `shared/assets/branding/logos/`
- Replace either:
  - `elegant_monogram_logo_for_harsha_delights_a-removebg-preview.png` (main logo)
  - `elegant_monogram_logo_for_harsha_delights_a__4_-removebg-preview.png` (alternative)
- Keep the same filename
- Logo appears in header, hero section, footer

### 3. Product Images
**Location:** `shared/assets/products/`
- Add product images to appropriate folders:
  - `confectionery/` - Sweets, chocolates, desserts
  - `seasonal/` - Holiday/seasonal items
  - `premium/` - Luxury product line
  - `categories/` - Category header images

### 4. Category Images (Homepage Preview)
**Location:** `shared/assets/products/categories/`
- Add these files for category previews:
  - `traditional-sweets.jpg`
  - `premium-chocolates.jpg`
  - `namkeens.jpg`
  - `dry-fruits.jpg`

## 📐 Image Requirements

### Backgrounds
- **Size:** 1920x1080px (landscape)
- **Format:** PNG or JPG
- **Quality:** High resolution for crisp display

### Logos
- **Size:** 400x400px minimum (square)
- **Format:** PNG with transparent background
- **Quality:** Vector-style, crisp edges

### Product Images
- **Size:** 800x800px (square)
- **Format:** JPG
- **Quality:** High resolution, good lighting

### Category Images
- **Size:** 600x400px (3:2 ratio)
- **Format:** JPG
- **Quality:** High resolution, appetizing

## ⚡ Quick Changes

### Change Hero Backgrounds
1. Go to `shared/assets/branding/backgrounds/`
2. Replace any `BG-XX.png` file with your new image
3. Keep the same filename
4. Refresh website to see changes

### Change Logo
1. Go to `shared/assets/branding/logos/`
2. Replace `elegant_monogram_logo_for_harsha_delights_a-removebg-preview.png`
3. Keep the same filename
4. Logo updates everywhere automatically

### Add Product Images
1. Go to `shared/assets/products/confectionery/`
2. Add your product images with descriptive names
3. Update product data to reference new image filenames

## 🎨 Current Color Scheme

- **Primary Purple:** Royal/luxury purple tones
- **Secondary Gold:** Elegant gold accents
- **Text:** Clean, readable contrasts

## 📞 Need Help?

If images don't appear after replacing files:
1. Check filename matches exactly (including extension)
2. Ensure image format is supported (PNG/JPG)
3. Clear browser cache and refresh
4. Contact development team if issues persist