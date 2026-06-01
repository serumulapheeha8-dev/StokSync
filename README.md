# StokvelApp

A mobile-first stokvel management app built with Next.js, Supabase, and Tailwind CSS. Deploy to Vercel in minutes.

---

## Step-by-step setup guide

### STEP 1 — Set up Supabase (free database)

1. Go to **supabase.com** and click "Start for free"
2. Sign up with GitHub or Google
3. Click **"New project"**
   - Give it a name: `stokvel-app`
   - Set a database password (save it somewhere safe)
   - Choose a region closest to you (e.g. `Europe West` for SA)
4. Wait about 2 minutes for the project to set up
5. Once ready, go to the **SQL Editor** (left sidebar)
6. Click **"New query"**
7. Copy the entire contents of `supabase/schema.sql` and paste it in
8. Click **"Run"** — this creates all your database tables

### STEP 2 — Get your Supabase keys

1. In Supabase, click **"Settings"** (gear icon, left sidebar)
2. Click **"API"**
3. Copy these two values:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### STEP 3 — Set up the project locally

You need **Node.js** installed. Download from nodejs.org if you don't have it.

Open your terminal (Command Prompt on Windows, Terminal on Mac):

```bash
# Go into the project folder
cd stokvel-app

# Install all dependencies
npm install

# Create your environment file
cp .env.local.example .env.local
```

Now open `.env.local` in a text editor (Notepad works) and fill in your Supabase details:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### STEP 4 — Test locally

```bash
npm run dev
```

Open your browser and go to **http://localhost:3000**

You should see the login screen. Enter your email and click "Send login link". Check your email and click the link — you'll be logged in!

### STEP 5 — Deploy to Vercel (free hosting)

1. Go to **github.com** and create a free account if you don't have one
2. Create a new repository called `stokvel-app`
3. Upload your project files to GitHub (or use GitHub Desktop — download from desktop.github.com)
4. Go to **vercel.com** and sign up with your GitHub account
5. Click **"New Project"** and import your `stokvel-app` repository
6. Before clicking Deploy, click **"Environment Variables"** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
7. Click **"Deploy"**

Vercel will give you a live URL like `stokvel-app.vercel.app` — that's your live app! 🚀

### STEP 6 — Configure Supabase Auth redirect

After deploying to Vercel, you need to tell Supabase your live URL:

1. In Supabase, go to **Authentication → URL Configuration**
2. Add your Vercel URL to **"Redirect URLs"**: `https://your-app.vercel.app/auth/callback`
3. Save

---

## Features

- ✅ Email magic link login (no password needed)
- ✅ Create and manage stokvel groups
- ✅ Add members with payout order
- ✅ Log and confirm contributions (Paid / Pending)
- ✅ Schedule and track payouts
- ✅ Admin controls (only group creator can confirm payments)
- ✅ Mobile-first design, works on any phone
- ✅ Add to home screen (works like a native app)

## Tech stack

- **Next.js 14** — React framework
- **Supabase** — Database + Authentication
- **Tailwind CSS** — Styling
- **Vercel** — Hosting

---

## Troubleshooting

**"Cannot find module" error** — Run `npm install` again

**Login link not working** — Make sure you added your Vercel URL to Supabase redirect URLs (Step 6)

**Blank page after login** — Check that your `.env.local` has the correct Supabase URL and key

**Database error** — Make sure you ran the full `schema.sql` in the Supabase SQL editor

---

Built with ❤️ for South African stokvels
