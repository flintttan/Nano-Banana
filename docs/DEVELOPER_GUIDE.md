# Developer Guide
## Frontend Development Guide for Nano BananaAI

**Version**: 1.0.0
**Last Updated**: December 10, 2025
**Target Audience**: Frontend Developers

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Design System Integration](#design-system-integration)
4. [Component Development](#component-development)
5. [Styling Guidelines](#styling-guidelines)
6. [JavaScript Patterns](#javascript-patterns)
7. [Responsive Development](#responsive-development)
8. [Testing & Validation](#testing--validation)
9. [Performance Best Practices](#performance-best-practices)
10. [Common Tasks](#common-tasks)

---

## Getting Started

### Prerequisites

- Node.js 16.0+ installed
- Basic understanding of HTML, CSS, JavaScript
- Familiarity with Tailwind CSS (optional but helpful)
- Knowledge of Modern Minimalist SaaS design principles

### Development Setup

```bash
# Clone the repository
git clone https://github.com/flintttan/Nano-Banana.git
cd Nano-Banana

# Install dependencies
npm install

# Start development server
npm run dev

# Access application
http://localhost:3000
```

### Required Files

- **Design System**: `public/styles/design-system.css` (core CSS)
- **Main Logic**: `public/main.js` (application JavaScript)
- **HTML Pages**: `public/*.html` (UI templates)

---

## Project Structure

### Frontend Directory

```
public/
├── styles/
│   └── design-system.css      # Design system CSS (70+ tokens)
├── index.html                 # Main AI drawing interface
├── login.html                 # Authentication interface
├── batch.html                 # Batch processing interface
├── tutorial.html              # Tutorial/help page
├── api-docs.html              # API documentation
└── main.js                    # Frontend application logic
```

### Key Files

**design-system.css** (849 lines)
- CSS custom properties (design tokens)
- Base component classes
- Utility classes
- Animations

**main.js** (1,541 lines)
- Image generation logic
- User authentication
- API integration
- Event handling

**index.html** (Main interface)
- Control panel
- Image gallery
- User profile section

---

## Design System Integration

### Using Design Tokens

#### Color Tokens
```css
/* DO - Use design tokens */
.my-component {
  background-color: var(--bg-surface);
  color: var(--text-primary);
  border-color: var(--border-default);
}

/* DON'T - Hardcode values */
.my-component {
  background-color: #ffffff;
  color: #111827;
  border-color: #e5e7eb;
}
```

#### Spacing Tokens
```css
/* DO - Use spacing scale */
.my-component {
  padding: var(--space-6);      /* 24px */
  margin-bottom: var(--space-4); /* 16px */
  gap: var(--space-4);           /* 16px */
}

/* DON'T - Hardcode spacing */
.my-component {
  padding: 24px;
  margin-bottom: 16px;
  gap: 16px;
}
```

#### Typography Tokens
```css
/* DO - Use typography scale */
.heading {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
}

/* DON'T - Hardcode typography */
.heading {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.25;
}
```

### Available Design Tokens

```css
/* Colors */
--bg-page, --bg-surface, --bg-surface-secondary
--text-primary, --text-secondary, --text-tertiary
--accent-orange, --accent-orange-hover
--success, --warning, --error, --info

/* Spacing */
--space-1 (4px) to --space-16 (64px)

/* Typography */
--text-xs (12px) to --text-4xl (36px)
--font-normal, --font-medium, --font-semibold, --font-bold

/* Shadows */
--shadow-xs, --shadow-sm, --shadow-md, --shadow-lg, --shadow-xl

/* Border Radius */
--radius-sm, --radius-md, --radius-lg, --radius-xl, --radius-full

/* Transitions */
--transition-fast (150ms), --transition-normal (200ms), --transition-slow (300ms)
```

---

## Component Development

### Creating New Components

#### Step 1: Design Component Structure

```html
<!-- Example: New notification component -->
<div class="notification">
  <div class="notification-icon">
    <i class="fa-solid fa-bell"></i>
  </div>
  <div class="notification-content">
    <h4 class="notification-title">Notification Title</h4>
    <p class="notification-message">Notification message goes here.</p>
  </div>
  <button class="notification-close">
    <i class="fa-solid fa-times"></i>
  </button>
</div>
```

#### Step 2: Add Component Styles

```css
/* Base component styles in design-system.css */
.notification {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  background-color: var(--bg-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  border-left: 4px solid var(--accent-orange);
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--accent-orange-light);
  border-radius: var(--radius-full);
  color: var(--accent-orange);
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.notification-message {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: var(--leading-normal);
}

.notification-close {
  flex-shrink: 0;
  padding: var(--space-2);
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.notification-close:hover {
  color: var(--text-primary);
}
```

#### Step 3: Add Component Variants

```css
/* Success variant */
.notification.notification-success {
  border-left-color: var(--success);
}

.notification-success .notification-icon {
  background-color: var(--success-light);
  color: var(--success);
}

/* Warning variant */
.notification.notification-warning {
  border-left-color: var(--warning);
}

.notification-warning .notification-icon {
  background-color: var(--warning-light);
  color: var(--warning);
}

/* Error variant */
.notification.notification-error {
  border-left-color: var(--error);
}

.notification-error .notification-icon {
  background-color: var(--error-light);
  color: var(--error);
}
```

#### Step 4: Add JavaScript Behavior

```javascript
// Create notification function
function showNotification(type, title, message) {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;

  notification.innerHTML = `
    <div class="notification-icon">
      <i class="fa-solid fa-${getIconForType(type)}"></i>
    </div>
    <div class="notification-content">
      <h4 class="notification-title">${title}</h4>
      <p class="notification-message">${message}</p>
    </div>
    <button class="notification-close">
      <i class="fa-solid fa-times"></i>
    </button>
  `;

  // Add close handler
  notification.querySelector('.notification-close').addEventListener('click', () => {
    notification.remove();
  });

  // Add to DOM
  document.body.appendChild(notification);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    notification.remove();
  }, 5000);
}

function getIconForType(type) {
  const icons = {
    success: 'check-circle',
    warning: 'exclamation-triangle',
    error: 'times-circle',
    info: 'info-circle'
  };
  return icons[type] || 'bell';
}

// Usage
showNotification('success', 'Success', 'Operation completed successfully');
```

### Extending Base Components

#### Extending Card Component

```html
<!-- Base card -->
<div class="card">
  <p>Basic card content</p>
</div>

<!-- Extended card with custom styling -->
<div class="card custom-card">
  <div class="card-header">
    <h3 class="text-lg font-semibold">Custom Card</h3>
    <button class="btn btn-ghost">Action</button>
  </div>
  <div class="card-body">
    <p class="text-sm text-gray-600">Card content</p>
  </div>
  <div class="card-footer">
    <button class="btn btn-primary">Submit</button>
  </div>
</div>
```

```css
/* Custom card styles */
.custom-card {
  padding: 0; /* Override base padding */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-6);
  border-bottom: 1px solid var(--border-subtle);
}

.card-body {
  padding: var(--space-6);
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-6);
  border-top: 1px solid var(--border-subtle);
  background-color: var(--bg-surface-secondary);
}
```

### Component Patterns

#### Interactive Card with Hover

```html
<div class="card card-interactive">
  <h3 class="text-lg font-semibold mb-2">Interactive Card</h3>
  <p class="text-sm text-gray-600">Hover to see effect</p>
</div>
```

```css
.card-interactive {
  cursor: pointer;
  transition: all var(--transition-normal);
}

.card-interactive:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.card-interactive:active {
  transform: translateY(0);
}
```

#### Loading State Component

```html
<div class="card card-loading">
  <div class="loading-spinner"></div>
  <p class="text-sm text-gray-600 mt-4">Loading...</p>
</div>
```

```css
.card-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-subtle);
  border-top-color: var(--accent-orange);
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## Styling Guidelines

### CSS Architecture

#### Organization
1. **CSS Custom Properties** (Design Tokens)
2. **Base Styles** (HTML reset, body)
3. **Component Base Classes** (card, btn, input)
4. **Component Variants** (btn-primary, btn-secondary)
5. **Utility Classes** (helpers, animations)

#### Naming Conventions

```css
/* Component naming: .component-name */
.card { }
.btn { }
.input { }

/* Component variant: .component-variant */
.btn-primary { }
.btn-secondary { }

/* Component modifier: .component--modifier */
.card--hover { }
.btn--disabled { }

/* Component element: .component-element */
.card-header { }
.card-body { }
.card-footer { }
```

### Tailwind CSS Integration

#### Using Tailwind Utilities

```html
<!-- Prefer Tailwind utilities for layout and spacing -->
<div class="flex items-center justify-between gap-4 p-6">
  <h3 class="text-lg font-semibold">Title</h3>
  <button class="btn btn-primary">Action</button>
</div>

<!-- Use custom classes for complex components -->
<div class="card notification-card">
  <!-- Component content -->
</div>
```

#### When to Use Custom CSS vs. Tailwind

**Use Custom CSS When**:
- Creating reusable components (card, btn, input)
- Complex hover/focus states
- Component-specific animations
- Need design token consistency

**Use Tailwind When**:
- Layout (flex, grid)
- Spacing (padding, margin, gap)
- Simple utility needs (text color, font size)
- Responsive variants

### Shadow Best Practices

```css
/* DO - Use shadows for depth */
.card {
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-subtle); /* Very subtle border optional */
}

.card:hover {
  box-shadow: var(--shadow-md); /* Increase on hover */
}

/* DON'T - Use heavy borders */
.card {
  border: 2px solid var(--border-strong);
}
```

### Color Usage Best Practices

```css
/* DO - Use semantic color tokens */
.success-message {
  background-color: var(--success-light);
  color: var(--success);
}

/* DO - Use text hierarchy */
.heading {
  color: var(--text-primary);    /* High contrast */
}

.description {
  color: var(--text-secondary);  /* Medium contrast */
}

.metadata {
  color: var(--text-tertiary);   /* Low contrast */
}

/* DON'T - Use arbitrary colors */
.custom-element {
  background-color: #FFE5CC;
  color: #8B4513;
}
```

---

## JavaScript Patterns

### API Integration

#### Making API Calls

```javascript
// GET request with authentication
async function fetchUserData() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/user/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    showNotification('error', 'Error', 'Failed to load user data');
    throw error;
  }
}

// POST request with data
async function generateImage(params) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/image/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Generation failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating image:', error);
    showNotification('error', 'Error', error.message);
    throw error;
  }
}
```

#### Debouncing API Calls

```javascript
// Debounce function
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// Usage
const debouncedSearch = debounce(async (query) => {
  const results = await fetch(`/api/search?q=${query}`);
  displayResults(results);
}, 300);

// Attach to input
searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});
```

### DOM Manipulation

#### Creating Elements

```javascript
// Create card element
function createImageCard(image) {
  const card = document.createElement('div');
  card.className = 'card image-card';

  card.innerHTML = `
    <img src="${image.url}"
         alt="${image.prompt}"
         loading="lazy"
         class="w-full h-auto rounded-lg">
    <div class="mt-4">
      <p class="text-sm text-gray-600 line-clamp-2">${image.prompt}</p>
      <div class="flex items-center justify-between mt-2">
        <span class="text-xs text-gray-500">${formatDate(image.createdAt)}</span>
        <button class="btn btn-ghost btn-sm" onclick="deleteImage('${image.id}')">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>
  `;

  return card;
}

// Add to gallery
function addImageToGallery(image) {
  const gallery = document.getElementById('image-gallery');
  const card = createImageCard(image);
  gallery.prepend(card); // Add to beginning
}
```

#### Event Handling

```javascript
// Event delegation for dynamic elements
document.getElementById('image-gallery').addEventListener('click', (e) => {
  // Handle delete button clicks
  if (e.target.closest('.btn-delete')) {
    const imageId = e.target.closest('.image-card').dataset.imageId;
    deleteImage(imageId);
  }

  // Handle image clicks (open modal)
  if (e.target.tagName === 'IMG') {
    const imageUrl = e.target.src;
    openImageModal(imageUrl);
  }
});

// Form submission
document.getElementById('generate-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const params = Object.fromEntries(formData);

  try {
    showLoading();
    const result = await generateImage(params);
    addImageToGallery(result.image);
    showNotification('success', 'Success', 'Image generated successfully');
  } catch (error) {
    showNotification('error', 'Error', error.message);
  } finally {
    hideLoading();
  }
});
```

### Error Handling

```javascript
// Centralized error handler
function handleError(error, context = '') {
  console.error(`Error in ${context}:`, error);

  // User-friendly messages
  let message = 'An unexpected error occurred';

  if (error.message.includes('401')) {
    message = 'Authentication required. Please login.';
    redirectToLogin();
  } else if (error.message.includes('403')) {
    message = 'You don\'t have permission for this action.';
  } else if (error.message.includes('404')) {
    message = 'Resource not found.';
  } else if (error.message.includes('500')) {
    message = 'Server error. Please try again later.';
  }

  showNotification('error', 'Error', message);
}

// Usage
try {
  await generateImage(params);
} catch (error) {
  handleError(error, 'Image Generation');
}
```

---

## Responsive Development

### Mobile-First Approach

```html
<!-- Start with mobile layout, enhance for larger screens -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Cards adapt: 1 column → 2 columns → 3 columns -->
</div>

<div class="flex flex-col lg:flex-row gap-6">
  <!-- Stack on mobile, side-by-side on desktop -->
  <aside class="lg:w-64">Sidebar</aside>
  <main class="flex-1">Main Content</main>
</div>
```

### Responsive Utility Classes

```html
<!-- Hide/show based on breakpoint -->
<div class="hidden lg:block">Desktop Only</div>
<div class="lg:hidden">Mobile Only</div>

<!-- Responsive spacing -->
<div class="p-4 lg:p-8">Responsive padding</div>

<!-- Responsive typography -->
<h1 class="text-2xl lg:text-4xl">Responsive heading</h1>

<!-- Responsive grid -->
<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  <!-- Responsive grid: 2 → 3 → 4 columns -->
</div>
```

### Testing Responsive Design

```javascript
// Test for mobile viewport
function isMobile() {
  return window.innerWidth < 768;
}

// Adjust behavior based on viewport
if (isMobile()) {
  // Mobile-specific behavior
  enableTouchGestures();
} else {
  // Desktop-specific behavior
  enableKeyboardShortcuts();
}

// Listen for resize
window.addEventListener('resize', () => {
  if (isMobile()) {
    switchToMobileLayout();
  } else {
    switchToDesktopLayout();
  }
});
```

---

## Testing & Validation

### Manual Testing Checklist

#### Visual Testing
- [ ] Design matches Modern Minimalist SaaS aesthetic
- [ ] Colors follow design system (gray-50, white, orange-500)
- [ ] Typography hierarchy is clear
- [ ] Spacing is consistent
- [ ] Shadows are used instead of borders
- [ ] Rounded corners are consistent (rounded-xl/2xl)

#### Functionality Testing
- [ ] All buttons and links work
- [ ] Forms validate correctly
- [ ] API calls succeed
- [ ] Error handling works
- [ ] Loading states display
- [ ] Success messages appear

#### Responsive Testing
- [ ] Mobile (320px - 640px) works
- [ ] Tablet (640px - 1024px) works
- [ ] Desktop (1024px+) works
- [ ] Touch targets are 44px minimum
- [ ] Text is readable on all screens

#### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Focus states are visible
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Alt text on images
- [ ] ARIA labels on interactive elements

### Browser Testing

Test on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

### Performance Validation

```javascript
// Check bundle size
console.log('CSS size:', document.querySelector('link[href*="design-system"]').sheet.cssRules.length);

// Measure page load
window.addEventListener('load', () => {
  const perfData = window.performance.timing;
  const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
  console.log('Page load time:', pageLoadTime + 'ms');
});

// Monitor API response times
async function fetchWithTiming(url, options) {
  const start = performance.now();
  const response = await fetch(url, options);
  const end = performance.now();
  console.log(`API call to ${url} took ${end - start}ms`);
  return response;
}
```

---

## Performance Best Practices

### Image Optimization

```html
<!-- Use lazy loading -->
<img src="image.jpg" loading="lazy" alt="Description">

<!-- Use responsive images -->
<img srcset="image-320w.jpg 320w,
             image-640w.jpg 640w,
             image-1024w.jpg 1024w"
     sizes="(max-width: 640px) 320px,
            (max-width: 1024px) 640px,
            1024px"
     src="image-640w.jpg"
     alt="Description">

<!-- Optimize with error fallback -->
<img src="image.jpg"
     onerror="this.onerror=null; this.src='/uploads/'+this.src.split('/').pop();"
     loading="lazy"
     alt="Description">
```

### JavaScript Performance

```javascript
// Cache DOM queries
const gallery = document.getElementById('image-gallery');
const generateBtn = document.getElementById('generate-btn');

// Use event delegation
gallery.addEventListener('click', handleGalleryClick);

// Debounce expensive operations
const debouncedResize = debounce(() => {
  recalculateLayout();
}, 300);

window.addEventListener('resize', debouncedResize);

// Use requestAnimationFrame for animations
function animateElement(element) {
  requestAnimationFrame(() => {
    element.classList.add('animate-in');
  });
}
```

### CSS Performance

```css
/* Use efficient selectors */
.card { } /* Good - class selector */
#header { } /* Good - ID selector */
.card .header { } /* OK - short chain */

div.card { } /* Avoid - tag + class */
.card .header .title .text { } /* Avoid - long chain */

/* Use CSS custom properties for dynamic values */
.element {
  color: var(--text-primary); /* Cached by browser */
}

/* Avoid expensive properties */
.element {
  box-shadow: var(--shadow-sm); /* OK */
  /* Avoid: filter, backdrop-filter on many elements */
}
```

---

## Common Tasks

### Adding a New Page

1. **Create HTML file** in `public/` directory
   ```html
   <!DOCTYPE html>
   <html lang="zh-CN">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>New Page - Nano BananaAI</title>

     <!-- External CSS -->
     <script src="https://cdn.tailwindcss.com"></script>
     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

     <!-- Design System -->
     <link rel="stylesheet" href="styles/design-system.css">
   </head>
   <body>
     <!-- Page content -->

     <script src="main.js"></script>
   </body>
   </html>
   ```

2. **Add page structure** using design system components
3. **Add page-specific styles** if needed
4. **Add page-specific JavaScript** if needed
5. **Test on all breakpoints**

### Modifying Existing Components

1. **Locate component** in `public/styles/design-system.css`
2. **Create variant** instead of modifying base
   ```css
   /* Base component (don't modify) */
   .btn { ... }

   /* Create variant */
   .btn-large {
     padding: var(--space-4) var(--space-6);
     font-size: var(--text-lg);
   }
   ```
3. **Test changes** across all pages using component
4. **Update documentation** if needed

### Adding New Design Tokens

1. **Add to `:root` section** in `design-system.css`
   ```css
   :root {
     /* Existing tokens... */

     /* New token */
     --new-color: #value;
   }
   ```

2. **Use token** in components
   ```css
   .component {
     color: var(--new-color);
   }
   ```

3. **Document in Design System Guide**

### Debugging Common Issues

#### Component Not Styling Correctly
1. Check if design-system.css is loaded
2. Verify class names match exactly
3. Check for CSS specificity conflicts
4. Inspect in browser DevTools

#### Responsive Layout Breaking
1. Test at exact breakpoints (640px, 768px, 1024px)
2. Check for hardcoded widths
3. Verify flex/grid settings
4. Test on real devices

#### JavaScript Errors
1. Check browser console for errors
2. Verify API endpoints
3. Check authentication token
4. Test error handling

---

## Resources

### Documentation
- [Design System Guide](./DESIGN_SYSTEM_GUIDE.md)
- [Frontend Refactoring Summary](./FRONTEND_REFACTORING_SUMMARY.md)
- [Project README](../README.md)

### External Resources
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [MDN Web Docs](https://developer.mozilla.org/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Design References
- [Inter Font](https://fonts.google.com/specimen/Inter)
- [Font Awesome Icons](https://fontawesome.com/icons)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)

---

## Getting Help

- **Questions**: Open an issue on GitHub
- **Bug Reports**: Include browser, OS, and steps to reproduce
- **Feature Requests**: Describe use case and expected behavior
- **Documentation**: Refer to docs/ directory

---

**Version**: 1.0.0
**Last Updated**: December 10, 2025
**Maintained by**: Nano BananaAI Team

---

*Happy coding! Build something amazing.*
