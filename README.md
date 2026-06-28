# Deezbots Dashboard

Your WhatsApp Pokémon Dashboard — a Next.js web app deployable on Vercel.

## 🚀 Deploy to Vercel

### Step 1 — Upload to GitHub

1. Create a new private GitHub repository
2. Push this folder to it:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourname/deezbots-dashboard.git
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
| `MONGODB_DB` | Name of your bot's database (e.g. `deezbots`) |
| `SESSION_SECRET` | Any long random string (32+ characters) |
| `DASHBOARD_URL` | Your Vercel URL (e.g. `https://deezbots.vercel.app`) |

### Step 4 — Add Bot Commands

The bot commands are already integrated in `src/commands/dashboard.js`.

Set `DASHBOARD_URL` as an environment variable on your bot host so it always sends the correct link.

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

The dashboard reads from your existing MongoDB users collection. It looks for these fields:

| Dashboard Feature | Field Names Checked |
|------------------|---------------------|
| Username | `name`, `username`, `pushName` |
| Gold | `economy.wallet` |
| Bank | `economy.bank` |
| XP | `xp` |
| Rank | Calculated from XP tiers |
| Cards | `cards` |
| Quiz Wins | `quizWins` |
| Party | `party` |
| PC Storage | `pc` |
| Total Catches | `catches` |

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
deezbots-dashboard/
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
└── .env.example          # Environment variable template
```

---

© Deezbots. All rights reserved.
