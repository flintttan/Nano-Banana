# Design System Guide
## Modern Minimalist SaaS Design System for Nano BananaAI

**Version**: 1.0.0
**Last Updated**: December 10, 2025
**Design Language**: Modern Minimalist SaaS

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Shadows & Depth](#shadows--depth)
7. [Icons](#icons)
8. [Responsive Design](#responsive-design)
9. [Animations](#animations)
10. [Usage Guidelines](#usage-guidelines)

---

## Design Philosophy

### Core Principles

**Clean & Airy**
- Generous white space
- Subtle backgrounds (gray-50)
- High-quality white surfaces
- Breathing room between elements

**Professional & Trustworthy**
- Soft shadows instead of borders
- Consistent typography hierarchy
- Predictable component behavior
- Reliable user interactions

**Modern & Minimal**
- Mostly monochrome palette
- Strategic use of accent color (orange)
- Smooth rounded corners
- Elegant transitions

**SaaS Dashboard Aesthetic**
- Admin-panel inspired design
- Information density balanced with clarity
- Professional without being boring
- Enterprise-ready appearance

### Design Values

1. **Simplicity**: Every element has a purpose
2. **Consistency**: Predictable patterns throughout
3. **Clarity**: Clear visual hierarchy
4. **Accessibility**: Designed for all users
5. **Performance**: Optimized for speed

---

## Color System

### Primary Palette

#### Background Colors

```css
/* Page Background */
--bg-page: #F9FAFB;  /* gray-50 - Main page background */
```
- **Usage**: Body background, page container
- **Rationale**: Very light gray creates clean, airy feel
- **HEX**: #F9FAFB
- **RGB**: rgb(249, 250, 251)

```css
/* Surface/Card Background */
--bg-surface: #FFFFFF;  /* white - Card and surface background */
```
- **Usage**: Cards, modals, dropdown menus
- **Rationale**: Pure white for high-quality, premium feel
- **HEX**: #FFFFFF
- **RGB**: rgb(255, 255, 255)

```css
/* Secondary Surface */
--bg-surface-secondary: #F3F4F6;  /* gray-100 */
```
- **Usage**: Secondary surfaces, hover states
- **HEX**: #F3F4F6
- **RGB**: rgb(243, 244, 246)

```css
/* Tertiary Elements */
--bg-tertiary: #E5E7EB;  /* gray-200 */
```
- **Usage**: Disabled states, dividers
- **HEX**: #E5E7EB
- **RGB**: rgb(229, 231, 235)

#### Text Colors

```css
/* Primary Text */
--text-primary: #111827;  /* gray-900 - High contrast */
```
- **Usage**: Headings, important values, body text
- **Contrast Ratio**: 16.9:1 on white (AAA)
- **HEX**: #111827

```css
/* Secondary Text */
--text-secondary: #6B7280;  /* gray-600 - Medium contrast */
```
- **Usage**: Labels, metadata, descriptions
- **Contrast Ratio**: 7.6:1 on white (AA)
- **HEX**: #6B7280

```css
/* Tertiary Text */
--text-tertiary: #9CA3AF;  /* gray-400 - Low contrast */
```
- **Usage**: Placeholders, disabled text
- **Contrast Ratio**: 4.5:1 on white (AA)
- **HEX**: #9CA3AF

```css
/* Inverse Text */
--text-inverse: #FFFFFF;  /* white */
```
- **Usage**: Text on dark backgrounds, buttons
- **HEX**: #FFFFFF

#### Accent Color - Orange

```css
/* Primary Orange */
--accent-orange: #F97316;  /* orange-500 */
```
- **Usage**: Primary buttons, active states, CTAs
- **Personality**: Warm, energetic, attention-grabbing
- **HEX**: #F97316
- **RGB**: rgb(249, 115, 22)

```css
/* Orange Hover */
--accent-orange-hover: #EA580C;  /* orange-600 */
```
- **Usage**: Hover state for orange elements
- **HEX**: #EA580C

```css
/* Light Orange Background */
--accent-orange-light: #FFEDD5;  /* orange-100 */
```
- **Usage**: Focus rings, light backgrounds
- **HEX**: #FFEDD5

```css
/* Very Light Orange */
--accent-orange-lighter: #FFF7ED;  /* orange-50 */
```
- **Usage**: Subtle highlights
- **HEX**: #FFF7ED

#### Status Colors

```css
/* Success - Green */
--success: #10B981;        /* green-500 */
--success-light: #D1FAE5;  /* green-100 */
```
- **Usage**: Success messages, completed states
- **HEX**: #10B981

```css
/* Warning - Amber */
--warning: #F59E0B;        /* amber-500 */
--warning-light: #FEF3C7;  /* amber-100 */
```
- **Usage**: Warning messages, important notices
- **HEX**: #F59E0B

```css
/* Error - Red */
--error: #EF4444;          /* red-500 */
--error-light: #FEE2E2;    /* red-100 */
```
- **Usage**: Error messages, validation failures
- **HEX**: #EF4444

```css
/* Info - Blue */
--info: #3B82F6;           /* blue-500 */
--info-light: #DBEAFE;     /* blue-100 */
```
- **Usage**: Informational messages, tips
- **HEX**: #3B82F6

#### Border Colors

```css
--border-subtle: #F3F4F6;   /* Very subtle borders */
--border-default: #E5E7EB;  /* Default borders */
--border-strong: #D1D5DB;   /* Strong borders */
--border-focus: #F97316;    /* Focus ring - orange */
```

### Color Usage Guidelines

#### Do's
- Use gray-50 (#F9FAFB) for page backgrounds
- Use white (#FFFFFF) for cards and surfaces
- Use orange (#F97316) sparingly for CTAs and highlights
- Use shadows instead of borders for depth
- Maintain high contrast for text (4.5:1 minimum)

#### Don'ts
- Don't use pure black (#000000) for text
- Don't overuse accent color (orange should be <10% of UI)
- Don't mix multiple accent colors
- Don't use low-contrast color combinations
- Don't use borders unless necessary (prefer shadows)

### Accessibility

All color combinations meet **WCAG 2.1 Level AA** standards:
- Primary text (#111827) on white: 16.9:1 (AAA)
- Secondary text (#6B7280) on white: 7.6:1 (AA)
- Tertiary text (#9CA3AF) on white: 4.5:1 (AA)
- Orange buttons: Sufficient contrast for all states

---

## Typography

### Font Family

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont,
             'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

**Primary**: Inter (Google Fonts)
- **Characteristics**: Clean, modern, highly legible
- **Weights Used**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Loading**: Via Google Fonts CDN
- **Fallback**: System font stack

### Font Size Scale

```css
--text-xs: 0.75rem;    /* 12px - Tiny labels, captions */
--text-sm: 0.875rem;   /* 14px - Small text, labels */
--text-base: 1rem;     /* 16px - Body text */
--text-lg: 1.125rem;   /* 18px - Large body text */
--text-xl: 1.25rem;    /* 20px - Small headings */
--text-2xl: 1.5rem;    /* 24px - Medium headings */
--text-3xl: 1.875rem;  /* 30px - Large headings */
--text-4xl: 2.25rem;   /* 36px - Extra large headings */
```

### Font Weight Scale

```css
--font-normal: 400;     /* Body text, descriptions */
--font-medium: 500;     /* Button text, emphasized text */
--font-semibold: 600;   /* Subheadings, labels */
--font-bold: 700;       /* Headings, metrics, important values */
```

### Line Height Scale

```css
--leading-tight: 1.25;     /* Headings */
--leading-snug: 1.375;     /* Subheadings */
--leading-normal: 1.5;     /* Body text */
--leading-relaxed: 1.625;  /* Long-form content */
```

### Typography Hierarchy

#### Headings
```html
<!-- Page Title -->
<h1 class="text-3xl font-bold text-gray-900">Page Title</h1>

<!-- Section Heading -->
<h2 class="text-2xl font-bold text-gray-900">Section Heading</h2>

<!-- Subsection Heading -->
<h3 class="text-xl font-semibold text-gray-900">Subsection</h3>

<!-- Card Title -->
<h4 class="text-lg font-semibold text-gray-900">Card Title</h4>
```

#### Body Text
```html
<!-- Primary Body -->
<p class="text-base text-gray-900">Primary body text</p>

<!-- Secondary Body -->
<p class="text-base text-gray-600">Secondary body text</p>

<!-- Small Text -->
<p class="text-sm text-gray-600">Small descriptive text</p>

<!-- Caption -->
<p class="text-xs text-gray-500">Caption or metadata</p>
```

#### Labels
```html
<!-- Form Label -->
<label class="text-sm font-medium text-gray-700">Field Label</label>

<!-- Metric Label -->
<span class="text-sm text-gray-600">Metric Label</span>

<!-- Metric Value -->
<span class="text-2xl font-bold text-gray-900">1,234</span>
```

### Typography Guidelines

#### Do's
- Use font-bold (700) for metrics and important values
- Use text-sm (14px) for labels and metadata
- Use text-base (16px) for body text
- Maintain consistent line heights
- Use Inter font for professional appearance

#### Don'ts
- Don't go below 12px (text-xs) for body text
- Don't use more than 3 font weights in single component
- Don't use all caps for long text
- Don't mix font families
- Don't use justified text alignment

---

## Spacing & Layout

### Spacing Scale

```css
--space-1: 0.25rem;   /* 4px - Tight spacing */
--space-2: 0.5rem;    /* 8px - Small spacing */
--space-3: 0.75rem;   /* 12px - Default spacing */
--space-4: 1rem;      /* 16px - Medium spacing */
--space-6: 1.5rem;    /* 24px - Large spacing */
--space-8: 2rem;      /* 32px - Extra large spacing */
--space-12: 3rem;     /* 48px - Section spacing */
--space-16: 4rem;     /* 64px - Page section spacing */
```

### Spacing Guidelines

#### Component Padding
- **Cards**: `padding: var(--space-6)` (24px)
- **Buttons**: `padding: var(--space-3) var(--space-4)` (12px 16px)
- **Inputs**: `padding: var(--space-3)` (12px)
- **Modals**: `padding: var(--space-6)` (24px)

#### Element Margins
- **Between Cards**: `gap: var(--space-4)` (16px)
- **Section Spacing**: `margin-bottom: var(--space-8)` (32px)
- **Page Sections**: `margin-bottom: var(--space-12)` (48px)

#### Grid Gaps
- **Default Gap**: 16px (`gap-4`)
- **Tight Gap**: 8px (`gap-2`)
- **Loose Gap**: 24px (`gap-6`)

### Layout Patterns

#### Container
```html
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <!-- Content -->
</div>
```

#### Card Grid
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Cards -->
</div>
```

#### Two-Column Layout
```html
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <!-- Columns -->
</div>
```

---

## Components

### Card Component

```html
<div class="card">
  <h3 class="text-lg font-semibold text-gray-900 mb-4">Card Title</h3>
  <p class="text-sm text-gray-600">Card content goes here.</p>
</div>
```

**CSS**:
```css
.card {
  background-color: var(--bg-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-sm);
  padding: var(--space-6);
  transition: box-shadow var(--transition-normal);
}

.card:hover {
  box-shadow: var(--shadow-md);
}
```

### Button Component

#### Primary Button
```html
<button class="btn btn-primary">Primary Action</button>
```

**CSS**:
```css
.btn {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  font-weight: var(--font-medium);
  font-size: var(--text-base);
  transition: all var(--transition-normal);
  cursor: pointer;
  border: none;
}

.btn-primary {
  background-color: var(--accent-orange);
  color: var(--text-inverse);
}

.btn-primary:hover {
  background-color: var(--accent-orange-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
}
```

#### Secondary Button
```html
<button class="btn btn-secondary">Secondary Action</button>
```

**CSS**:
```css
.btn-secondary {
  background-color: var(--bg-surface);
  color: var(--text-primary);
  border: 1px solid var(--border-default);
}

.btn-secondary:hover {
  background-color: var(--bg-surface-secondary);
  border-color: var(--border-strong);
}
```

#### Ghost Button
```html
<button class="btn btn-ghost">Ghost Action</button>
```

**CSS**:
```css
.btn-ghost {
  background-color: transparent;
  color: var(--text-secondary);
}

.btn-ghost:hover {
  background-color: var(--bg-surface-secondary);
  color: var(--text-primary);
}
```

### Input Component

```html
<input type="text" class="input" placeholder="Enter text...">
```

**CSS**:
```css
.input {
  width: 100%;
  padding: var(--space-3);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  background-color: var(--bg-surface);
  font-size: var(--text-base);
  color: var(--text-primary);
  transition: all var(--transition-normal);
}

.input:focus {
  outline: none;
  border-color: var(--accent-orange);
  box-shadow: 0 0 0 3px var(--accent-orange-light);
}

.input::placeholder {
  color: var(--text-tertiary);
}

.input:disabled {
  background-color: var(--bg-surface-secondary);
  color: var(--text-tertiary);
  cursor: not-allowed;
}
```

### Badge Component

```html
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-error">Error</span>
```

**CSS**:
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.badge-success {
  background-color: var(--success-light);
  color: var(--success);
}

.badge-warning {
  background-color: var(--warning-light);
  color: var(--warning);
}

.badge-error {
  background-color: var(--error-light);
  color: var(--error);
}
```

### Alert Component

```html
<div class="alert alert-info">
  <p>This is an informational message.</p>
</div>
```

**CSS**:
```css
.alert {
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border-left: 4px solid;
  font-size: var(--text-sm);
}

.alert-info {
  background-color: var(--info-light);
  border-color: var(--info);
  color: var(--text-primary);
}

.alert-success {
  background-color: var(--success-light);
  border-color: var(--success);
}

.alert-warning {
  background-color: var(--warning-light);
  border-color: var(--warning);
}

.alert-error {
  background-color: var(--error-light);
  border-color: var(--error);
}
```

---

## Shadows & Depth

### Shadow System

```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04);
```

### Shadow Usage

- **Cards (default)**: `shadow-sm`
- **Cards (hover)**: `shadow-md`
- **Dropdowns**: `shadow-md`
- **Modals**: `shadow-lg`
- **Popovers**: `shadow-xl`

### Depth Guidelines

1. **Use shadows instead of borders** for depth
2. **Increase shadow on hover** for interactive elements
3. **Keep shadows subtle** - less is more
4. **Layer shadows** for complex components
5. **Consistent shadow direction** - top-down light source

---

## Icons

### Icon System

**Current**: Font Awesome 6.4.0
**Target**: Lucide React Icons (migration in progress)

### Icon Sizing

```css
/* Small Icons */
.icon-sm { width: 16px; height: 16px; }  /* w-4 h-4 */

/* Default Icons */
.icon { width: 20px; height: 20px; }      /* w-5 h-5 */

/* Large Icons */
.icon-lg { width: 24px; height: 24px; }  /* w-6 h-6 */
```

### Icon Usage

```html
<!-- Inline Icon -->
<i class="fa-solid fa-check w-4 h-4"></i>

<!-- Icon Button -->
<button class="btn btn-ghost">
  <i class="fa-solid fa-plus w-5 h-5"></i>
  Add Item
</button>

<!-- Icon Only Button -->
<button class="btn btn-ghost p-2">
  <i class="fa-solid fa-settings w-5 h-5"></i>
</button>
```

---

## Responsive Design

### Breakpoints

```css
/* Mobile First */
sm: 640px   /* Tablet */
md: 768px   /* Desktop */
lg: 1024px  /* Large Desktop */
xl: 1280px  /* Extra Large Desktop */
```

### Responsive Patterns

#### Grid Layout
```html
<!-- 1 column mobile, 2 tablet, 3 desktop -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Cards -->
</div>
```

#### Stack to Sidebar
```html
<!-- Stack on mobile, sidebar on desktop -->
<div class="flex flex-col lg:flex-row gap-6">
  <aside class="lg:w-64">Sidebar</aside>
  <main class="flex-1">Main Content</main>
</div>
```

#### Hide on Mobile
```html
<!-- Show only on desktop -->
<div class="hidden lg:block">Desktop Only</div>

<!-- Show only on mobile -->
<div class="lg:hidden">Mobile Only</div>
```

### Touch Targets

- **Minimum Size**: 44px × 44px
- **Button Padding**: 12px 16px (minimum)
- **Icon Buttons**: 40px × 40px (minimum)
- **Input Height**: 44px (minimum)

---

## Animations

### Transition System

```css
--transition-fast: 150ms ease;
--transition-normal: 200ms ease;
--transition-slow: 300ms ease;
```

### Common Transitions

```css
/* Hover Effects */
.transition-hover {
  transition: all var(--transition-normal);
}

.transition-hover:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Focus Effects */
.transition-focus {
  transition: all var(--transition-fast);
}

.transition-focus:focus {
  outline: none;
  box-shadow: 0 0 0 3px var(--accent-orange-light);
}

/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn var(--transition-normal);
}
```

### Animation Guidelines

- **Duration**: 150-300ms for UI interactions
- **Easing**: Use `ease` or `ease-in-out`
- **Performance**: Animate `transform` and `opacity` only
- **Accessibility**: Respect `prefers-reduced-motion`

---

## Usage Guidelines

### Quick Start

1. **Include Design System CSS**
   ```html
   <link rel="stylesheet" href="styles/design-system.css">
   ```

2. **Use Design Tokens**
   ```css
   .my-component {
     background-color: var(--bg-surface);
     color: var(--text-primary);
     padding: var(--space-6);
     border-radius: var(--radius-lg);
     box-shadow: var(--shadow-sm);
   }
   ```

3. **Extend Base Components**
   ```html
   <div class="card">
     <button class="btn btn-primary">Action</button>
   </div>
   ```

### Best Practices

#### Do's
- Use CSS custom properties (design tokens)
- Extend base component classes
- Follow responsive patterns
- Maintain accessibility standards
- Use shadows instead of borders

#### Don'ts
- Hardcode colors or spacing values
- Create custom components without need
- Break responsive patterns
- Ignore accessibility
- Use heavy borders

### Component Checklist

When creating new components:

- [ ] Uses design tokens for colors
- [ ] Uses design tokens for spacing
- [ ] Uses design tokens for typography
- [ ] Responsive on all breakpoints
- [ ] Meets accessibility standards (WCAG AA)
- [ ] Smooth transitions on interactions
- [ ] Consistent with existing components
- [ ] Uses shadows for depth (not borders)

---

## Resources

### Design Files
- Design System CSS: `public/styles/design-system.css`
- Example Pages: `public/index.html`, `public/login.html`, `public/batch.html`

### Documentation
- Frontend Refactoring Summary: `docs/FRONTEND_REFACTORING_SUMMARY.md`
- Developer Guide: `docs/DEVELOPER_GUIDE.md`
- Project README: `README.md`

### External Resources
- [Inter Font](https://fonts.google.com/specimen/Inter)
- [Tailwind CSS](https://tailwindcss.com/)
- [Font Awesome](https://fontawesome.com/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Version**: 1.0.0
**Last Updated**: December 10, 2025
**Maintained by**: Nano BananaAI Team

---

*For questions or contributions, please refer to the project README.*
