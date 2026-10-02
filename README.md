# What Did I Spend?

**A personal spending memory.** Not just another expense tracker.

"What Did I Spend?" doesn't just remember your money. It remembers your spending.

Normal expense trackers tell you: "You spent ৳850."  
This app tells you: "You spent ৳850 on this, here's what it was for, and here's what you thought about it afterward."

A premium, minimalist, monochrome expense tracker with deep memory features, inspired by Nothing's design philosophy.

## Design Philosophy

**Monochrome aesthetic** — Pure black, white, and grays. No colors, just contrast and form.

**Nothing-inspired** — Technical markings, dot-matrix elements, grid-based layouts, and distinctive typography create a unique visual identity.

**Artistic & distinctive** — Custom SVG icons, perfect alignment, and satisfying animations make this more than just another expense tracker.

## Features

### 🧠 Spending Memory (Signature Feature)
- **Memory Notes** — "What was this for?" Optional field to remember the context of each purchase
- **Worth It?** — Reflect on purchases with ratings: Absolutely, Mostly, Not really, No
- **Future Me** — Leave notes for your future self: "If I want another pair, check whether I actually use these"
- **Reminder Dates** — Set optional reminders for future purchases
- **Merchant/Store** — Track where you bought things
- **Product Names** — Remember specific products

### 💝 Memory Page
A dedicated page that shows your spending memories organized by month. Each memory card displays:
- Amount and category
- What it was for (your memory note)
- Whether it was worth it
- Future me notes
- Beautiful, minimal design

### 📊 Worth-It Analytics
- **Overall percentage** — "82% of your remembered purchases were marked positively"
- **Category breakdown** — See which categories you find most worthwhile
- **Impulse patterns** — Detect patterns like "You marked several late-night purchases as not worth it"
- **Neutral language** — Never judges, just shows your own data

### 🔄 Spending Replay
An interactive timeline experience:
- Choose week, month, or year
- Scrub through time with a slider
- Watch cumulative spending animate in real-time
- See purchase counts change as you move through time
- Beautiful line visualization with current position indicator

### 🔍 Natural Language Search
Search with natural queries:
- "How much did I spend on food last month?"
- "What did I buy for more than ৳2,000?"
- "Show purchases I didn't think were worth it"
- "How much did I spend on weekends?"
- "Show my headphone purchases"

Falls back to regular text search if query can't be parsed.

### 💡 Smart Insights
- **Contextual insights** on home page — Shows the most relevant memory/pattern
- **Pattern detection** — Recurring expenses, category patterns, merchant patterns
- **Regret patterns** — "You marked 5 food-delivery purchases as not worth it"
- **Price memory** — Remember what you previously paid for similar items

### 📈 Enhanced Analytics
- Monthly totals with animated counters
- Weekly spending chart with grid background
- Category breakdown with monochrome color palette
- Worth-it statistics and patterns
- Impulse pattern detection
- Smart insights from your own data

### 🎨 Design
- **Monochrome palette** — Pure black/white/grays with signature red accent (#d5272b)
- **Custom SVG icons** — 20+ hand-crafted icons, no emoji
- **Technical typography** — JetBrains Mono for labels, Inter for body
- **Dot-matrix elements** — Decorative patterns and indicators
- **Perfect alignment** — Grid-based layouts with pixel-perfect spacing
- **Satisfying animations** — 150-400ms with natural easing

### 🔒 Privacy & Offline
- 100% offline — no server required
- All data stored locally in IndexedDB
- No analytics or tracking
- No account required
- Export your data anytime as JSON
- Works completely offline after first load

### ⌨️ Keyboard Shortcuts
- `N` — New expense
- `/` — Focus search
- `Esc` — Close modal

### 📱 Progressive Disclosure
The app starts simple and reveals features contextually:
- Overview, Transactions, Memory, Analytics in main navigation
- Replay accessible from navigation
- Memory fields optional in expense form
- Insights appear only when relevant
- Patterns detected only with enough data

### 🎯 Core Experience
**Track → Remember → Reflect → Understand**

Normal expense tracker: "You spent ৳500."  
What Did I Spend?: "You spent ৳500 on this six months ago. You wrote that it was worth it. You paid ৳300 less than your previous similar purchase."

### Pages
- **Overview** — Monthly total with animated counter, contextual insights, month-over-month comparison, mini sparkline, today's spending, recent transactions, smart insights
- **Transactions** — Full history grouped by date, natural language search, category filter, sort options, tap-to-edit on mobile
- **Memory** — Your spending memories organized by month, showing what purchases were for and whether they were worth it
- **Analytics** — Weekly bar chart, category donut chart, worth-it statistics, impulse patterns, detailed breakdowns
- **Replay** — Interactive timeline scrubbing through your spending history with animated cumulative totals
- **Settings** — Theme (Light/Dark/System), Currency (BDT/USD/EUR/GBP/INR), data management, privacy notice

### Design Elements
- **Monochrome palette** — Pure black/white/grays only
- **Custom SVG icons** — No emoji, all hand-crafted icons
- **Technical typography** — JetBrains Mono for technical labels, Inter for body text
- **Dot-matrix elements** — Decorative dots and grid patterns
- **Perfect alignment** — Pixel-perfect grid-based layouts
- **Satisfying animations** — Smooth, natural transitions (150-400ms)
- **Large number display** — Prominent, elegant number formatting

### Premium Details
- Keyboard shortcuts (N = new expense, / = search, Esc = close)
- Haptic feedback on mobile
- Auto-focus on amount input
- Success animation on save
- Animated number counters
- Smart date formatting (Today, Yesterday, relative time)
- Reduced motion support
- Accessible with proper ARIA labels

### PWA Features
- Service worker for offline caching
- Web app manifest for installability
- Standalone mode support
- Custom monochrome icon

## Data Model

Extended expense model with optional memory fields:

```typescript
interface Expense {
  id: string;
  amount: number;
  currency: string;
  category: string;
  note: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  
  // Memory fields (all optional)
  memoryNote?: string;           // "What was this for?"
  worthItRating?: 'absolutely' | 'mostly' | 'not-really' | 'no';
  futureMeNote?: string;         // Message to future self
  futureMeReminderDate?: string; // Reminder date
  merchant?: string;             // Store/vendor
  productName?: string;          // Specific product
  episodeId?: string;            // Link to spending episode
  attachments?: Attachment[];    // Receipts, photos
}
```

**Migration Strategy:**
- Database version incremented from 1 to 2
- New fields are optional — existing expenses continue working
- No data loss during migration
- Backward compatible with old exports

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion (animations)
- IndexedDB (via idb)
- Custom SVG icons
- date-fns (date handling)

## Color System

**Light Mode:**
- Background: #ffffff
- Text: #000000
- Secondary: #525252
- Tertiary: #a3a3a3
- Border: #e5e5e5

**Dark Mode:**
- Background: #000000
- Text: #ffffff
- Secondary: #a3a3a3
- Tertiary: #525252
- Border: #262626

## Typography

- **Body:** Inter (300, 400, 500, 600)
- **Technical:** JetBrains Mono (400, 500)
- **Large numbers:** Inter Light with tabular-nums

## Animations

All animations use cubic-bezier(0.16, 1, 0.3, 1) for natural, satisfying motion:
- Page transitions: 300ms
- Modal animations: 350ms
- Staggered list items: 50ms delay
- Number counters: 400ms
- Chart bars: 500ms

## Keyboard Shortcuts

- `N` — New expense
- `/` — Focus search
- `Esc` — Close modal

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Performance

- Bundle size: ~342KB (gzipped: ~104KB)
- First Contentful Paint: < 1s
- Fully interactive: < 2s
- Works offline after first load

## Privacy

- 100% offline — no server required
- All data stored locally in IndexedDB
- No analytics or tracking
- No account required
- Export your data anytime

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## License

MIT

---

**What Did I Spend?** — Track your spending with style.
