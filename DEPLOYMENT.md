# 🚀 Deployment Guide

## Supabase Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project
3. Wait for project to be ready

### 2. Database Setup
1. Go to SQL Editor in Supabase dashboard
2. Copy and paste the entire content from `supabase-schema.sql`
3. Run the SQL to create tables and policies

### 3. Get Credentials
1. Go to Settings > API
2. Copy Project URL and anon public key
3. Update your `.env.local` file

## Vercel Deployment

### 1. Prepare for Deployment
```bash
npm run build  # Test build locally
```

### 2. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set build command: npm run build
# - Set output directory: .next
```

### 3. Environment Variables
In Vercel dashboard:
1. Go to Project Settings > Environment Variables
2. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your_supabase_url
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your_supabase_anon_key

### 4. Custom Domain (Optional)
1. Go to Project Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Alternative Deployments

### Netlify
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variables in site settings

### Railway
1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically on push

## Post-Deployment Checklist

- [ ] Test user registration
- [ ] Test login/logout
- [ ] Test role-based routing
- [ ] Test appointment booking
- [ ] Test prescription management
- [ ] Verify database connections
- [ ] Check responsive design on mobile

## Troubleshooting

### Common Issues

**Build Errors:**
- Check TypeScript errors: `npm run type-check`
- Verify all imports are correct
- Ensure environment variables are set

**Database Connection:**
- Verify Supabase URL and key
- Check RLS policies are enabled
- Ensure tables exist

**Authentication Issues:**
- Check Supabase Auth settings
- Verify redirect URLs in Supabase dashboard
- Test with different browsers

### Performance Optimization

1. **Enable Supabase Connection Pooling**
2. **Add Database Indexes** (already included in schema)
3. **Optimize Images** with Next.js Image component
4. **Enable Vercel Analytics** for monitoring

## Monitoring

### Supabase Dashboard
- Monitor database usage
- Check API requests
- Review authentication logs

### Vercel Analytics
- Track page performance
- Monitor user interactions
- Review deployment logs

## Backup Strategy

1. **Database Backups**: Supabase provides automatic backups
2. **Code Backups**: Use Git with multiple remotes
3. **Environment Variables**: Keep secure backup of credentials

## Security Checklist

- [ ] RLS policies enabled on all tables
- [ ] Environment variables secured
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Regular dependency updates
- [ ] Monitor Supabase security advisories