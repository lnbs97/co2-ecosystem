# Design Guidelines: Dual-Currency Clothing E-Commerce Platform

## Design Approach

**Reference-Based Approach**: Drawing inspiration from Zalando, ASOS, and modern e-commerce leaders. Focus on clean product presentation, intuitive navigation, and seamless dual-currency integration (Euro + CO2 tokens).

**Core Principle**: Present the dual-currency system as a natural, integrated part of the shopping experience, not an afterthought.

---

## Typography

**Font System**: Google Fonts via CDN
- **Primary**: Inter (400, 500, 600, 700)
- **Accent**: Optional display font for headers

**Hierarchy**:
- Product titles: text-base to text-lg, font-medium
- Prices (both currencies): text-xl to text-2xl, font-semibold
- Category headers: text-2xl to text-3xl, font-bold
- Body text: text-sm to text-base, font-normal
- Navigation: text-sm, font-medium
- Buttons/CTAs: text-sm to text-base, font-semibold

---

## Layout System

**Spacing Scale**: Tailwind units of **2, 4, 6, 8, 12, 16, 24** (p-2, m-4, gap-6, etc.)

**Grid System**:
- Product Grid: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6`
- Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Section spacing: `py-12 md:py-16`

---

## Component Library

### Navigation Header
- Fixed top header with logo, search bar, category links, cart icon, and balance display
- Balance widget showing Euro and CO2 token balances side-by-side with clear labels
- Mini cart preview on hover showing dual totals
- Height: `h-16 md:h-20`

### Product Cards
- Aspect ratio: `aspect-[3/4]` for product images
- Card structure: Image → Brand → Title → Dual Price Display
- Dual Price Layout: Stack vertically with visual separation
  - Euro price: Primary prominence
  - CO2 price: Secondary styling, include token icon/indicator
  - Example: "€89.99" above "250 CO₂"
- Hover: Subtle lift effect, show "Quick View" overlay
- Spacing: `p-4` internal padding

### Product Detail Page
- Two-column layout: `grid lg:grid-cols-2 gap-12`
- Image gallery: Large main image with thumbnail carousel below
- Info panel: Title → Brand → Dual Pricing (prominent) → Size selector → Add to Cart
- Price display: Large, side-by-side boxes or stacked with clear visual hierarchy
- Tabs for Description, Materials, Sustainability (CO2 impact)

### Shopping Cart
- Side drawer (right-side): `w-full md:w-96`
- Line items showing: Thumbnail, name, size, quantity, dual prices
- Summary section:
  - Subtotal (Euro)
  - Subtotal (CO2)
  - Total boxes: Two clear, side-by-side total displays
- Spacing: `p-6` for drawer, `gap-4` between items

### Dual Currency Components
**Price Tag Standard**:
```
[€ Amount]
[CO₂ Amount + icon]
```
- Always show both currencies
- Use consistent formatting (2 decimal places for Euro, whole numbers for CO2)
- Icon: Use Heroicons for CO2 indicator (e.g., cloud or fire icon)

**Balance Display**:
- Persistent header widget
- Format: "€1,250.00 | 5,000 CO₂"
- Update in real-time after transactions

### Checkout Flow
- Multi-step: Cart → Shipping → Payment → Confirmation
- Payment confirmation shows dual transaction
- Transaction breakdown: Clear itemization of both currency deductions
- Success message highlights both transfers

### Filter Sidebar
- Fixed left sidebar on desktop, drawer on mobile
- Categories, sizes, price ranges (Euro), CO2 impact filters
- Width: `w-64` on desktop
- Spacing: `space-y-6` between filter groups

### Hero Section (Optional Homepage)
- Full-width banner showcasing seasonal collection
- No forced viewport height - natural content flow
- Overlay text with CTA button (blurred background for button)
- Height: `h-[60vh] md:h-[70vh]` maximum

---

## Icons

**Library**: Heroicons via CDN
- Shopping cart, user account, search, filter
- CO2 token indicator (cloud/leaf/fire icon)
- Navigation arrows, close buttons, checkmarks

---

## Interaction Patterns

**Minimal Animations**:
- Product card hover: `transition-transform duration-200 hover:scale-105`
- Cart drawer: Slide-in from right
- Button interactions: Standard hover/active states (no custom implementations on image overlays)
- Loading states: Simple spinner for API calls

**Responsive Behavior**:
- Mobile: Single-column product grid, hamburger navigation
- Tablet: 2-3 column grid, condensed filters
- Desktop: 4-column grid, persistent sidebar filters

---

## Images

**Product Photography**:
- High-quality fashion photography on clean backgrounds
- Consistent aspect ratio across all products
- Multiple angles for product detail pages
- Model shots and flat-lay compositions

**Placement**:
- Hero: Full-width lifestyle banner (optional)
- Product grid: Uniform product shots
- Detail pages: 4-6 images per product
- Category headers: Lifestyle imagery

**Large Hero Image**: Optional - if included, use lifestyle photography showcasing clothing in context with blurred-background CTA buttons overlaid.

---

## Key Differentiators

1. **Dual Currency Integration**: Seamless, always-visible pricing in both Euro and CO2
2. **Balance Awareness**: Persistent balance display in header
3. **Transaction Clarity**: Clear breakdown of both currency deductions
4. **CO2 Impact**: Highlight sustainability aspect throughout experience
5. **Zalando-Inspired Aesthetics**: Clean, minimalist, product-focused design with excellent whitespace usage