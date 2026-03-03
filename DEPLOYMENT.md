# 🚀 RentWear Deployment Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Testing](#testing)

---

## 🎯 Prerequisites

### Required Accounts
- **GitHub**: https://github.com (free)
- **MongoDB Atlas**: https://www.mongodb.com/atlas (free tier)
- **Cloudinary**: https://cloudinary.com (free tier)
- **Vercel/Netlify**: For frontend (free)
- **Railway/Render**: For backend (free tier)

### Required Tools
- Git installed locally
- Node.js 14+ installed locally

---

## 🗃 Database Setup

### MongoDB Atlas Configuration

1. **Create Account**: https://www.mongodb.com/atlas
2. **Create Cluster**:
   - Choose M0 Sandbox (free)
   - Select cloud provider and region
3. **Create Database User**:
   - Username: `rentwear-admin`
   - Password: Generate strong password
4. **Network Access**:
   - Add IP: `0.0.0.0/0` (allows all access)
5. **Get Connection String**:
   ```
   mongodb+srv://rentwear-admin:PASSWORD@cluster0.xxxxx.mongodb.net/rentwear-production?retryWrites=true&w=majority
   ```

---

## 🖼 Image Storage Setup

### Cloudinary Configuration

1. **Create Account**: https://cloudinary.com
2. **Get Credentials** from Dashboard:
   - Cloud name
   - API Key  
   - API Secret

---

## 🔧 Backend Deployment Options

### Option 1: Railway (Recommended - Free)

1. **Go to**: https://railway.app
2. **Sign Up** with GitHub
3. **Deploy from GitHub**:
   - Connect your repository
   - Select root folder
   - Set environment variables
4. **Environment Variables**:
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://rentwear-admin:PASSWORD@cluster0.xxxxx.mongodb.net/rentwear-production
   JWT_SECRET=your-super-secure-jwt-secret
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   NODE_ENV=production
   ```

### Option 2: Render (Alternative - Free)

1. **Go to**: https://render.com
2. **Connect GitHub Repository**
3. **Create Web Service**:
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
4. **Set Environment Variables**

---

## 🌐 Frontend Deployment Options

### Option 1: Vercel (Recommended - Free)

1. **Go to**: https://vercel.com
2. **Install Vercel CLI**: `npm i -g vercel`
3. **Deploy**:
   ```bash
   cd client
   vercel --prod
   ```
4. **Set Environment Variable**:
   ```
   REACT_APP_API_URL=https://your-backend-url.railway.app
   ```

### Option 2: Netlify (Alternative - Free)

1. **Go to**: https://netlify.com
2. **Drag and Drop**: Drop the `client/build` folder
3. **Set Environment Variables** in Netlify dashboard

---

## ⚙️ Environment Configuration

### Backend Environment Variables
```env
PORT=5000
MONGODB_URI=mongodb+srv://rentwear-admin:PASSWORD@cluster0.xxxxx.mongodb.net/rentwear-production
JWT_SECRET=your-super-secure-jwt-secret-for-production
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.vercel.app
```

### Frontend Environment Variables
```env
REACT_APP_API_URL=https://your-backend-domain.railway.app
```

---

## 🚀 Step-by-Step Deployment

### Step 1: Prepare Repository
```bash
# Initialize Git if not already done
git init
git add .
git commit -m "Initial commit - Ready for deployment"

# Push to GitHub
git remote add origin https://github.com/yourusername/rentwear.git
git push -u origin main
```

### Step 2: Deploy Backend (Railway)
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Set environment variables
5. Click "Deploy"

### Step 3: Deploy Frontend (Vercel)
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - Framework: Create React App
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `build`
5. Add environment variable: `REACT_APP_API_URL`
6. Click "Deploy"

### Step 4: Update CORS Settings
In your backend, update the CORS origin:
```javascript
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://your-frontend-domain.vercel.app',
  credentials: true
}));
```

---

## 🧪 Testing Your Deployment

### 1. Backend Health Check
```bash
curl https://your-backend-url.railway.app/api/health
```
Expected response:
```json
{"status":"OK","timestamp":"2024-01-01T00:00:00.000Z"}
```

### 2. Frontend Access
Visit: https://your-frontend-domain.vercel.app

### 3. Admin Access
1. Create admin account on deployed site
2. Or run admin creation script on production:
```bash
node server/create-admin.js
```

---

## 🔒 Security Best Practices

### 1. Environment Variables
- Never commit `.env` files
- Use strong, unique secrets
- Rotate keys regularly

### 2. Database Security
- Use MongoDB Atlas (not local MongoDB)
- Enable authentication
- Use whitelist IP addresses

### 3. API Security
- Enable rate limiting
- Validate all inputs
- Use HTTPS only

---

## 📊 Monitoring

### Railway (Backend)
- Built-in logs and metrics
- Error tracking
- Performance monitoring

### Vercel (Frontend)
- Analytics dashboard
- Performance metrics
- Error tracking

---

## 🔄 CI/CD Pipeline

### Automatic Deployments
Both Railway and Vercel offer:
- GitHub integration
- Automatic deployments on push
- Preview deployments for PRs

---

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CLIENT_URL environment variable
   - Ensure frontend URL is whitelisted

2. **Database Connection**
   - Verify MongoDB URI is correct
   - Check IP whitelist in Atlas

3. **Build Failures**
   - Check logs in deployment platform
   - Verify all dependencies are installed

4. **Environment Variables**
   - Ensure all required variables are set
   - Check for typos in variable names

---

## 📞 Support

### Platform Support
- **Railway**: https://railway.app/help
- **Vercel**: https://vercel.com/help
- **MongoDB Atlas**: https://docs.mongodb.com/atlas
- **Cloudinary**: https://cloudinary.com/documentation

### Community Support
- GitHub Issues: Create issues in your repository
- Stack Overflow: Tag with relevant platform names

---

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ Backend health endpoint returns 200
- ✅ Frontend loads without errors
- ✅ Users can register and login
- ✅ Admin dashboard is accessible
- ✅ Image uploads work correctly
- ✅ All pages load properly

---

## 📈 Next Steps

After successful deployment:
1. **Set up custom domain**
2. **Configure SSL certificates**
3. **Set up monitoring alerts**
4. **Implement backup strategy**
5. **Set up analytics tracking**
6. **Consider CDN for static assets**

---

**🚀 Your RentWear marketplace is now live!**
