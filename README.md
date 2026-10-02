# What Did I Spend?

A premium, minimalist, monochrome expense tracker inspired by Nothing's design philosophy.

## Design Philosophy

**Monochrome aesthetic** — Pure black, white, and grays. No colors, just contrast and form.

**Nothing-inspired** — Technical markings, dot-matrix elements, grid-based layouts, and distinctive typography create a unique visual identity.

**Artistic & distinctive** — Custom SVG icons, perfect alignment, and satisfying animations make this more than just another expense tracker.

## Features

### Core Functionality
- Add, edit, delete expenses with amount, category, note, and date
- 8 categories with custom SVG icons (Food, Transport, Shopping, Bills, Entertainment, Health, Education, Other)
- Persistent storage via IndexedDB (100% offline)
- Export/Import data as JSON
- Delete all data with confirmation

### Pages
- **Overview** — Monthly total with animated counter, month-over-month comparison, mini sparkline, today's spending, recent transactions, smart insights
- **Transactions** — Full history grouped by date, search, category filter, sort options, tap-to-edit on mobile
- **Analytics** — Weekly bar chart, category donut chart with percentages, detailed category breakdown, spending insights
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

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion (animations)
- IndexedDB (via idb)
- Custom SVG icons

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
