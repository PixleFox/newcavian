# Cavian Design System — MASTER

> **Dark-first streetwear brand.** Purple neon primary, green neon accent, OLED black base.
> All components MUST reference CSS variables from `globals.css`. **No raw hex values in JSX/TSX.**

---

## 1. Color Tokens

| Token (CSS var) | Tailwind class | Dark | Light | Use |
|---|---|---|---|---|
| `--bg` | `bg-bg` | `#080808` | `#f0f1f5` | Page background |
| `--bg-elevated` | `bg-bg-elevated` | `#0c0c0c` | `#f8f9fc` | Raised page sections |
| `--surface` | `bg-surface` | `#111113` | `#ffffff` | Cards, panels |
| `--surface-2` | `bg-surface-2` | `#1a1a1e` | `#f4f5f9` | Inputs, inset areas |
| `--surface-3` | `bg-surface-3` | `#222228` | `#ebedf3` | Hover states, nested |
| `--border` | `border-border` | `rgba(255,255,255,0.07)` | `#dde1ea` | Default borders |
| `--border-strong` | `border-border-strong` | `rgba(255,255,255,0.14)` | `#c4cad7` | Emphasized borders |
| `--fg` | `text-fg` | `#f4f4f5` | `#0f172a` | Primary text |
| `--fg-muted` | `text-muted` | `#a1a1aa` | `#475569` | Secondary text |
| `--fg-subtle` | `text-subtle` | `#71717a` | `#64748b` | Hint/placeholder |
| `--primary` | `text-primary bg-primary` | `#a855f7` | `#7c3aed` | Brand purple |
| `--primary-hover` | `hover:bg-primary-hover` | `#c084fc` | `#6d28d9` | Primary hover |
| `--primary-dim` | `bg-primary-dim` | `rgba(168,85,247,0.15)` | `rgba(124,58,237,0.12)` | Tinted bg |
| `--accent` | `text-accent bg-accent` | `#22ff88` | `#16a34a` | Neon green accent |
| `--accent-dim` | `bg-accent-dim` | `rgba(34,255,136,0.12)` | — | Tinted accent bg |
| `--success` | `text-success` | `#22ff88` | `#16a34a` | Success state |
| `--error` | `text-error` | `#ff4d6d` | `#dc2626` | Error/danger |
| `--warning` | `text-warning` | `#fbbf24` | `#d97706` | Warning |

---

## 2. Typography

**Font:** `Pinar` (Persian) — defined in globals.css, falls back to Vazirmatn.

| Class | Size | Weight | Use |
|---|---|---|---|
| `.text-display` | clamp(2.5–4rem) | 800 | Hero headlines |
| `.text-title-1` | clamp(1.75–2.5rem) | 800 | Page titles |
| `.text-title-2` | clamp(1.25–1.75rem) | 700 | Section headers |
| `.text-headline` | 1.125rem | 700 | Card titles |
| `.text-body` | 1rem | 400 | Body copy |
| `.text-caption` | 0.8125rem | 500 | Meta, helper text |
| `.text-label` | 0.75rem | 700 | Uppercase labels/tags |

**Tailwind scale in use:** `text-xs(12)` `text-sm(14)` `text-base(16)` `text-lg(18)` `text-xl(20)` `text-2xl(24)` `text-3xl(30)` `text-4xl(36)` `text-5xl(48)`

---

## 3. Spacing

Base unit: **4px**. Always use multiples: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64.
In Tailwind: `p-1`=4px `p-2`=8px `p-3`=12px `p-4`=16px `p-5`=20px `p-6`=24px `p-8`=32px `p-10`=40px `p-12`=48px `p-16`=64px

---

## 4. Border Radius

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 6px | Small buttons, badges |
| `--radius-md` | 10px | Chips, tags |
| `--radius-lg` | 14px | Inputs, buttons |
| `--radius-xl` | 20px | Cards |
| `--radius-2xl` | 28px | Large panels, modals |
| `--radius-full` | 9999px | Pills, avatars |

In Tailwind: `rounded-md`=6 `rounded-lg`=8 `rounded-xl`=12 `rounded-2xl`=16 `rounded-3xl`=24. Use `rounded-[14px]` etc. for exact tokens.

---

## 5. Shadows & Glows

| Token | Dark value | Use |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.5)` | Subtle lift |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,0.4)` | Cards |
| `--shadow-lg` | `0 8px 32px rgba(0,0,0,0.5)` | Hover/focus cards |
| `--shadow-xl` | `0 20px 60px rgba(0,0,0,0.6)` | Modals |
| `--glow-primary` | `0 0 32px rgba(168,85,247,0.35)` | Primary CTA glow |
| `--glow-accent` | `0 0 28px rgba(34,255,136,0.35)` | Accent glow |

---

## 6. Component Classes

Use these in JSX — don't rebuild from scratch.

```jsx
// Cards
<div className="card">          // standard card
<div className="card-sm">       // smaller card
<div className="card card-hover"> // hoverable card

// Buttons
<button className="btn btn-md btn-primary">ثبت‌نام</button>
<button className="btn btn-md btn-accent">خرید</button>
<button className="btn btn-md btn-outline">بیشتر</button>
<button className="btn btn-sm btn-ghost">لغو</button>
<button className="btn btn-sm btn-danger">حذف</button>

// Inputs
<input className="input" />
<input className="input input-error" />
<textarea className="input" />

// Badges
<span className="badge badge-primary">جدید</span>
<span className="badge badge-accent">ویژه</span>
<span className="badge badge-success">فعال</span>
<span className="badge badge-error">ناموجود</span>
<span className="badge badge-neutral">غیرفعال</span>

// Typography
<h1 className="text-display glow-primary">...</h1>
<h2 className="text-title-1">...</h2>
<p className="text-body text-muted">...</p>

// Layout
<div className="page-container">   // max-w-7xl with responsive padding
<section className="section-gap">  // 64–96px block padding

// Admin
<div className="admin-card">
<input className="admin-input" />
```

---

## 7. Animation

| Class | Duration | Use |
|---|---|---|
| `.animate-fade-up` | 400ms | Section entrances |
| `.animate-fade-in` | 300ms | Modals, overlays |
| `.animate-slide-down` | 250ms | Dropdowns |
| `.animate-bounce-in` | 300ms | Alerts, success states |
| `.stagger-1` through `.stagger-5` | +50ms each | List item stagger |

Framer Motion config:
```ts
// Standard card hover
whileHover={{ y: -4, transition: { duration: 0.2 } }}

// Button press
whileTap={{ scale: 0.97 }}

// Entrance
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}

// Spring (for toggles/drawers)
transition={{ type: 'spring', stiffness: 400, damping: 30 }}
```

---

## 8. Z-Index Scale

| Layer | Value | Elements |
|---|---|---|
| base | 0 | Normal content |
| raised | 10 | Sticky elements, dropdowns |
| overlay | 40 | Drawers, side panels |
| modal | 50 | Modals, dialogs |
| toast | 60 | Notifications |
| nav | 100 | Top navbar |

---

## 9. Anti-Patterns (Never Do)

- ❌ Hardcoded `bg-gray-800`, `bg-[#1E293B]`, `text-gray-300` in components
- ❌ Raw hex colors in JSX — use CSS var tokens
- ❌ Different border radius on same-level components
- ❌ Shadow values not from `--shadow-*` tokens
- ❌ Font sizes below 12px
- ❌ Buttons without `cursor-pointer` and hover states
- ❌ Touch targets < 44×44px

---

## 10. Page-Specific Notes

### Homepage (`/`)
- Hero: full-bleed, `bg-bg`, parallax orbs with `--primary-dim`
- Sections alternate: `bg-bg` → `bg-bg-elevated`

### Products (`/products`)  
- Grid cards use `.card .card-hover`
- Category pills: `badge badge-neutral` → `badge-primary` when active

### Admin Panel (`/admin/panel`)
- Background: `bg-bg` (NOT hardcoded `#0F172A`)
- Sidebar: `bg-surface` border `border-border`
- All tables: `bg-surface` rows, `bg-surface-2` alternating

### About (`/about`)
- Full-bleed hero sections
- Stats cards use `.card` with `--glow-primary`
