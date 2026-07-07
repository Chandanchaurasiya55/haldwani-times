---
name: Premium Editorial Aggregator
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#5c3f40'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#906f70'
  outline-variant: '#e5bdbe'
  surface-tint: '#be0037'
  primary: '#b80035'
  on-primary: '#ffffff'
  primary-container: '#e11d48'
  on-primary-container: '#fffaf9'
  inverse-primary: '#ffb3b6'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#535b71'
  on-tertiary: '#ffffff'
  tertiary-container: '#6c738a'
  on-tertiary-container: '#fcfaff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdada'
  primary-fixed-dim: '#ffb3b6'
  on-primary-fixed: '#40000c'
  on-primary-fixed-variant: '#920028'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-hero:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.05em
  metadata:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1440px
  sidebar-width: 280px
  gutter: 24px
  margin-desktop: 48px
  margin-mobile: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system is engineered for a premium, high-velocity editorial experience. It targets a sophisticated audience that demands clarity, speed, and a curated aesthetic. The brand personality is **authoritative yet contemporary**, blending the trustworthiness of traditional journalism with the fluid, high-gloss finish of a modern luxury startup.

The visual style is **Elevated Minimalism** with **Glassmorphic** accents. It prioritizes extreme legibility and "breathable" layouts, using generous whitespace to reduce cognitive load while consuming dense information. Surfaces are light and airy, punctuated by vibrant data-driven widgets and high-fidelity editorial imagery.

## Colors
The palette is rooted in a pristine white base to maximize readability and maintain a "gallery" feel for news content. 

- **Primary (#E11D48):** Used sparingly for urgent breaking news, live indicators, and critical calls to action.
- **Secondary (#2563EB):** Applied to interactive elements, text links, and financial data trends (positive).
- **Neutral (#F8FAFC):** Used for section staggering, card backgrounds, and sidebar containers to create subtle depth without heavy lines.
- **Text Tiers:** Use #0F172A for primary headlines to ensure high contrast, and #64748B for secondary metadata.

## Typography
This design system utilizes **Inter** for its neutral, systematic excellence and high legibility at small sizes. 

- **Hierarchy:** Dramatic scale shifts between "Display" and "Body" styles create a clear editorial path. 
- **Readability:** Body text uses a generous 1.6 line height to prevent eye fatigue during long-form reading.
- **Utility:** Use the `label-caps` style for category tags (e.g., "TECH", "FINANCE") to differentiate metadata from editorial copy.

## Layout & Spacing
The layout follows a **Hybrid Grid** model:
- **Hero & Trending:** A fixed-width top section for editorial control.
- **Main Feed:** A Pinterest-inspired masonry or multi-column fluid grid that adapts based on content height.
- **Sidebar:** A fixed 280px sidebar on the left for category navigation, providing constant access to 20+ verticals.

**Breakpoints:**
- **Desktop (1280px+):** Sidebar visible, 3-4 column feed.
- **Tablet (768px - 1279px):** Sidebar collapses into a hamburger menu, 2-column feed.
- **Mobile (<767px):** Single column feed, sticky bottom navigation for key categories.

## Elevation & Depth
Depth is achieved through **Soft Premium Shadows** and **Backdrop Blurs** rather than heavy borders.

- **Level 1 (Cards/Widgets):** `0px 4px 20px -2px rgba(0, 0, 0, 0.05)`. This creates a lifted effect that feels light and integrated.
- **Level 2 (Sticky Nav/Overlays):** `0px 10px 30px -5px rgba(0, 0, 0, 0.1)`. Used for the sticky top bar with a `backdrop-filter: blur(12px)` and 80% opacity white background.
- **Transitions:** All hover states should use a subtle Y-axis lift (-4px) and a deepening of the shadow to provide tactile feedback.

## Shapes
The design system uses a signature **18px (1.125rem) corner radius** for all primary cards and widgets. This specific "squircle-adjacent" roundness communicates a modern, friendly, and high-end tech aesthetic.

- **Small elements:** Buttons and tags use a 8px radius.
- **Inputs:** Search bars and form fields use a 12px radius.
- **Images:** Must inherit the 18px radius of their parent containers to maintain the fluid silhouette.

## Components
- **Editorial Cards:** 18px rounded corners. Headlines should be limited to 3 lines. Images use a subtle 1px inner border (`rgba(0,0,0,0.05)`) to define edges against white backgrounds.
- **Sticky Top Bar:** Glassmorphic (blur: 20px) with a thin bottom stroke (#F1F5F9). Contains search, user profile, and "Breaking News" ticker.
- **Stock/Crypto Widgets:** Compact horizontal cards with sparkline charts. Use Secondary Blue for neutral/up and Primary Rose for down trends.
- **AI Recommendations:** Styled with a subtle gradient border (Secondary Blue to Primary Rose) to signal "smart" generated content.
- **Native Ads:** Styled exactly like editorial cards but with a `label-caps` "SPONSORED" tag in #94A3B8 to maintain visual harmony while ensuring transparency.
- **Sidebar Nav:** High-density list with 12px vertical padding. Active states use a soft Primary Rose tint (#FFF1F2) and a 4px left-side indicator.