# Color System

CleanEase uses a comprehensive HSL-based color system that supports both light and dark themes.

## 🎨 Primary Colors

### Brand Colors

```css
/* Primary - Main brand color (Blue) */
--primary: 207 89% 54% /* #3B82F6 equivalent */ --primary-foreground: 0 0% 100%
  /* White text on primary */ /* Accent - Secondary brand color (Green) */
  --accent: 142 71% 45% /* #22C55E equivalent */ --accent-foreground: 0 0% 100%
  /* White text on accent */;
```

### Visual Examples

- **Primary**: Used for main CTAs, links, and brand elements
- **Accent**: Used for success states, availability indicators, and secondary actions

## 🔤 Semantic Colors

### Background & Foreground

```css
--background: 0 0% 100% /* Pure white */ --foreground: 222.2 84% 4.9%
  /* Near black text */;
```

### Surface Colors

```css
--card: 0 0% 100% /* Card backgrounds */ --card-foreground: 222.2 84% 4.9%
  /* Text on cards */ --popover: 0 0% 100% /* Popover backgrounds */
  --popover-foreground: 222.2 84% 4.9% /* Text on popovers */;
```

### Interactive States

```css
--secondary: 210 40% 96.1% /* Light gray for secondary buttons */
  --secondary-foreground: 222.2 47.4% 11.2% /* Dark text on secondary */
  --muted: 210 40% 96.1% /* Subtle background */ --muted-foreground: 215.4 16.3%
  46.9% /* Muted text */;
```

### Status Colors

```css
--destructive: 0 84.2% 60.2% /* Error/danger states */
  --destructive-foreground: 210 40% 98% /* Text on destructive */;
```

### Form Elements

```css
--border: 214.3 31.8% 91.4% /* Default borders */ --input: 214.3 31.8% 91.4%
  /* Input field borders */ --ring: 207 89% 54%
  /* Focus ring color (matches primary) */;
```

## 🌙 Dark Mode Colors

CleanEase includes a full dark mode palette:

```css
.dark {
  --background: 222.2 84% 4.9% /* Dark background */ --foreground: 210 40% 98%
    /* Light text */ --card: 222.2 84% 4.9% /* Dark card background */
    --card-foreground: 210 40% 98% /* Light text on dark cards */ --primary: 210
    40% 98% /* Inverted primary */ --primary-foreground: 222.2 47.4% 11.2%
    /* Dark text on light primary */ --secondary: 217.2 32.6% 17.5%
    /* Dark secondary */ --secondary-foreground: 210 40% 98%
    /* Light text on dark secondary */ --muted: 217.2 32.6% 17.5%
    /* Dark muted */ --muted-foreground: 215 20.2% 65.1%
    /* Muted text in dark mode */ --accent: 217.2 32.6% 17.5%
    /* Dark accent background */ --accent-foreground: 210 40% 98%
    /* Light text on dark accent */ --destructive: 0 62.8% 30.6%
    /* Darker destructive */ --destructive-foreground: 210 40% 98%
    /* Light text on destructive */ --border: 217.2 32.6% 17.5%
    /* Dark borders */ --input: 217.2 32.6% 17.5% /* Dark input borders */
    --ring: 212.7 26.8% 83.9% /* Light focus ring */;
}
```

## 🎨 Custom Gradients

CleanEase uses custom gradient definitions:

```css
/* Gradient Variables */
--gradient-primary: linear-gradient(135deg, hsl(207 89% 54%), hsl(207 89% 64%));
--gradient-accent: linear-gradient(135deg, hsl(142 71% 45%), hsl(142 71% 55%));
--gradient-hero: linear-gradient(
  135deg,
  hsl(207 89% 54%) 0%,
  hsl(207 89% 64%) 50%,
  hsl(142 71% 55%) 100%
);
```

### Usage in Tailwind

```css
/* Tailwind Extensions */
backgroundImage: {
  "gradient-primary": "var(--gradient-primary)",
  "gradient-accent": "var(--gradient-accent)",
  "gradient-hero": "var(--gradient-hero)",
}
```

### Examples

- **gradient-primary**: Used in buttons, brand elements
- **gradient-accent**: Used for success indicators, badges
- **gradient-hero**: Used in hero sections, major CTAs

## 🔍 Usage Guidelines

### Do's

✅ Use semantic color names (e.g., `text-primary`, `bg-muted`)  
✅ Leverage CSS variables for theme consistency  
✅ Use gradients sparingly for emphasis  
✅ Ensure sufficient contrast ratios

### Don'ts

❌ Hardcode hex values in components  
❌ Use arbitrary color values  
❌ Override semantic meanings  
❌ Use too many gradient effects

## 🎯 Color Combinations

### High Contrast Pairs

- `primary` with `primary-foreground`
- `accent` with `accent-foreground`
- `destructive` with `destructive-foreground`

### Subtle Combinations

- `muted` with `muted-foreground`
- `secondary` with `secondary-foreground`
- `card` with `card-foreground`

### Brand Combinations

- Primary blue with accent green
- Gradient combinations for CTAs
- Muted backgrounds with primary accents

---

_All colors are defined in HSL format for better theme consistency and manipulation._
