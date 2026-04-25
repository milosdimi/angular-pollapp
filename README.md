<div align="center">

# 📊 PollApp

**A modern survey & polling web application built with Angular & Supabase**

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-2.x-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=for-the-badge&logo=sass&logoColor=white)](https://sass-lang.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**[🌐 Live Demo → pollapp.dimit.cc](https://pollapp.dimit.cc)**

</div>

---

## ✨ Features

- 📋 **Browse surveys** — Active and past surveys with category filter & sorting
- 🎯 **Vote on surveys** — Single or multiple choice answers per question
- 📊 **Live results** — Real-time bar charts update as votes come in (Supabase Realtime)
- ✏️ **Create & edit** — Full survey builder with questions, answers, end date and category
- 🗑️ **Delete** — Remove your own surveys with confirmation dialog
- 🔒 **No double voting** — LocalStorage prevents multiple votes per survey
- 🔗 **Share** — Copy survey link to clipboard with one click
- ⏰ **Ending soon** — Carousel of surveys expiring within 7 days
- 🏷️ **Deadline badges** — Dynamic labels (e.g. "Ends in 3 days", "Ended")
- 📱 **Fully responsive** — Optimized for mobile, tablet and desktop
- 🎨 **Smooth transitions** — Page animations and micro-interactions
- 🔍 **SEO ready** — `<title>` and `<meta description>` per route
- 🗺️ **sitemap.xml + robots.txt** — Search engine optimized
- ⚖️ **Legal** — Impressum & Datenschutzerklärung (DSGVO-konform)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Angular 21](https://angular.dev) (standalone components, signals) |
| **Language** | [TypeScript 5.9](https://www.typescriptlang.org) |
| **Styling** | SCSS with CSS custom properties |
| **Backend / DB** | [Supabase](https://supabase.com) (PostgreSQL) |
| **Realtime** | Supabase Realtime (live vote updates) |
| **Auth / Security** | Supabase Row Level Security |
| **Fonts** | Mulish · Nokora · Nerko One |
| **Testing** | Vitest |
| **Formatter** | Prettier |
| **Package Manager** | npm 11 |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── components/          # Shared UI components
│   │   ├── navbar/
│   │   ├── footer/
│   │   ├── spinner/
│   │   ├── survey-card/
│   │   ├── highlight-card/
│   │   └── deadline-badge/
│   ├── pages/               # Route-level pages
│   │   ├── home/            # Landing page
│   │   │   ├── hero/
│   │   │   ├── ending-soon/
│   │   │   └── survey-list/
│   │   ├── survey-detail/   # Vote + live results
│   │   ├── create-survey/   # Create & edit surveys
│   │   ├── imprint/
│   │   ├── privacy/
│   │   └── not-found/
│   ├── services/
│   │   └── supabase.service.ts
│   ├── models/
│   │   └── survey.interface.ts
│   ├── pipes/
│   │   └── format-date.pipe.ts
│   └── environments/
│       ├── environment.ts        # ⚠️ not in git
│       └── environment.prod.ts   # ⚠️ not in git
└── public/
    ├── icons/
    ├── logo/
    └── fonts/
```

---

## 🗄️ Database Schema

```sql
surveys
  id · title · description · category · status · end_date · created_at

questions
  id · survey_id (FK) · text · allow_multiple · order_index

answers
  id · question_id (FK) · text · vote_count
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 20
- npm ≥ 11
- Angular CLI 21 — `npm install -g @angular/cli`
- A [Supabase](https://supabase.com) project

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/milosdimi/PollApp.git
cd PollApp

# 2. Install dependencies
npm install

# 3. Set up environment variables (see below)

# 4. Start the dev server
npm start
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

---

## 🔑 Environment Variables

Create `src/environments/environment.ts` (excluded from git):

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabaseKey: 'YOUR_ANON_PUBLIC_KEY',
};
```

Create `src/environments/environment.prod.ts` for production:

```typescript
export const environment = {
  production: true,
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabaseKey: 'YOUR_ANON_PUBLIC_KEY',
};
```

> ⚠️ Both files are in `.gitignore`. On your hosting provider, set these as environment variables.

---

## 📜 Available Scripts

```bash
npm start          # Dev server at localhost:4200
npm run build      # Production build → dist/
npm run watch      # Dev build with file watcher
npm test           # Run tests with Vitest
```

---

## 🌍 Deployment

### Production Build

```bash
npm run build
```

Output goes to `dist/poll-app/browser/`. Deploy this folder to any static hosting provider.

### Hosting Options

| Provider | Notes |
|---|---|
| **Netlify** | Drag & drop `dist/` folder or connect GitHub repo |
| **Vercel** | `vercel --prod` after `npm run build` |
| **Firebase Hosting** | `firebase deploy` |

### SPA Routing

All providers need a redirect rule so Angular's router handles navigation:

**Netlify** — `public/_redirects`:
```
/*  /index.html  200
```

---

## 📱 Responsive Breakpoints

| Breakpoint | Target |
|---|---|
| `> 1260px` | Large desktop |
| `1260px – 1150px` | Small desktop / large laptop |
| `1150px – 850px` | Tablet landscape / small laptop |
| `≤ 850px` | Mobile |

---

## 🤝 Contributing

This is a solo learning project built as part of the Developer Akademie curriculum. Feel free to fork and experiment!

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

<div align="center">
  Built with ❤️ by <a href="https://dimit.cc">milosdimi</a>
</div>
