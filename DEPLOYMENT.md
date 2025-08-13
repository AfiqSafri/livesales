# Vercel Production Deployment Guide

## 🚀 Quick Start

### 1. Prepare Your Repository
- Ensure all code is committed and pushed to Git
- Make sure you have a clean working directory

### 2. Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure project settings:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add environment variables (see below)
6. Click "Deploy"

#### Option B: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## 🔧 Environment Variables

Add these in your Vercel project settings:

### Required Variables
```
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
```

### Optional Variables (based on your features)
```
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password

BILLPLZ_API_KEY=your-billplz-api-key
BILLPLZ_X_SIGNATURE_KEY=your-signature-key
BILLPLZ_COLLECTION_ID=your-collection-id
BILLPLZ_SANDBOX=false

UPLOAD_API_KEY=your-upload-api-key
```

## 🗄️ Database Setup

### Option 1: Vercel Postgres (Recommended)
1. In Vercel dashboard → Storage
2. Create new Postgres database
3. Copy connection string to `DATABASE_URL`
4. Run migrations after deployment

### Option 2: External Database
- Use Supabase, PlanetScale, or Railway
- Update `DATABASE_URL` in Vercel environment variables

## 📊 Post-Deployment Steps

### 1. Run Database Migrations
```bash
# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### 2. Verify Deployment
- [ ] Check all API routes work
- [ ] Test authentication flow
- [ ] Verify payment processing
- [ ] Test file uploads
- [ ] Check database connections

### 3. Monitor Performance
- Use Vercel Analytics
- Monitor database performance
- Check error logs

## 🐛 Common Issues & Solutions

### Prisma Client Generation
**Issue**: Prisma client not generated
**Solution**: Ensure `postinstall` script runs and `PRISMA_GENERATE_DATAPROXY` is set

### File Uploads
**Issue**: File uploads not working
**Solution**: Use cloud storage (Vercel Blob, AWS S3) instead of local storage

### Database Connection
**Issue**: Database connection failed
**Solution**: Verify `DATABASE_URL` is correct and accessible from Vercel

### Environment Variables
**Issue**: Environment variables not loading
**Solution**: Double-check all variables are set in Vercel dashboard

## 📋 Production Checklist

- [ ] Environment variables configured
- [ ] Database migrated and seeded
- [ ] File uploads configured for cloud storage
- [ ] Payment gateway configured for production
- [ ] Email service configured
- [ ] SSL certificate active
- [ ] Performance monitoring enabled
- [ ] Error tracking configured

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test locally with production environment
4. Check Prisma migration status
