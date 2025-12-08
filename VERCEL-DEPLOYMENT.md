# Vercel Deployment Guide

Complete guide for deploying OmniDev v3 to Vercel, including troubleshooting common issues.

## 📋 Prerequisites

- [Vercel account](https://vercel.com/signup)
- GitHub repository connected to Vercel
- API keys for AI providers you want to use

---

## 🚀 Quick Start

### 1. Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 2. Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select the repository: `OmniDev-v3`

### 3. Configure Build Settings

Vercel should auto-detect Next.js, but verify these settings:

```json
{
  "framework": "nextjs",
  "installCommand": "cd app && npm install",
  "buildCommand": "cd app && npm run build",
  "outputDirectory": "app/.next"
}
```

These are already configured in `/vercel.json`.

### 4. Configure Environment Variables

**Required for Authentication:**
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

**AI Provider API Keys (add the ones you need):**
```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...
XAI_API_KEY=...
MISTRAL_API_KEY=...
PERPLEXITY_API_KEY=...
TOGETHER_API_KEY=...
```

**Application Settings:**
```bash
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

#### How to Add Environment Variables in Vercel:

1. Go to your project in Vercel Dashboard
2. Click "Settings" → "Environment Variables"
3. Add each variable with its value
4. Select environments: Production, Preview, Development
5. Click "Save"

### 5. Deploy

```bash
# Using Vercel CLI
vercel --prod

# Or via GitHub
git push origin main  # Automatic deployment on push
```

---

## 🔧 Troubleshooting Common Issues

### Issue 1: Edge Runtime Errors with Gemini

**Symptoms:**
```
Error: The edge runtime does not support Node.js 'process' module
Module not found: Can't resolve 'fs'
```

**Solution:**
✅ **FIXED** - Chat API now uses Node.js runtime (not edge)

The issue was in `/app/app/api/chat/route.ts`:
```typescript
// ❌ Old (caused errors)
export const runtime = 'edge';

// ✅ Fixed
export const runtime = 'nodejs';
```

**Why:** Google Gemini SDK (`@ai-sdk/google`) requires Node.js APIs that aren't available in Edge Runtime.

---

### Issue 2: Missing Environment Variables

**Symptoms:**
```
503 Service Unavailable
OpenAI API key not configured
```

**Solution:**
1. Check environment variables are set in Vercel Dashboard
2. Redeploy after adding variables (they don't auto-apply)
3. Verify no typos in variable names

**Common Mistakes:**
- ❌ `OPENAI_API_KEY` with trailing space
- ❌ `GOOGLE_API_KEY=` (empty value)
- ❌ Variables set only for "Production" but testing in "Preview"

**Verification:**
Add this to any API route temporarily:
```typescript
console.log('API Keys:', {
  openai: !!process.env.OPENAI_API_KEY,
  google: !!process.env.GOOGLE_API_KEY,
});
```

Check logs in Vercel Dashboard → Deployments → [Your Deployment] → Functions.

---

### Issue 3: Build Failures

**Symptoms:**
```
npm ERR! code ELIFECYCLE
Type errors in app/...
```

**Solution:**

1. **Test build locally first:**
```bash
cd app
npm run build
```

2. **Fix TypeScript errors:**
```bash
npm run type-check
```

3. **Clear build cache in Vercel:**
   - Go to Vercel Dashboard → Settings → General
   - Scroll to "Build & Development Settings"
   - Enable "Clear cache before building"

4. **Update dependencies:**
```bash
npm audit fix
npm install
```

---

### Issue 4: Supabase Authentication Fails

**Symptoms:**
```
Failed to fetch user
Unauthorized access
```

**Solution:**

1. **Verify Supabase Environment Variables:**
```bash
# Must be exactly as shown in Supabase dashboard
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

2. **Check Supabase Authentication Settings:**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add Vercel domain to "Site URL" and "Redirect URLs":
     ```
     https://your-app.vercel.app
     https://your-app.vercel.app/auth/callback
     ```

3. **Enable Email/Social Auth:**
   - Supabase Dashboard → Authentication → Providers
   - Enable desired auth methods

---

### Issue 5: API Routes Timeout

**Symptoms:**
```
504 Gateway Timeout
Function exceeded timeout
```

**Solution:**

1. **Check function timeout settings:**
   - Free plan: 10s max
   - Pro plan: 60s max
   - Enterprise: 900s max

2. **Optimize API routes:**
```typescript
// Set appropriate timeout
export const maxDuration = 60; // seconds
```

3. **Use streaming for long operations:**
```typescript
// Chat API already uses streaming
return result.toTextStreamResponse();
```

4. **Upgrade Vercel plan if needed** for longer timeouts.

---

### Issue 6: CORS Errors

**Symptoms:**
```
Access-Control-Allow-Origin header missing
CORS policy blocked
```

**Solution:**

Add CORS headers to API routes:
```typescript
export async function POST(req: Request) {
  const headers = {
    'Access-Control-Allow-Origin': 'https://your-app.vercel.app', // For production, replace with your specific domain
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  // Your logic here
  return Response.json(data, { headers });
}
```

---

### Issue 7: High Severity npm Vulnerabilities

**Symptoms:**
```
3 high severity vulnerabilities
glob: command injection vulnerability
```

**Solution:**
✅ **FIXED** - Dependencies updated

```bash
cd app
npm audit fix --force
```

**What was fixed:**
- glob vulnerability (CVE-2024-XXXX)
- eslint-config-next upgraded to v16.0.7
- @typescript-eslint packages upgraded to v8.x
- ESLint upgraded to v9.x

---

### Issue 8: Deployment Succeeds but App Crashes

**Symptoms:**
- Build succeeds ✓
- Deployment succeeds ✓
- App shows 500 error when visited

**Solution:**

1. **Check Function Logs:**
   - Vercel Dashboard → Deployments → [Latest] → Functions
   - Look for runtime errors

2. **Common Runtime Errors:**

   **Error:** `Cannot find module '@ai-sdk/google'`
   ```bash
   # Make sure package.json includes all dependencies
   npm install @ai-sdk/google
   ```

   **Error:** `process.env.OPENAI_API_KEY is undefined`
   - Add environment variable in Vercel Dashboard
   - Redeploy

   **Error:** `Supabase client initialization failed`
   - Check `NEXT_PUBLIC_SUPABASE_URL` format
   - Must include `https://` and `.supabase.co`

3. **Test locally with production build:**
```bash
npm run build
npm run start
```

---

### Issue 9: Static Generation Warnings

**Symptoms:**
```
⚠ Using edge runtime on a page currently disables static generation
```

**Solution:**
This is expected for dynamic routes. To suppress warnings:

```typescript
// For fully dynamic pages
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
```

Image and Video generation APIs use edge runtime and show this warning - it's safe to ignore.

---

### Issue 10: Large Bundle Size / Slow Load Times

**Symptoms:**
- First Load JS > 500 kB
- Lighthouse score < 50

**Solution:**

1. **Enable Image Optimization:**
```typescript
// Already configured in next.config.mjs
images: {
  remotePatterns: [/* ... */]
}
```

2. **Use dynamic imports for heavy components:**
```typescript
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
});
```

3. **Analyze bundle:**
```bash
npm install -D @next/bundle-analyzer
```

Add to `next.config.mjs`:
```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
```

Run: `ANALYZE=true npm run build`

---

## 📊 Monitoring & Debugging

### Vercel Function Logs

**Access logs:**
1. Vercel Dashboard → Deployments
2. Click on deployment
3. Select "Functions" tab
4. Click on function name (e.g., `api/chat`)

**Common log patterns:**

✅ **Success:**
```
200 /api/chat 1.2s
```

❌ **Error:**
```
500 /api/chat 0.5s
Error: OPENAI_API_KEY is not defined
```

### Real-time Debugging

**Use Vercel CLI:**
```bash
vercel logs your-project-name --follow
```

**Filter logs:**
```bash
vercel logs --since 1h  # Last hour
vercel logs --until 2h  # Up to 2 hours ago
```

---

## 🔒 Security Best Practices

### 1. Environment Variables

✅ **Do:**
- Store API keys only in Vercel environment variables
- Use separate keys for production/preview/development
- Rotate keys regularly

❌ **Don't:**
- Commit API keys to Git
- Expose keys in client-side code
- Share production keys with team members

### 2. API Route Protection

Already implemented in `/app/api/usage/route.ts`:
```typescript
const user = await getUser(req);
if (!user) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}
```

Apply similar patterns to other sensitive routes.

### 3. Rate Limiting

Consider adding rate limiting to API routes:
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});
```

---

## 🎯 Performance Optimization

### Enable Compression

Already configured via Vercel's automatic compression.

### Add Security Headers

Already configured in `next.config.mjs`:
```javascript
headers: [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
]
```

**Recommended additions:**
```javascript
{
  key: 'Strict-Transport-Security',
  value: 'max-age=31536000; includeSubDomains'
},
{
  key: 'Content-Security-Policy',
  value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
}
```

### Enable Edge Caching

For static pages, add:
```typescript
export const revalidate = 3600; // 1 hour
```

---

## 📝 Deployment Checklist

Before deploying to production:

- [ ] All environment variables configured
- [ ] Build succeeds locally (`npm run build`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Tests pass (`npm test`)
- [ ] Supabase redirect URLs updated
- [ ] API keys tested in preview deployment
- [ ] Security headers configured
- [ ] Error monitoring enabled (Sentry/LogRocket)
- [ ] Performance tested (Lighthouse score > 80)

---

## 🆘 Getting Help

### Still Having Issues?

1. **Check Vercel Status:** https://www.vercel-status.com/
2. **Vercel Documentation:** https://vercel.com/docs
3. **Community Support:** https://github.com/vercel/next.js/discussions
4. **Project Issues:** https://github.com/SeanVasey/OmniDev-v3/issues

### Useful Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# Check environment variables
vercel env ls

# Add environment variable
vercel env add

# Inspect build
vercel inspect [deployment-url]
```

---

## 📚 Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Platform Limits](https://vercel.com/docs/concepts/limits/overview)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [AI SDK Documentation](https://sdk.vercel.ai/docs)

---

**Last Updated:** December 8, 2025
**Version:** 3.0.0

For questions or contributions, please open an issue on GitHub.
