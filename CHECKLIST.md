# Setup Checklist ✓

Run through this checklist to ensure everything is working:

## ✅ Files Created
- [x] `package.json` - Dependencies
- [x] `tsconfig.json` - TypeScript config
- [x] `tailwind.config.ts` - Tailwind config
- [x] `postcss.config.mjs` - PostCSS config
- [x] `next.config.mjs` - Next.js config
- [x] `app/globals.css` - Global styles with Pulse & Slate colors
- [x] `app/layout.tsx` - Root layout
- [x] `.env.local` - Environment variables (you need to create this)

## ✅ Installation Steps

### 1. Install Node Modules
```bash
npm install
```

**Expected output:** Should install ~500+ packages without errors

### 2. Create .env.local
Create this file in project root:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### 3. Setup Supabase Database
Run `supabase/schema.sql` in Supabase SQL Editor

### 4. Start Dev Server
```bash
npm run dev
```

**Expected output:**
```
  ▲ Next.js 15.0.3
  - Local:        http://localhost:3000
  - Ready in 2.5s
```

## ✅ Visual Check

### Login Page (http://localhost:3000/login)
Should see:
- ✅ VitalSync logo (blue pulse icon)
- ✅ Two tabs: "Patient" and "Doctor"
- ✅ White card on light gray background
- ✅ Blue primary buttons
- ✅ Clean, modern design

### Signup Page (http://localhost:3000/signup)
Should see:
- ✅ VitalSync logo
- ✅ "Create Patient Account" title
- ✅ Form fields with proper styling
- ✅ Blue submit button

## 🔧 Troubleshooting

### CSS Not Loading / Looks Broken

**Solution 1: Clear Next.js Cache**
```bash
rm -rf .next
npm run dev
```

**Solution 2: Reinstall Dependencies**
```bash
rm -rf node_modules .next
npm install
npm run dev
```

**Solution 3: Check Browser Console**
- Open DevTools (F12)
- Look for errors in Console tab
- Check Network tab for failed CSS requests

### Module Not Found Errors

```bash
npm install
```

### TypeScript Errors

```bash
npm run build
```
This will show any type errors

### Supabase Connection Issues

Check `.env.local`:
- File exists in project root
- Has both variables
- No quotes around values
- No trailing spaces

## ✅ Test Authentication

### Create Patient Account
1. Go to http://localhost:3000/signup
2. Fill form and submit
3. Should redirect to `/patient` with sidebar

### Login as Doctor
1. Create doctor in Supabase (see SETUP_DOCTORS.md)
2. Go to http://localhost:3000/login
3. Select "Doctor" tab
4. Login
5. Should redirect to `/doctor` with sidebar

## 📁 Verify File Structure

```
Health-Care-Portal/
├── .next/                    (created after npm run dev)
├── node_modules/             (created after npm install)
├── app/
│   ├── globals.css          ✓
│   ├── layout.tsx           ✓
│   ├── page.tsx             ✓
│   ├── login/page.tsx       ✓
│   ├── signup/page.tsx      ✓
│   ├── patient/
│   │   ├── layout.tsx       ✓
│   │   └── page.tsx         ✓
│   └── doctor/
│       ├── layout.tsx       ✓
│       └── page.tsx         ✓
├── components/ui/
│   ├── button.tsx           ✓
│   ├── input.tsx            ✓
│   ├── label.tsx            ✓
│   ├── card.tsx             ✓
│   ├── tabs.tsx             ✓
│   └── select.tsx           ✓
├── lib/
│   ├── utils.ts             ✓
│   ├── auth-actions.ts      ✓
│   └── supabase/
│       ├── client.ts        ✓
│       ├── server.ts        ✓
│       └── middleware.ts    ✓
├── .env.local               ⚠️ YOU NEED TO CREATE THIS
├── package.json             ✓
├── tsconfig.json            ✓
├── tailwind.config.ts       ✓
└── next.config.mjs          ✓
```

## 🎨 Expected Visual Style

**Colors:**
- Background: Light slate gray (#F8FAFC)
- Cards: White
- Primary buttons: Sky blue (#0284C7)
- Text: Dark slate
- Borders: Light gray

**Typography:**
- Font: Inter (Google Font)
- Clean, modern, professional

**Layout:**
- Centered cards on auth pages
- Sidebar navigation on dashboards
- Responsive design

## ✅ All Good?

If you see:
- ✅ Styled login/signup pages
- ✅ Can create patient account
- ✅ Can login as doctor
- ✅ Proper redirects based on role

**You're ready for Phase 2B: Doctor Features!**
