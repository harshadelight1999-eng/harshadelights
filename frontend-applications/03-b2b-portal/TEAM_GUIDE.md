# 📦 Harsha Delights B2B Portal - Team Guide

## Quick Start for Product Management

This guide will help you manage products, categories, and prices for the Harsha Delights online store.

---

## 🔐 Logging In

1. Go to: `https://portal.harshadelights.com`
2. Click "Sign In"
3. Use your WorkOS credentials (ask admin if you don't have access)
4. You'll be redirected to the dashboard

---

## ➕ Adding a New Product

### Step 1: Navigate to Products
1. Click "Products" in the sidebar
2. Click the "Add Product" button (top right)

### Step 2: Fill Basic Information

**Product Title** (Required)
- Example: "Kaju Katli Premium Box"
- Keep it clear and descriptive
- Include key features (Premium, Special, etc.)

**Product Handle** (Auto-generated)
- This creates the URL: `shop.harshadelights.com/products/kaju-katli-premium-box`
- Usually auto-filled, you can edit if needed
- Use lowercase, hyphens instead of spaces

**Category** (Required)
- Select from dropdown:
  - Sweets
  - Chocolates
  - Namkeens
  - Dry Fruits
  - Gift Hampers
  - Diwali Specials

**Description** (Required)
- Describe the product clearly
- Mention ingredients, taste, occasion
- Example:
  ```
  Premium Kaju Katli made from pure cashews and sugar.
  Perfect for Diwali celebrations and gifting.
  Freshly prepared with traditional recipes.
  ```

**Status**
- **Active**: Product shows on website
- **Draft**: Product hidden, still being prepared
- **Inactive**: Temporarily hidden

**Featured Product**
- ☑️ Check this for Diwali specials or bestsellers
- Featured products appear prominently on homepage

### Step 3: Add Product Variants

Click "Variants" tab. Add different sizes/weights:

**Example for Sweets:**
| Variant Title | Weight | Weight Unit | Price (₹) | Stock | SKU (optional) |
|--------------|--------|-------------|-----------|-------|----------------|
| Small Box | 250 | g | 250 | 100 | KK-250 |
| Medium Box | 500 | g | 450 | 150 | KK-500 |
| Large Box | 1000 | g | 850 | 80 | KK-1000 |

**Fields:**
- **Variant Title**: "250g Box", "500g Box", "1kg Box"
- **Price**: Regular selling price
- **Compare at Price** (optional): Original price for showing discount
  - If compare price is ₹500 and price is ₹450, shows "10% OFF"
- **Stock Quantity**: How many units available
- **Weight & Unit**: 250g, 500g, 1kg, etc.
- **SKU** (optional): Your internal product code

### Step 4: Upload Images

1. Click "Browse" or drag & drop
2. Upload at least 3 images:
   - Front view (product packaging)
   - Close-up (product detail)
   - Context (product in setting/use)
3. Maximum 10 images per product
4. Recommended size: 1000x1000px
5. Format: JPG, PNG, WebP

**Image Tips:**
- Good lighting, clear focus
- Show product packaging and actual product
- Include size reference if possible
- Professional photos work best

### Step 5: Save Product

1. Review all information
2. Click "Create Product" button (bottom right)
3. Product appears on website within seconds!

---

## ✏️ Editing Existing Products

### Update Product Information
1. Go to Products page
2. Find your product (use search if needed)
3. Click the edit icon (pencil)
4. Make changes
5. Click "Update Product"

### Quick Price Update (Important for Diwali!)
1. Find product → Click Edit
2. Go to "Variants" tab
3. Update Price field
4. Optionally add "Compare at Price" for discount display
5. Click "Update Product"
6. **Changes are live immediately!**

### Update Stock Levels
1. Edit product → Variants tab
2. Change "Stock Quantity" number
3. Set to 0 if out of stock (product shows "Out of Stock")
4. Update Product

---

## 🏷️ Managing Categories

### View Categories
1. Click "Categories" in sidebar
2. See all product categories

### Add New Category (for Diwali Specials)
1. Click "Add Category"
2. Enter:
   - **Name**: "Diwali Specials"
   - **Handle**: "diwali-specials" (auto-generated)
   - **Description**: Brief description
3. Click "Create Category"

### Assigning Products to Categories
- When creating/editing product
- Select category from dropdown
- Products can belong to multiple categories

---

## 💰 Pricing Strategies

### Regular Pricing
- Set competitive market prices
- Check competitor prices
- Account for preparation, packaging costs

### Diwali Special Pricing
Use "Compare at Price" to show discounts:

**Example:**
- Regular Price (Compare at): ₹500
- Diwali Price: ₹450
- Website shows: "₹450 ~~₹500~~ (10% OFF)"

### Bulk/Wholesale Pricing (Advanced)
- Go to "Bulk Pricing" tab when editing product
- Add tiers:
  - 10-20 units: ₹400 each
  - 21-50 units: ₹350 each
  - 51+ units: ₹300 each

---

## 📸 Image Best Practices

### Do's ✅
- Use bright, natural lighting
- Clean, uncluttered background
- Show product clearly
- Include packaging and actual product
- Use consistent style across all products
- Compress images (< 500KB each)

### Don'ts ❌
- Blurry or dark photos
- Messy backgrounds
- Watermarks from other sites
- Extremely large files (> 5MB)
- Too few images (minimum 3)

---

## 🔍 Product Organization Tips

### Naming Convention
- Be consistent: "Product Name + Size/Variant"
- Example:
  - "Kaju Katli Premium Box"
  - "Gulab Jamun Family Pack"
  - "Dry Fruit Mix Deluxe"

### Use Status Effectively
- **Active**: Ready to sell
- **Draft**: Still preparing (photos, prices, etc.)
- **Inactive**: Temporarily unavailable (seasonal items)

### SKU System (Optional but Recommended)
Create simple SKU codes:
- Category Code (2 letters) + Product Code (2 letters) + Size
- Examples:
  - `SW-KK-250` (Sweets - Kaju Katli - 250g)
  - `CH-BC-500` (Chocolates - Belgian Chocolate - 500g)
  - `DF-CA-1000` (Dry Fruits - Cashew - 1kg)

---

## 🎯 Quick Tasks for Diwali

### Morning Routine (5-10 minutes)
1. Check stock levels for popular items
2. Update any low stock products
3. Check for new orders via WhatsApp
4. Respond to customer inquiries

### Adding Diwali Specials
1. Create "Diwali Specials" category if not exists
2. Add featured Diwali products:
   - Gift hampers
   - Festival sweets packs
   - Premium dry fruit boxes
3. Mark as "Featured"
4. Add attractive product images
5. Set competitive Diwali pricing

### Daily Price Updates
1. Monitor competitor prices
2. Adjust prices if needed (stay competitive)
3. Add limited-time discounts using "Compare at Price"
4. Update stock after fulfilling orders

---

## 🚨 Common Issues & Solutions

### "Product not showing on website"
- ✅ Check Status is "Active" (not Draft/Inactive)
- ✅ Ensure at least one variant has stock > 0
- ✅ Verify category is assigned
- ✅ Refresh website (Ctrl+F5)

### "Images not uploading"
- ✅ Check file size (< 5MB each)
- ✅ Use JPG or PNG format
- ✅ Try different browser (Chrome recommended)
- ✅ Check internet connection

### "Price not updating"
- ✅ Click "Update Product" after changes
- ✅ Clear browser cache
- ✅ Wait 30 seconds and refresh
- ✅ Check correct variant was updated

### "Out of Stock" showing incorrectly
- ✅ Check variant stock quantity > 0
- ✅ Update product after changing stock
- ✅ Verify correct variant selected

---

## 📞 Need Help?

### Technical Issues
- Portal not loading
- Can't login
- Features not working
- Images failing to upload

**Contact:** Your IT/Tech Team

### Product Questions
- What price to set?
- Which category to use?
- How to describe products?

**Contact:** Sales/Marketing Team Lead

### Urgent Issues
- Website down
- Orders not going through
- Critical product errors

**Contact:** Admin immediately

---

## 🎉 Tips for Success

1. **Consistency is Key**
   - Use similar naming across products
   - Maintain consistent image quality
   - Update regularly (daily during Diwali)

2. **Customer-First Thinking**
   - Write clear, helpful descriptions
   - Show accurate product images
   - Price competitively
   - Keep stock updated

3. **Stay Organized**
   - Use categories effectively
   - Keep SKUs consistent
   - Mark seasonal items appropriately
   - Archive old products (set to Inactive)

4. **Quick Updates**
   - Most changes take 30 seconds
   - No need to "publish" - changes are instant
   - Test on website after major changes

---

## 📋 Daily Checklist (Diwali Season)

**Morning (9:00 AM):**
- [ ] Check B2B Portal dashboard
- [ ] Review low stock alerts
- [ ] Update stock levels for sold items
- [ ] Check WhatsApp for overnight orders

**Afternoon (2:00 PM):**
- [ ] Add any new Diwali products
- [ ] Update prices if needed
- [ ] Respond to product questions
- [ ] Check competitor pricing

**Evening (6:00 PM):**
- [ ] Review today's orders
- [ ] Update stock after fulfillment
- [ ] Prepare for next day
- [ ] Mark out-of-stock items

---

**Remember:** The B2B portal is your control center. Every change you make here appears on the customer-facing website immediately. Keep it updated, accurate, and customer-friendly!

**Happy Selling! 🎆**
