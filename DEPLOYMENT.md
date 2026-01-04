# Deployment Guide

This guide covers deploying the SME Exit Readiness Assessment application to production hosting.

## Vercel Deployment (Recommended)

Vercel provides the best experience for Angular applications with automatic SPA routing, instant deployments, and global CDN.

### Prerequisites

- Vercel account (free tier available at [vercel.com](https://vercel.com))
- Git repository (GitHub, GitLab, or Bitbucket)
- Node.js 18+ installed locally

### Method 1: Git Integration (Recommended)

This method provides automatic deployments on every push to your main branch.

#### Step 1: Push to Git Repository

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: SME Exit Readiness Assessment"

# Add remote (replace with your repository URL)
git remote add origin https://github.com/your-username/exit-readiness-assessment.git

# Push to main branch
git push -u origin main
```

#### Step 2: Connect to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your repository
4. Configure project:
   - **Framework Preset**: Angular (auto-detected)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist/exit-readiness-assessment/browser` (auto-detected from `vercel.json`)
   - **Install Command**: `npm install` (auto-detected)
5. Click "Deploy"

#### Step 3: Verify Deployment

Vercel will:
- Install dependencies
- Run the build
- Deploy to a production URL (e.g., `your-project.vercel.app`)
- Set up automatic deployments for future pushes

### Method 2: Vercel CLI

For one-time deployments or testing.

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

#### Step 3: Deploy

```bash
# Navigate to project directory
cd Exit-Readiness-Assessment

# Deploy to preview environment
vercel

# Deploy to production
vercel --prod
```

The CLI will:
- Detect Angular configuration
- Build the project
- Upload to Vercel
- Provide a deployment URL

## Alternative Hosting Options

### Netlify

1. **Create `netlify.toml` in project root:**

```toml
[build]
  command = "npm run build"
  publish = "dist/exit-readiness-assessment/browser"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. **Deploy via Netlify CLI or Git integration**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist/exit-readiness-assessment/browser
```

### AWS Amplify

1. Connect Git repository in AWS Amplify Console
2. Configure build settings:
   - **Build command**: `npm run build`
   - **Output directory**: `dist/exit-readiness-assessment/browser`
3. Add redirects in `amplify.yml`:

```yaml
version: 1
frontend:
  phases:
    build:
      commands:
        - npm install
        - npm run build
  artifacts:
    baseDirectory: dist/exit-readiness-assessment/browser
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### GitHub Pages

Not recommended for Angular apps with routing, but possible with hash-based routing.

1. **Install angular-cli-ghpages:**

```bash
npm install -g angular-cli-ghpages
```

2. **Build and deploy:**

```bash
npm run build -- --base-href=/exit-readiness-assessment/
npx angular-cli-ghpages --dir=dist/exit-readiness-assessment/browser
```

## Build Optimization

### Production Build Settings

The application is optimized for production builds:

- **Tree-shaking**: Removes unused code
- **Minification**: Reduces file sizes
- **AOT compilation**: Ahead-of-time compilation for faster loading
- **Lazy loading**: Components load on demand
- **Asset optimization**: Images and fonts optimized

### Build Performance Tips

```bash
# Standard production build
npm run build

# Build with source maps (debugging)
npm run build -- --source-map

# Build with verbose logging
npm run build -- --verbose

# Analyze bundle size
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/exit-readiness-assessment/browser/stats.json
```

## Environment Variables

This application does not require environment variables for deployment. All configuration is stored in:
- `public/assessment.json` - Assessment data
- `src/app/models/valuation-tiers.ts` - Valuation tier definitions

To add environment variables in the future:
1. Create `src/environments/environment.prod.ts`
2. Configure in Angular CLI
3. Set in Vercel dashboard under "Environment Variables"

## Custom Domain

### Vercel Custom Domain

1. Go to your project in Vercel dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain (e.g., `exitreadiness.com`)
4. Update DNS records as instructed:
   - **CNAME**: Point `www` to `cname.vercel-dns.com`
   - **A Record**: Point `@` to Vercel IP (provided)
5. Wait for DNS propagation (up to 24 hours)

### SSL/TLS

Vercel automatically provisions SSL certificates via Let's Encrypt. No additional configuration needed.

## Monitoring & Analytics

### Vercel Analytics

1. Enable in Vercel dashboard: Settings → Analytics
2. View real-time performance metrics
3. Track Core Web Vitals

### Google Analytics

Add to `src/index.html`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Error Tracking

Consider integrating Sentry for production error tracking:

```bash
npm install @sentry/angular
```

## Rollback Procedures

### Vercel Rollback

1. Go to Vercel dashboard → Deployments
2. Find previous successful deployment
3. Click "..." → "Promote to Production"
4. Confirm rollback

### Git Rollback

```bash
# Revert to previous commit
git revert HEAD

# Push to trigger new deployment
git push origin main
```

## Performance Monitoring

### Lighthouse Audit

Run Lighthouse on deployed URL:

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://your-domain.com --view
```

**Target scores:**
- Performance: >90
- Accessibility: >95
- Best Practices: >90
- SEO: >90

### Core Web Vitals

Monitor in Google Search Console and Vercel Analytics:
- **LCP** (Largest Contentful Paint): <2.5s
- **FID** (First Input Delay): <100ms
- **CLS** (Cumulative Layout Shift): <0.1

## Troubleshooting

### Build Fails

**Error: "Module not found"**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error: "Out of memory"**
```bash
# Increase Node memory
export NODE_OPTIONS="--max_old_space_size=4096"
npm run build
```

### Routing Issues

**404 errors on page refresh:**
- Ensure `vercel.json` has correct redirects
- Check output directory matches configuration

### Slow Load Times

- Enable compression in hosting platform
- Optimize images (use WebP format)
- Implement lazy loading for routes
- Use CDN for static assets

## Deployment Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] Build succeeds locally (`npm run build`)
- [ ] No console errors in production mode
- [ ] All 36 questions defined and tested
- [ ] Threshold detection working
- [ ] Valuation tier comparison accurate
- [ ] Code generation/restoration tested
- [ ] Print functionality working
- [ ] Mobile responsive (tested on 375px, 768px, 1024px)
- [ ] Cross-browser tested (Chrome, Firefox, Safari, Edge)
- [ ] Lighthouse scores meet targets
- [ ] SSL certificate configured
- [ ] Custom domain configured (if applicable)
- [ ] Analytics enabled
- [ ] Error tracking enabled
- [ ] Monitoring dashboard configured

## Post-Deployment

After successful deployment:

1. **Smoke Test**: Complete full assessment end-to-end
2. **Test All Features**:
   - Code generation and restoration
   - Threshold violation warnings
   - Valuation tier assessment
   - Timeline guidance
   - Sector comparison
   - Print functionality
3. **Monitor Metrics**: Check Vercel Analytics and error logs
4. **Share URL**: Distribute to initial test users
5. **Gather Feedback**: Monitor for issues and user feedback

## Maintenance

### Regular Updates

```bash
# Update dependencies monthly
npm update

# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### Content Updates

To update assessment questions or guidance:
1. Edit `public/assessment.json`
2. Test locally
3. Commit and push (triggers automatic deployment)
4. Verify changes in production

See [CONTENT-UPDATE-GUIDE.md](./CONTENT-UPDATE-GUIDE.md) for detailed instructions.

## Support

For deployment issues:
- Check Vercel deployment logs
- Review GitHub Actions (if using)
- Open issue in repository
- Contact support@vercel.com (for Vercel-specific issues)
