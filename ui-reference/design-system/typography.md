# Typography System

CleanEase uses a clean, modern typography hierarchy built on system fonts for optimal performance and readability.

## 📝 Font Stack

CleanEase relies on Tailwind CSS's default font stack for optimal system integration:

```css
font-family:
  ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
  'Segoe UI Symbol', 'Noto Color Emoji';
```

This provides:

- **Optimal performance** (no web font loading)
- **Native feel** on each platform
- **Great readability** across devices
- **Excellent emoji support**

## 📏 Typography Scale

### Headings

```css
/* text-6xl - Hero Headings */
font-size: 3.75rem; /* 60px */
line-height: 1;
font-weight: 700; /* bold */

/* text-5xl - Large Headings */
font-size: 3rem; /* 48px */
line-height: 1;
font-weight: 700;

/* text-4xl - Section Headings */
font-size: 2.25rem; /* 36px */
line-height: 2.5rem; /* 40px */
font-weight: 700;

/* text-3xl - Subsection Headings */
font-size: 1.875rem; /* 30px */
line-height: 2.25rem; /* 36px */
font-weight: 700;

/* text-2xl - Card Titles */
font-size: 1.5rem; /* 24px */
line-height: 2rem; /* 32px */
font-weight: 700;

/* text-xl - Large Text */
font-size: 1.25rem; /* 20px */
line-height: 1.75rem; /* 28px */
font-weight: 400;

/* text-lg - Body Large */
font-size: 1.125rem; /* 18px */
line-height: 1.75rem; /* 28px */
font-weight: 400;
```

### Body Text

```css
/* text-base - Default Body */
font-size: 1rem; /* 16px */
line-height: 1.5rem; /* 24px */
font-weight: 400;

/* text-sm - Small Text */
font-size: 0.875rem; /* 14px */
line-height: 1.25rem; /* 20px */
font-weight: 400;

/* text-xs - Captions/Labels */
font-size: 0.75rem; /* 12px */
line-height: 1rem; /* 16px */
font-weight: 400;
```

## 🎯 Component Typography Patterns

### Hero Section

```tsx
<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
  Professional
  <span className="block text-primary">Cleaning</span>
  <span className="block">On Demand</span>
</h1>
<p className="text-lg md:text-xl text-muted-foreground max-w-lg">
  Book trusted, professional cleaners in minutes.
</p>
```

### Section Headers

```tsx
<h2 className="text-3xl md:text-4xl font-bold mb-4">
  Choose Your Service
</h2>
<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
  From regular maintenance to deep cleaning
</p>
```

### Card Content

```tsx
<h3 className="font-semibold text-lg mb-2">Service Title</h3>
<p className="text-muted-foreground mb-4">Description text</p>
<div className="text-sm text-muted-foreground">
  <span>Additional info</span>
</div>
```

### Navigation

```tsx
<span className="font-bold text-xl">CleanEase</span>
<Button variant="ghost">Services</Button>
```

## 📱 Responsive Typography

### Mobile-First Approach

```css
/* Mobile (default) */
.hero-title {
  @apply text-4xl font-bold;
}

/* Tablet */
@media (min-width: 768px) {
  .hero-title {
    @apply text-5xl;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .hero-title {
    @apply text-6xl;
  }
}
```

### Common Responsive Patterns

```tsx
{
  /* Hero Titles */
}
className = 'text-4xl md:text-5xl lg:text-6xl font-bold';

{
  /* Section Headers */
}
className = 'text-3xl md:text-4xl font-bold';

{
  /* Body Text */
}
className = 'text-lg md:text-xl text-muted-foreground';

{
  /* Small Text */
}
className = 'text-sm md:text-base';
```

## 🎨 Font Weights

CleanEase uses a limited set of font weights for consistency:

```css
/* font-normal (400) - Default body text */
font-weight: 400;

/* font-medium (500) - Emphasized text, ratings */
font-weight: 500;

/* font-semibold (600) - Card titles, button text */
font-weight: 600;

/* font-bold (700) - Headings, brand name */
font-weight: 700;
```

### Usage Examples

```tsx
{
  /* Brand/Logo */
}
<span className="font-bold text-xl">CleanEase</span>;

{
  /* Card Titles */
}
<h3 className="font-semibold text-lg">Service Title</h3>;

{
  /* Emphasized Text */
}
<span className="font-medium">4.9 rating</span>;

{
  /* Body Text */
}
<p className="font-normal">Regular body content</p>;
```

## 🔤 Text Colors

### Semantic Text Colors

```tsx
{
  /* Primary text - main content */
}
className = 'text-foreground';

{
  /* Secondary text - descriptions */
}
className = 'text-muted-foreground';

{
  /* Brand color text */
}
className = 'text-primary';

{
  /* Success/positive */
}
className = 'text-green-600';

{
  /* Warning states */
}
className = 'text-yellow-600';

{
  /* Error states */
}
className = 'text-destructive';
```

### Contextual Usage

```tsx
{
  /* Headings */
}
<h1 className="text-foreground font-bold">Main Title</h1>;

{
  /* Descriptions */
}
<p className="text-muted-foreground">Supporting description</p>;

{
  /* Links/CTAs */
}
<span className="text-primary font-medium">Learn more</span>;

{
  /* Status indicators */
}
<span className="text-green-600 text-sm">Available today</span>;
```

## 📐 Line Height & Spacing

### Line Height Scale

```css
leading-none:     line-height: 1;        /* Tight headings */
leading-tight:    line-height: 1.25;     /* Compact headings */
leading-normal:   line-height: 1.5;      /* Body text */
leading-relaxed:  line-height: 1.625;    /* Comfortable reading */
leading-loose:    line-height: 2;        /* Spacious text */
```

### Common Patterns

```tsx
{
  /* Tight hero headings */
}
className = 'text-6xl font-bold leading-tight';

{
  /* Comfortable body text */
}
className = 'text-lg leading-relaxed';

{
  /* Compact card content */
}
className = 'text-sm leading-normal';
```

## ✅ Typography Guidelines

### Do's

✅ Use semantic text colors (`text-muted-foreground` vs hardcoded colors)  
✅ Follow the established type scale  
✅ Use responsive typography (`text-lg md:text-xl`)  
✅ Maintain consistent font weights  
✅ Ensure adequate contrast ratios

### Don'ts

❌ Use arbitrary font sizes  
❌ Mix too many font weights  
❌ Ignore responsive considerations  
❌ Use decorative fonts for body text  
❌ Create text that's too small on mobile

## 🎯 Accessibility

### Contrast Requirements

- **Normal text**: 4.5:1 minimum contrast ratio
- **Large text**: 3:1 minimum contrast ratio
- **UI components**: 3:1 minimum for interactive elements

### Font Size Guidelines

- **Minimum mobile size**: 16px for body text
- **Touch targets**: 44px minimum for interactive text
- **Reading distance**: Optimized for arm's length (mobile/tablet)

---

_Typography system designed for clarity, readability, and consistent brand expression._
