# INFINITYX Dashboard

Your WhatsApp Pokémon Dashboard — a Next.js web app deployable on Vercel.

## 🚀 Deploy to Vercel

### Step 1 — Upload to GitHub

1. Create a new private GitHub repository
2. Push this folder to it:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourname/infinityx-dashboard.git
   git push -u origin main
   ```

### Step 2 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"** → Import your GitHub repo
3. Vercel will auto-detect Next.js — click **Deploy**

### Step 3 — Set Environment Variables

In Vercel → Project → Settings → Environment Variables, add:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Your bot's MongoDB connection string |
| `MONGODB_DB` | Name of your bot's database (e.g. `infinityx`) |
| `SESSION_SECRET` | Any long random string (32+ characters) |
| `WEBSITE_URL` | Your Vercel URL (e.g. `https://infinityx.vercel.app`) |

### Step 4 — Add Bot Commands

Copy the functions from `BOT_COMMANDS.js` into your bot's message handler.

Edit the `WEBSITE_URL` at the top of `BOT_COMMANDS.js` to match your Vercel URL.

---

## 🤖 Bot Commands

| Command | Description |
|---------|-------------|
| `!webpass [password]` | Set your dashboard password (min 6 chars) |
| `!addnumber [number]` | Register your phone number & create dashboard |
| `!webresetpassword [new]` | Change your web password anytime |

**Flow:**
1. User sends `!webpass mypassword` → Bot sets hashed password in DB
2. User sends `!addnumber 27XXXXXXXXX` → Bot registers number, sends dashboard link
3. User goes to the website and logs in with their number + password

---

## 🗄️ Database Schema

The dashboard reads from your existing MongoDB users collection. It looks for these fields (flexible — will work with multiple common field names):

| Dashboard Feature | Field Names Checked |
|------------------|---------------------|
| Username | `name`, `username`, `pushName` |
| Gold | `gold`, `coins`, `money`, `wallet` |
| Bank | `bank`, `bankBalance` |
| XP | `xp`, `exp`, `experience` |
| Rank | `rank`, `tier`, `rankTier` |
| Cards | `cards`, `cardCount`, `cardCollection` |
| Quiz Wins | `quizWins`, `quiz.wins` |
| Quiz Losses | `quizLosses`, `quiz.losses` |
| Party | `party`, `team`, `activePokemon` |
| PC Storage | `pc`, `box`, `storage`, `pcStorage` |
| Total Catches | `totalCatches`, `catches` |

If your bot uses different field names, edit `app/api/dashboard/route.ts` accordingly.

---

## 🔧 Local Development

```bash
# Install dependencies
npm install

# Copy env file and fill in values
cp .env.example .env.local

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
infinityx-dashboard/
├── app/
│   ├── page.tsx          # Landing page
│   ├── login/            # Login page
│   ├── dashboard/        # User dashboard (protected)
│   ├── leaderboard/      # Public leaderboard
│   ├── team/             # Team page
│   └── api/              # API routes
│       ├── auth/         # Login/logout/me
│       ├── dashboard/    # User data
│       └── leaderboard/  # Rankings
├── components/
│   ├── Navbar.tsx
│   └── Footer.tsx
├── lib/
│   ├── db.ts             # MongoDB connection
│   └── session.ts        # iron-session auth
├── BOT_COMMANDS.js       # Paste these into your bot
└── .env.example          # Environment variable template
```

---

© INFINITYX · All rights reserved · Deezbots in cooperation
