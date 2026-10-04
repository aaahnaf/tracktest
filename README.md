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

## ✨ What's New

### 🎨 Enhanced Design & Animations
- **Dramatic animations** — Slower, more cinematic transitions (500-800ms)
- **Dot matrix elements** — Nothing-inspired decorative patterns throughout
- **Glass morphism** — Frosted glass effects on navigation
- **Accent glow effects** — Pulsing red accent indicators
- **Smooth page transitions** — Scale + fade + slide animations

### 🌍 Complete Currency Support
- **95+ world currencies** — Every major currency supported
- **Scrollable currency picker** — Easy to find any currency
- **Organized by region** — Logical grouping for easy selection

### 📱 PWA Features
- **Installable** — Add to home screen on mobile and desktop
- **Offline support** — Service worker caches all assets
- **App shortcuts** — Long-press icon for quick actions:
  - "Add Expense" — Opens expense form directly
- **Deep linking** — URL parameters for direct navigation:
  - `?action=add` — Open add expense modal
  - `?page=replay` — Go to replay page
- **Theme color** — Adapts to light/dark mode
- **Standalone mode** — Runs like a native app

### 🎭 Visual Enhancements
- **Dot matrix backgrounds** — Decorative patterns on cards
- **Pulsing indicators** — Animated accent dots
- **Gradient overlays** — Subtle depth effects
- **Improved empty states** — More engaging placeholder designs

---

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

### 🔄 Financial Replay & Time Machine
An interactive timeline experience with two modes:

**Replay Mode:**
- Watch your spending unfold chronologically
- Play/pause controls with smooth animations
- See balance changes over time
- Detect anomalies and velocity changes
- Jump to specific event types (anomalies, milestones, velocity changes)

**Time Machine Mode:**
- Travel to any point in your financial history
- See your balance and spending state at that moment
- Explore how your finances evolved
- Perfect for understanding past decisions

Both modes feature:
- Month-by-month navigation
- Event-by-event progression
- Real-time balance updates
- Anomaly detection markers
- Beautiful timeline visualization

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

### 👻 Ghost Money
See your realistic balance after accounting for upcoming commitments:
- **Recurring expenses** — Detected from your spending patterns
- **Predicted spending** — Based on your historical daily average
- **Transparent calculation** — See exactly what's included
- **Realistic balance** — Your balance minus ghost money
- Only shown when there's enough data to make accurate estimates

### 🧬 Spending DNA
Every transaction has a behavioral profile (accessible via the • button):
- **Necessity score** — How essential was this purchase?
- **Impulse score** — How spontaneous was this?
- **Social score** — Was this for social reasons?
- **Typicality** — How typical is this for you?
- **Behavioral signals** — "Late-night purchase", "Recurring pattern", etc.
- Based on actual historical data, not random values

### 🔍 Anomaly Detection
The app identifies genuinely unusual spending:
- **Amount anomalies** — "Your average food purchase is ৳180-350. On Sept 17 you spent ৳1,420"
- **Frequency anomalies** — "Shopping spending increased 61% this month"
- **Contextual explanations** — Always explains WHY something was flagged
- **Non-judgmental** — Shows facts, never says "you shouldn't"
- Only triggers when there's enough data for meaningful comparison

### 📊 Spending Heatmap
Visual calendar view of your spending intensity:
- **Month view** — See spending patterns across the month
- **Color intensity** — Darker = more spending
- **Hover details** — See exact amounts for each day
- **Navigate months** — Browse through your history
- **GitHub-style** — Familiar, clean visualization

### 📈 Enhanced Analytics
- Monthly totals with animated counters
- Weekly spending chart with grid background
- Category breakdown with monochrome color palette
- Worth-it statistics and patterns
- Impulse pattern detection
- Smart insights from your own data

### 🎨 Design & Animations
- **Monochrome palette** — Pure black/white/grays with signature red accent (#d5272b)
- **Custom SVG icons** — 20+ hand-crafted icons, no emoji
- **Technical typography** — JetBrains Mono for labels, Inter for body
- **Dot-matrix elements** — Nothing-inspired decorative patterns throughout
  - Dense dot patterns on cards
  - Accent-colored dot matrices
  - Circular dot decorations
  - Grid line backgrounds
- **Perfect alignment** — Grid-based layouts with pixel-perfect spacing
- **Dramatic animations** — Slower, more cinematic transitions
  - Page transitions: 500ms with scale + fade + slide
  - Number counters: 800ms smooth interpolation
  - Modal animations: 600ms with dramatic entrance
  - Card animations: 600ms staggered reveals
  - Natural easing: cubic-bezier(0.16, 1, 0.3, 1)
- **Glass morphism** — Frosted glass effects on navigation
- **Accent glow effects** — Pulsing red accent indicators
- **Smooth transitions** — 400ms cubic-bezier for all interactions
- **Reduced motion support** — Respects user preferences

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
- Overview, Transactions, Memory, Analytics, Replay in main navigation
- Memory fields optional in expense form
- Insights appear only when relevant
- Patterns detected only with enough data
- Ghost Money only shown when enough data exists
- Anomaly detection only triggers with sufficient history
- Spending DNA accessible via subtle • button on each transaction
- Getting Started Guide available in Settings for new users

### 📲 PWA Features
- **Installable** — Add to home screen on mobile and desktop
- **Offline support** — Service worker caches all assets
- **App shortcuts** — Long-press icon for quick actions:
  - "Add Expense" — Opens expense form directly
- **Deep linking** — URL parameters for direct navigation:
  - `?action=add` — Open add expense modal
  - `?page=replay` — Go to replay page
- **Theme color** — Adapts to light/dark mode
- **Standalone mode** — Runs like a native app

### 📖 Getting Started Guide
Built-in onboarding accessible from Settings:
- **5-step walkthrough** — Learn the basics in minutes
- **Visual examples** — See what each feature does
- **Non-intrusive** — Available anytime, doesn't force itself
- **Explains data requirements** — Why some features need history
- **Privacy-focused** — Emphasizes local-only data processing

### 🎯 Core Experience
**Track → Remember → Reflect → Understand**

Normal expense tracker: "You spent ৳500."  
What Did I Spend?: "You spent ৳500 on this six months ago. You wrote that it was worth it. You paid ৳300 less than your previous similar purchase."

### Pages
- **Overview** — Monthly total with animated counter, Ghost Money display, anomaly detection, financial trajectory, contextual insights, month-over-month comparison, mini sparkline, today's spending, recent transactions
- **Transactions** — Full history grouped by date, natural language search, category filter, sort options, Spending DNA for each transaction (tap • to expand), tap-to-edit on mobile
- **Memory** — Your spending memories organized by month, showing what purchases were for and whether they were worth it
- **Analytics** — Weekly bar chart, category donut chart, worth-it statistics, impulse patterns, spending heatmap, detailed breakdowns
- **Replay** — Financial Replay & Time Machine with play/pause controls, event-by-event progression, anomaly markers, month navigation
- **Settings** — Theme (Light/Dark/System), 95+ world currencies, data management, Getting Started Guide, privacy notice

### 🌍 Currency Support
Complete list of 95+ world currencies including:
- **Major**: USD, EUR, GBP, JPY, CNY, INR, BDT
- **South Asia**: PKR, LKR, NPR
- **Oceania**: AUD, NZD
- **Americas**: CAD, MXN, BRL, ARS, CLP, COP, PEN
- **Europe**: CHF, SEK, NOK, DKK, PLN, CZK, HUF, RON, and more
- **Asia**: SGD, HKD, KRW, TWD, THB, MYR, IDR, PHP, VND, and more
- **Middle East**: AED, SAR, QAR, KWD, BHD, OMR, ILS, and more
- **Africa**: ZAR, EGP, NGN, KES, GHS, and more
- **Eastern Europe**: RUB, TRY, UAH, GEL, and more

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
