# 🎆 Harsha Delights - Diwali Deployment Guide

## Quick Start: 1-2 Day Launch Plan

This guide will help you deploy the Harsha Delights e-commerce platform for Diwali rush using the "Catalog + WhatsApp" model.

---

## 📋 Pre-Deployment Checklist

### Required Information
- [ ] WhatsApp Business Number: `91__________`
- [ ] Company Phone: `+91-_____-_____`
- [ ] Support Email: `orders@harshadelights.com`
- [ ] Domain Names:
  - B2C Shop: `shop.harshadelights.com`
  - B2B Portal: `portal.harshadelights.com`
- [ ] Render Backend URL: `https://harshadelights.onrender.com`

### Required Accounts
- [ ] GitHub account (for code)
- [ ] Vercel account (for B2C hosting - FREE)
- [ ] Render account (for B2B & API - $14/month)
- [ ] Domain registrar access (for DNS)
- [ ] WorkOS account (for B2B auth - optional, can use later)

---

## 🚀 Step 1: Configure Environment Variables

### B2C E-commerce (.env.production)

1. Navigate to `frontend-applications/02-b2c-ecommerce/`
2. Copy `.env.production.template` to `.env.production`
3. Fill in these critical values:

```bash
# MUST CHANGE THESE:
NEXT_PUBLIC_WHATSAPP_NUMBER="91XXXXXXXXXX"  # Your WhatsApp Business number
NEXT_PUBLIC_COMPANY_PHONE="+91-XXXXX-XXXXX"
NEXT_PUBLIC_API_URL="https://harshadelights.onrender.com"

# Can keep as-is:
NEXT_PUBLIC_ENABLE_AUTH="false"
NEXT_PUBLIC_ENABLE_CHECKOUT="false"
NEXT_PUBLIC_ENABLE_WHATSAPP_ORDERING="true"
```

### B2B Portal (.env.production)

1. Navigate to `frontend-applications/03-b2b-portal/`
2. Copy `.env.production.template` to `.env.production`
3. Fill in these values:

```bash
# MUST CHANGE THESE:
NEXT_PUBLIC_API_URL="https://harshadelights.onrender.com"
WORKOS_API_KEY="sk_live_..." # Get from workos.com
WORKOS_CLIENT_ID="client_..." # Get from workos.com
WORKOS_COOKIE_PASSWORD="generate-a-32-char-random-string"
WORKOS_REDIRECT_URI="https://portal.harshadelights.com/auth/callback"
```

**Generate random strings:**
```bash
# For WORKOS_COOKIE_PASSWORD and NEXTAUTH_SECRET:
openssl rand -base64 32
```

---

## 🌐 Step 2: Deploy to Vercel (B2C Shop)

### Option A: Vercel Dashboard (Easiest)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New" → "Project"
3. Import from GitHub: `harshadelights` repo
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend-applications/02-b2c-ecommerce`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. Add Environment Variables (click "Environment Variables"):
   - Copy all values from your `.env.production` file
   - Add each as a separate variable

6. Click "Deploy"
7. Wait 2-3 minutes for deployment

### Option B: Vercel CLI (Faster for updates)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to B2C folder
cd frontend-applications/02-b2c-ecommerce

# Deploy
vercel --prod

# Follow prompts - select your team/account
```

### Configure Custom Domain

1. In Vercel dashboard, go to Project → Settings → Domains
2. Add domain: `shop.harshadelights.com`
3. Vercel will give you DNS instructions
4. Add CNAME record in your domain registrar:
   ```
   Type: CNAME
   Name: shop
   Value: cname.vercel-dns.com
   ```
5. Wait 5-60 minutes for DNS propagation
6. Vercel will automatically provision SSL certificate

---

## 🔧 Step 3: Deploy to Render (B2B Portal)

### Create Web Service

1. Go to [render.com](https://render.com) dashboard
2. Click "New" → "Web Service"
3. Connect GitHub repo: `harshadelights`
4. Configure:
   - **Name**: `harsha-delights-b2b-portal`
   - **Root Directory**: `frontend-applications/03-b2b-portal`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: **Starter ($7/month)** ← Important for no cold starts!

5. Add Environment Variables (from your `.env.production`):
   - Click "Environment" tab
   - Add all variables one by one

6. Click "Create Web Service"
7. Wait 5-10 minutes for first deployment

### Configure Custom Domain on Render

1. In Render dashboard, go to your service → Settings
2. Scroll to "Custom Domain"
3. Add: `portal.harshadelights.com`
4. Render will show you CNAME record details
5. Add to your DNS:
   ```
   Type: CNAME
   Name: portal
   Value: harsha-delights-b2b-portal.onrender.com
   ```
6. Wait for SSL certificate (automatic)

---

## 🛒 Step 4: Configure Backend API (Render)

If you have a separate backend API:

1. Ensure it's deployed on Render at `harshadelights.onrender.com`
2. Upgrade to Starter plan ($7/month) to avoid cold starts
3. Verify these endpoints work:
   - `GET /api/v1/products` - List products
   - `GET /api/v1/products/:id` - Get product
   - `GET /api/v1/categories` - List categories
   - `POST /api/v1/whatsapp/generate-order-link` - WhatsApp link

Test:
```bash
curl https://harshadelights.onrender.com/api/v1/products
```

---

## ✅ Step 5: Testing Checklist

### B2C Shop Testing

Visit `https://shop.harshadelights.com` (or Vercel preview URL):

- [ ] Homepage loads correctly
- [ ] Product images display
- [ ] Browse categories (Sweets, Chocolates, Namkeens, Dry Fruits)
- [ ] Search works
- [ ] Product detail pages load
- [ ] WhatsApp button visible on products
- [ ] Click WhatsApp button → Opens with correct message
- [ ] Test on mobile device (most important!)
- [ ] Add to cart works (even though checkout is disabled)
- [ ] Page load time < 3 seconds

### B2B Portal Testing

Visit `https://portal.harshadelights.com`:

- [ ] Login page loads
- [ ] Can log in with WorkOS
- [ ] Dashboard displays
- [ ] Product management page works
- [ ] Can add new product
- [ ] Can upload product images
- [ ] Can edit product price
- [ ] Can manage categories
- [ ] Changes reflect on B2C site within 1 minute

### WhatsApp Flow Testing (Critical!)

1. On B2C site, browse to a product
2. Click "Order via WhatsApp" button
3. Verify WhatsApp opens with message like:
   ```
   Hi! I'd like to order:
   - Product: Kaju Katli 500g Box
   - Price: ₹450
   - Quantity: 1

   Please confirm availability and delivery details.
   ```
4. Send message to yourself
5. Verify you receive it correctly
6. Test from actual customer phone (friend/family)

---

## 📱 Step 6: Mobile Optimization

### Test on Real Devices

- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] Check WhatsApp button tap target size
- [ ] Verify images aren't too large
- [ ] Test category filters
- [ ] Ensure product cards are touch-friendly

### Performance Check

```bash
# Test with Google PageSpeed Insights
https://pagespeed.web.dev/

# Target scores:
- Mobile: > 70
- Desktop: > 90
```

---

## 👥 Step 7: Team Training

### Product Management (B2B Portal)

**Adding a New Product:**
1. Log in to `https://portal.harshadelights.com`
2. Click "Products" → "Add Product"
3. Fill in:
   - Product Title (e.g., "Kaju Katli Premium Box")
   - Handle (auto-generated, e.g., "kaju-katli-premium-box")
   - Category (select from dropdown)
   - Description
   - Status: Active
4. Add Variants (sizes/weights):
   - 250g Box - ₹250
   - 500g Box - ₹450
   - 1kg Box - ₹850
5. Upload Images (at least 3 angles)
6. Click "Create Product"
7. Product appears on B2C site immediately

**Updating Prices (Diwali Specials):**
1. Go to Products → Find product → Click Edit
2. Scroll to Variants section
3. Update "Price" field
4. Optionally add "Compare at Price" for strikethrough
5. Click "Update Product"
6. Changes live immediately

**Managing Categories:**
1. Go to "Categories" (if available)
2. Add: Diwali Specials, Gift Hampers, etc.
3. Assign products to categories

---

## 🎨 Step 8: Adding Diwali Banner

Update homepage with Diwali messaging:

```bash
# Edit: frontend-applications/02-b2c-ecommerce/src/app/page.tsx
# Add banner above hero section (Line ~14)
```

Example banner code already included in codebase.

---

## 🚨 Troubleshooting

### "WhatsApp button doesn't work"
- Check `NEXT_PUBLIC_WHATSAPP_NUMBER` is set correctly
- Format: `91XXXXXXXXXX` (country code + number, no spaces/dashes)
- Test on actual mobile device, not desktop

### "Products not loading"
- Verify `NEXT_PUBLIC_API_URL` is correct
- Test API endpoint: `curl https://harshadelights.onrender.com/api/v1/products`
- Check Render logs for backend errors
- Ensure backend is on Starter plan (no cold starts)

### "Images not displaying"
- Check image URLs in product data
- Verify images are uploaded correctly
- Check Next.js image domains in `next.config.js`

### "B2B login fails"
- Verify WorkOS credentials are correct
- Check `WORKOS_REDIRECT_URI` matches exactly (include /auth/callback)
- Ensure WorkOS organization is set up
- Check WorkOS dashboard for error logs

### "Site is slow"
- Check Render service is on Starter plan (not Free)
- Optimize images (use WebP format)
- Enable Vercel Analytics to identify bottlenecks
- Consider adding CDN for images

---

## 💰 Cost Summary

**Minimum Setup (Diwali Launch):**
- Vercel (B2C): **FREE** (Hobby tier)
- Render B2B Portal: **$7/month** (Starter)
- Render API Gateway: **$7/month** (Starter)
- **Total: $14/month**

**Optional:**
- PostgreSQL on Render: $7/month
- Redis cache: $1/month
- Custom email domain: $6/year

**After Diwali:**
- Can downgrade Render services if low traffic
- Keep Vercel free forever (or upgrade to Pro for $20/month for better analytics)

---

## 📞 Support & Help

### During Deployment
- Check Vercel deployment logs
- Check Render service logs
- Review browser console for errors
- Test API endpoints with curl/Postman

### Post-Launch
- Monitor Vercel Analytics
- Check Render metrics dashboard
- Set up uptime monitoring (uptimerobot.com - free)
- Keep WhatsApp business number active

---

## 🎯 Go-Live Checklist

Final checks before announcing:

- [ ] B2C site accessible at `shop.harshadelights.com`
- [ ] All products loaded with correct prices
- [ ] Images displaying properly
- [ ] WhatsApp ordering tested successfully
- [ ] Mobile experience smooth
- [ ] SSL certificates active (https://)
- [ ] B2B portal working for team
- [ ] Team trained on product management
- [ ] Support process documented
- [ ] WhatsApp responses ready
- [ ] Payment collection process decided

---

## 🎆 Launch!

1. Test everything one final time
2. Announce on social media
3. Run ads pointing to `shop.harshadelights.com`
4. Monitor WhatsApp for orders
5. Respond quickly (< 30 minutes)
6. Process orders manually
7. Track in spreadsheet or simple system
8. Collect customer feedback

---

## 📈 Post-Diwali Plan

After the rush, consider:
- Add Stripe/Razorpay payment gateway
- Enable user authentication & accounts
- Implement order tracking system
- Add email notifications
- Migrate to AWS (if needed)
- Implement inventory sync with ERP
- Add analytics dashboard
- Collect & display customer reviews

---

## 📚 Additional Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **WorkOS Docs**: https://workos.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

---

**Happy Diwali! 🪔 May your sales be as bright as the festival!**

---

*For technical support during deployment, refer to the codebase README files or contact your development team.*
