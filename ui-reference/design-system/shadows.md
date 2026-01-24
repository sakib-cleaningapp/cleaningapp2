# Shadow & Elevation System

CleanEase uses a thoughtful shadow system to create depth, hierarchy, and visual interest while maintaining a clean, modern aesthetic.

## 🌟 Shadow Tokens

### Custom Shadow Variables

```css
/* Soft shadow - Subtle elevation */
--shadow-soft: 0 4px 20px -2px hsl(207 89% 54% / 0.1);

/* Card shadow - Medium elevation */
--shadow-card: 0 8px 30px -6px hsl(207 89% 54% / 0.15);
```

### Tailwind Integration

```css
boxShadow: {
  "soft":"var(--shadow-soft)","card": 'var(--shadow-card)';
}
```

## 📏 Shadow Scale

CleanEase uses a combination of Tailwind's default shadows and custom brand-tinted shadows:

### Default Tailwind Shadows

```css
/* shadow-sm - Minimal elevation */
box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);

/* shadow - Default subtle shadow */
box-shadow:
  0 1px 3px 0 rgb(0 0 0 / 0.1),
  0 1px 2px -1px rgb(0 0 0 / 0.1);

/* shadow-md - Medium elevation */
box-shadow:
  0 4px 6px -1px rgb(0 0 0 / 0.1),
  0 2px 4px -2px rgb(0 0 0 / 0.1);

/* shadow-lg - High elevation */
box-shadow:
  0 10px 15px -3px rgb(0 0 0 / 0.1),
  0 4px 6px -4px rgb(0 0 0 / 0.1);

/* shadow-xl - Very high elevation */
box-shadow:
  0 20px 25px -5px rgb(0 0 0 / 0.1),
  0 8px 10px -6px rgb(0 0 0 / 0.1);

/* shadow-2xl - Maximum elevation */
box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
```

### Custom Brand Shadows

```css
/* shadow-soft - Brand-tinted soft shadow */
box-shadow: 0 4px 20px -2px hsl(207 89% 54% / 0.1);

/* shadow-card - Brand-tinted card shadow */
box-shadow: 0 8px 30px -6px hsl(207 89% 54% / 0.15);
```

## 🎯 Shadow Usage Patterns

### Component Shadows

#### Cards & Containers

```tsx
{/* Default card elevation */}
<div className="bg-card rounded-2xl border shadow-sm">

{/* Hover elevated cards */}
<div className="bg-card rounded-2xl border hover:shadow-card transition-smooth">

{/* Important cards with custom shadow */}
<div className="bg-card rounded-2xl shadow-card">
```

#### Buttons & Interactive Elements

```tsx
{
  /* Primary buttons with soft shadow */
}
<Button className="shadow-soft">Primary Action</Button>;

{
  /* Hero buttons with card shadow */
}
<Button variant="hero" className="shadow-card">
  Get Started
</Button>;

{
  /* Elevated on hover */
}
<Button className="hover:shadow-md transition-smooth">Hover Me</Button>;
```

#### Form Elements

```tsx
{
  /* Input focus states */
}
<Input className="focus:shadow-md transition-smooth" />;

{
  /* Floating search box */
}
<div className="bg-background p-6 rounded-2xl shadow-card border">
  <Input placeholder="Search..." />
</div>;
```

#### Navigation & Headers

```tsx
{/* Sticky header with backdrop blur */}
<header className="sticky top-0 bg-background/95 backdrop-blur border-b">

{/* Dropdown menus */}
<div className="bg-popover rounded-lg shadow-lg border">
```

## 🎨 Shadow Combinations

### Hover Effects

```tsx
{
  /* Subtle hover elevation */
}
className = 'shadow-sm hover:shadow-md transition-smooth';

{
  /* Card hover with brand shadow */
}
className = 'border hover:shadow-card transition-smooth';

{
  /* Button press effect */
}
className = 'shadow-md active:shadow-sm transition-smooth';
```

### Focus States

```tsx
{
  /* Input focus with ring and shadow */
}
className = 'focus:ring-2 focus:ring-ring focus:shadow-md';

{
  /* Button focus states */
}
className = 'focus-visible:shadow-lg focus-visible:ring-2';
```

### Component States

```tsx
{
  /* Popular/featured cards */
}
className = 'ring-2 ring-primary shadow-card';

{
  /* Loading states */
}
className = 'shadow-sm animate-pulse';

{
  /* Disabled states */
}
className = 'shadow-none opacity-50';
```

## 📱 Responsive Shadow Considerations

### Mobile Optimization

```tsx
{
  /* Reduced shadows on mobile for performance */
}
className = 'shadow-sm md:shadow-card';

{
  /* Touch-friendly hover states */
}
className = 'md:hover:shadow-lg';

{
  /* Mobile-first approach */
}
className = 'shadow-sm sm:shadow-md lg:shadow-lg';
```

## 🎭 Shadow Animation Patterns

### Smooth Transitions

```css
/* Global smooth transition */
--transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

```tsx
{
  /* Applied to interactive elements */
}
className = 'transition-smooth hover:shadow-card';

{
  /* Scale + shadow combination */
}
className = 'transition-smooth hover:scale-105 hover:shadow-lg';

{
  /* Multiple properties */
}
className = 'transition-smooth hover:shadow-card hover:border-primary/50';
```

### Animation Examples

```tsx
{/* Service cards with lift effect */}
<div className="transition-smooth hover:shadow-card hover:-translate-y-1">

{/* Buttons with scale + shadow */}
<Button className="transition-smooth hover:scale-105 hover:shadow-lg">

{/* Floating action buttons */}
<Button className="shadow-lg hover:shadow-xl hover:scale-110">
```

## 🌙 Dark Mode Shadows

In dark mode, shadows need adjustment for proper visibility:

```css
.dark {
  /* Lighter shadows for dark backgrounds */
  --shadow-soft: 0 4px 20px -2px rgb(0 0 0 / 0.3);
  --shadow-card: 0 8px 30px -6px rgb(0 0 0 / 0.4);
}
```

### Dark Mode Patterns

```tsx
{/* Cards in dark mode */}
<div className="bg-card border border-border shadow-card">

{/* Elevated elements */}
<div className="bg-popover shadow-xl border">
```

## 📐 Shadow Hierarchy

### Visual Hierarchy Levels

1. **Level 0** - `shadow-none`: Flat elements, disabled states
2. **Level 1** - `shadow-sm`: Subtle cards, form inputs
3. **Level 2** - `shadow-soft`: Buttons, interactive elements
4. **Level 3** - `shadow-card`: Important cards, floating elements
5. **Level 4** - `shadow-lg`: Dropdowns, modals
6. **Level 5** - `shadow-xl`: High-priority overlays
7. **Level 6** - `shadow-2xl`: Maximum elevation, toasts

### Usage Guidelines

```tsx
{/* Base level - most content */}
<div className="shadow-sm">

{/* Interactive level - buttons, links */}
<div className="shadow-soft">

{/* Important level - key cards, CTAs */}
<div className="shadow-card">

{/* Overlay level - dropdowns, tooltips */}
<div className="shadow-lg">

{/* Modal level - dialogs, sheets */}
<div className="shadow-xl">

{/* Notification level - toasts, alerts */}
<div className="shadow-2xl">
```

## ✅ Shadow Guidelines

### Do's

✅ Use consistent shadow tokens across components  
✅ Apply brand-tinted shadows for key elements  
✅ Combine shadows with smooth transitions  
✅ Use appropriate shadow levels for hierarchy  
✅ Consider dark mode shadow adjustments

### Don'ts

❌ Overuse heavy shadows  
❌ Mix inconsistent shadow styles  
❌ Use shadows without proper contrast  
❌ Ignore performance on mobile devices  
❌ Apply shadows to every element

## 🎯 Performance Considerations

### Optimization Tips

- Use `transform: translateZ(0)` for hardware acceleration
- Limit animated shadows on mobile
- Prefer `box-shadow` over `filter: drop-shadow()`
- Use CSS variables for consistent theming
- Consider `will-change` for frequently animated elements

### Example Optimizations

```tsx
{
  /* Hardware accelerated hover effects */
}
className = 'will-change-transform transition-smooth hover:shadow-card';

{
  /* Mobile-optimized animations */
}
className = 'md:transition-smooth md:hover:shadow-lg';
```

---

_Shadow system designed to create intuitive visual hierarchy while maintaining optimal performance._
