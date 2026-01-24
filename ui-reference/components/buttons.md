# Button Components

CleanEase uses a comprehensive button system built with class-variance-authority for consistent styling and behavior across all interactive elements.

## 🎨 Button Variants

### Default

```tsx
<Button>Default Button</Button>
<Button variant="default">Explicit Default</Button>
```

**Styling**: Primary blue background with white text, soft shadow, smooth transitions
**Use Case**: Standard actions, form submissions, primary interactions

### Hero

```tsx
<Button variant="hero">Get Started</Button>
<Button variant="hero" size="lg">Book Your First Clean</Button>
```

**Styling**: Primary gradient background, white text, scale hover effect, card shadow
**Use Case**: Main CTAs, hero sections, primary conversions

### Accent

```tsx
<Button variant="accent">Success Action</Button>
```

**Styling**: Green gradient background, white text, scale hover effect
**Use Case**: Success states, positive actions, completion indicators

### Secondary

```tsx
<Button variant="secondary">Secondary Action</Button>
```

**Styling**: Light gray background, dark text
**Use Case**: Secondary actions, cancel buttons, supporting interactions

### Outline

```tsx
<Button variant="outline">View Profile</Button>
<Button variant="outline" size="sm">Learn More</Button>
```

**Styling**: Transparent background, border, hover fill effect
**Use Case**: Secondary CTAs, non-destructive actions, view actions

### Ghost

```tsx
<Button variant="ghost">Navigation Item</Button>
```

**Styling**: Transparent background, subtle hover effect
**Use Case**: Navigation items, menu buttons, subtle interactions

### Link

```tsx
<Button variant="link">Learn more</Button>
```

**Styling**: Underlined text, no background
**Use Case**: Text links, inline actions, navigation links

### Destructive

```tsx
<Button variant="destructive">Delete Account</Button>
```

**Styling**: Red background, white text
**Use Case**: Delete actions, destructive operations, dangerous actions

## 📏 Button Sizes

### Small

```tsx
<Button size="sm">Small Button</Button>
<Button variant="outline" size="sm">Small Outline</Button>
```

**Dimensions**: 36px height, 12px horizontal padding
**Use Case**: Compact interfaces, secondary actions, inline buttons

### Default

```tsx
<Button>Default Size</Button>
<Button size="default">Explicit Default</Button>
```

**Dimensions**: 40px height, 16px horizontal padding
**Use Case**: Standard interactions, most common size

### Large

```tsx
<Button size="lg">Large Button</Button>
<Button variant="hero" size="lg">Primary CTA</Button>
```

**Dimensions**: 44px height, 32px horizontal padding
**Use Case**: Primary CTAs, hero sections, important actions

### Icon

```tsx
<Button size="icon">
  <Menu className="w-5 h-5" />
</Button>
<Button variant="ghost" size="icon">
  <User className="w-4 h-4" />
</Button>
```

**Dimensions**: 40px × 40px square
**Use Case**: Icon-only buttons, compact interfaces, toolbars

## 🎯 Real-World Examples

### Header Navigation

```tsx
{/* From Header.tsx */}
<nav className="hidden md:flex items-center gap-6">
  <Button variant="ghost">Services</Button>
  <Button variant="ghost">How it works</Button>
  <Button variant="ghost">Become a cleaner</Button>
</nav>

<div className="flex items-center gap-3">
  <Button variant="outline" size="sm" className="hidden md:flex">
    <User className="w-4 h-4" />
    Sign in
  </Button>
  <Button variant="hero" size="sm">
    Get started
  </Button>
</div>
```

### Service Cards

```tsx
{
  /* From ServiceCard.tsx */
}
<Button variant={popular ? 'hero' : 'default'} className="w-full">
  Book now
</Button>;
```

### Cleaner Cards

```tsx
{
  /* From CleanerCard.tsx */
}
<div className="flex gap-2">
  <Button variant="outline" size="sm" className="flex-1">
    View profile
  </Button>
  <Button variant="hero" size="sm" className="flex-1">
    Book now
  </Button>
</div>;
```

### Hero Section

```tsx
{
  /* From HeroSection.tsx */
}
<Button variant="hero" size="lg" className="w-full">
  <Search className="w-5 h-5" />
  Find cleaners near me
</Button>;

{
  /* CTA Section */
}
<Button
  variant="secondary"
  size="lg"
  className="bg-white text-primary hover:bg-white/90"
>
  Book your first clean
</Button>;
```

## 🎨 Button Combinations

### Primary + Secondary

```tsx
<div className="flex gap-3">
  <Button variant="hero">Book Now</Button>
  <Button variant="outline">Learn More</Button>
</div>
```

### Icon + Text

```tsx
<Button variant="default">
  <Search className="w-4 h-4" />
  Search
</Button>

<Button variant="outline" size="sm">
  <User className="w-4 h-4" />
  Sign in
</Button>
```

### Button Groups

```tsx
{
  /* Equal width buttons */
}
<div className="flex gap-2">
  <Button variant="outline" size="sm" className="flex-1">
    Cancel
  </Button>
  <Button variant="hero" size="sm" className="flex-1">
    Confirm
  </Button>
</div>;

{
  /* Navigation group */
}
<div className="flex items-center gap-6">
  <Button variant="ghost">Services</Button>
  <Button variant="ghost">About</Button>
  <Button variant="ghost">Contact</Button>
</div>;
```

## 🎭 State Variations

### Loading States

```tsx
<Button disabled className="opacity-50 cursor-not-allowed">
  <Loader className="w-4 h-4 animate-spin" />
  Loading...
</Button>
```

### Success States

```tsx
<Button variant="accent">
  <Check className="w-4 h-4" />
  Completed
</Button>
```

### Error States

```tsx
<Button variant="destructive">
  <AlertCircle className="w-4 h-4" />
  Error Occurred
</Button>
```

## 📱 Responsive Considerations

### Mobile-First Approach

```tsx
{
  /* Mobile menu button - only visible on small screens */
}
<Button variant="ghost" size="icon" className="md:hidden">
  <Menu className="w-5 h-5" />
</Button>;

{
  /* Desktop sign-in - hidden on mobile */
}
<Button variant="outline" size="sm" className="hidden md:flex">
  <User className="w-4 h-4" />
  Sign in
</Button>;
```

### Touch-Friendly Sizing

```tsx
{/* Ensure minimum 44px touch targets on mobile */}
<Button size="default" className="min-h-[44px]">Mobile Action</Button>
<Button size="lg">Optimal Touch Target</Button>
```

## 🎨 Custom Styling

### Override Classes

```tsx
{
  /* Custom background while maintaining structure */
}
<Button variant="secondary" className="bg-white text-primary hover:bg-white/90">
  Custom Colors
</Button>;

{
  /* Full width buttons */
}
<Button variant="hero" className="w-full">
  Full Width CTA
</Button>;

{
  /* Additional shadows */
}
<Button variant="default" className="shadow-lg">
  Extra Elevation
</Button>;
```

### Component Composition

```tsx
{
  /* As child component */
}
<Button asChild>
  <Link to="/services">View Services</Link>
</Button>;

{
  /* With external libraries */
}
<Button asChild>
  <a href="mailto:support@cleanease.com">Contact Support</a>
</Button>;
```

## 🔍 Implementation Details

### Base Classes

```tsx
// From button.tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
);
```

### Variant Definitions

```tsx
variants: {
  variant: {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft transition-smooth",
    hero: "bg-gradient-primary text-primary-foreground hover:scale-105 shadow-card transition-smooth font-semibold",
    accent: "bg-gradient-accent text-accent-foreground hover:scale-105 shadow-soft transition-smooth",
    // ... other variants
  },
  size: {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  }
}
```

## ✅ Button Guidelines

### Do's

✅ Use semantic variants (`hero` for CTAs, `outline` for secondary actions)  
✅ Maintain consistent sizing across similar contexts  
✅ Include icons for clarity when helpful  
✅ Ensure adequate touch targets on mobile  
✅ Use `asChild` for proper semantic HTML

### Don'ts

❌ Mix too many variants in the same interface  
❌ Use `variant="link"` for actual navigation (use proper links)  
❌ Override core button structure with custom CSS  
❌ Create buttons smaller than 44px on mobile  
❌ Use destructive variant for non-destructive actions

## 🎯 Accessibility Features

### Built-in Accessibility

- **Focus management**: Visible focus rings with proper offset
- **Keyboard navigation**: Full keyboard support
- **Screen readers**: Proper button semantics
- **Touch targets**: Minimum 44px for mobile interactions

### Usage Examples

```tsx
{
  /* Proper ARIA labels */
}
<Button variant="ghost" size="icon" aria-label="Open menu">
  <Menu className="w-5 h-5" />
</Button>;

{
  /* Loading states */
}
<Button disabled aria-busy="true">
  <Loader className="w-4 h-4 animate-spin" />
  Processing...
</Button>;

{
  /* Action descriptions */
}
<Button variant="destructive" aria-describedby="delete-warning">
  Delete Account
</Button>;
```

---

_Button system designed for consistency, accessibility, and excellent user experience across all devices._
