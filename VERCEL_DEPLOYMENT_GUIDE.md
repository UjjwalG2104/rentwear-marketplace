# 🚀 Vercel Frontend Deployment Guide

## 📋 Step-by-Step Vercel Deployment

### Step 1: Prepare Your Repository

First, make sure your code is on GitHub:

```bash
# If you haven't already, initialize Git and push to GitHub
git init
git add .
git commit -m "Ready for Vercel deployment"
git branch -M main
git remote add origin https://github.com/yourusername/rentwear.git
git push -u origin main
```

### Step 2: Sign Up for Vercel

1. **Go to**: https://vercel.com
2. **Click "Sign Up"**
3. **Choose "Continue with GitHub"**
4. **Authorize Vercel** to access your GitHub repositories
5. **Choose your plan** (Free is perfect for starters)

### Step 3: Import Your Project

1. **Click "New Project"** on your Vercel dashboard
2. **Find your repository** (`rentwear` or whatever you named it)
3. **Click "Import"**

### Step 4: Configure Project Settings

#### **Basic Settings:**
- **Project Name**: `rentwear-marketplace` (or your preferred name)
- **Framework Preset**: **Create React App** (Vercel should detect this automatically)
- **Root Directory**: `client` (IMPORTANT - this points to your React app)
- **Build Command**: `npm run build` (should be auto-detected)
- **Output Directory**: `build` (should be auto-detected)
- **Install Command**: `npm install` (should be auto-detected)

#### **Environment Variables:**
Click "Add Environment Variable" and add:
```
Variable Name: REACT_APP_API_URL
Value: https://your-backend-url.railway.app
Environment: Production, Preview, Development
```

**Note**: Replace `your-backend-url.railway.app` with your actual Railway backend URL once deployed.

### Step 5: Deploy

1. **Review all settings**
2. **Click "Deploy"**
3. **Wait for deployment** (usually takes 2-3 minutes)

### Step 6: Get Your URL

After deployment, Vercel will give you:
- **Production URL**: `https://your-project-name.vercel.app`
- **Preview URLs**: For future deployments

---

## 🔧 Common Vercel Issues & Solutions

### Issue 1: Build Fails
**Solution**: Check the build logs in Vercel dashboard
- Make sure all dependencies are in `client/package.json`
- Check for any TypeScript errors
- Verify environment variables are correct

### Issue 2: API Calls Not Working
**Solution**: 
1. Make sure `REACT_APP_API_URL` is set correctly
2. Check that your backend is deployed and accessible
3. Verify CORS settings on your backend

### Issue 3: White Screen After Deployment
**Solution**:
1. Check browser console for errors
2. Verify all routes are working
3. Make sure `package.json` has correct `homepage` field

---

## 🌐 Custom Domain Setup (Optional)

### Step 1: Add Custom Domain
1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your custom domain (e.g., `rentwear.com`)

### Step 2: Update DNS
1. Vercel will give you DNS records
2. Go to your domain registrar (GoDaddy, Namecheap, etc.)
3. Add the DNS records provided by Vercel

### Step 3: SSL Certificate
Vercel automatically provides SSL certificates for all domains.

---

## 📊 Vercel Features You Should Know

### **Automatic Deployments**
- Every push to main branch triggers deployment
- Pull requests get preview URLs
- Rollback to previous deployments

### **Analytics**
- Page views and visitors
- Performance metrics
- Web Vitals

### **Environment Variables**
- Different variables for different environments
- Secure storage of sensitive data
- Easy updates without redeployment

---

## 🧪 Testing Your Vercel Deployment

### 1. Basic Functionality Test
Visit your Vercel URL and check:
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] All pages accessible
- [ ] Mobile responsive

### 2. API Integration Test
- [ ] Login/Register forms work
- [ ] Data loads from backend
- [ ] No CORS errors in console

### 3. Performance Test
- [ ] Page load time < 3 seconds
- [ ] No console errors
- [ ] Images load properly

---

## 🔄 Updating Your Deployment

### Automatic Updates
```bash
# Make changes to your code
git add .
git commit -m "Update: Add new feature"
git push origin main
```
Vercel will automatically detect the push and redeploy.

### Manual Redeploy
1. Go to your Vercel dashboard
2. Click your project
3. Click "Redeploy" or "Deployments" → "Redeploy"

---

## 📱 Vercel Mobile App

Download the Vercel mobile app to:
- Monitor deployments
- View logs
- Manage projects on the go

---

## 🆘 Vercel Support

### Documentation
- **Vercel Docs**: https://vercel.com/docs
- **React Deployment**: https://vercel.com/docs/frameworks/react

### Community
- **Discord**: https://vercel.com/discord
- **GitHub Issues**: https://github.com/vercel/vercel/issues

---

## ✅ Vercel Deployment Checklist

### Before Deployment
- [ ] Code pushed to GitHub
- [ ] `client/package.json` has all dependencies
- [ ] Build works locally (`npm run build`)
- [ ] Environment variables identified

### During Deployment
- [ ] Root directory set to `client`
- [ ] Framework preset: Create React App
- [ ] `REACT_APP_API_URL` environment variable set
- [ ] Build completes successfully

### After Deployment
- [ ] Website loads at Vercel URL
- [ ] All pages work correctly
- [ ] API integration functional
- [ ] Mobile responsive
- [ ] No console errors

---

## 🎉 Success!

Your RentWear frontend is now live on Vercel! 🚀

### What You Get:
- **Blazing fast CDN** for static assets
- **Automatic HTTPS** and SSL certificates
- **Global CDN** for fast loading worldwide
- **Automatic deployments** from GitHub
- **Preview deployments** for pull requests
- **Analytics** and performance monitoring

### Next Steps:
1. **Test thoroughly** on the deployed URL
2. **Set up custom domain** (optional)
3. **Monitor performance** in Vercel dashboard
4. **Deploy backend** to Railway/Render

---

**🌐 Your frontend will be available at: `https://your-project-name.vercel.app`**
