# Page Layout Examples

CleanEase demonstrates modern page layout patterns with consistent spacing, responsive design, and clear content hierarchy. Here are the key layout patterns used throughout the application.

## 🏠 Landing Page Structure

### Complete Page Layout

```tsx
const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />

      {/* Services Section */}
      <section className="py-16 bg-muted/30">{/* Section content */}</section>

      {/* Cleaners Section */}
      <section className="py-16">{/* Section content */}</section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">{/* Section content */}</section>

      {/* CTA Section */}
      <section className="py-16">{/* Section content */}</section>
    </div>
  );
};
```

### Layout Principles

- **Full height container**: `min-h-screen` ensures proper coverage
- **Alternating backgrounds**: Subtle variations with `bg-muted/30`
- **Consistent section spacing**: `py-16` for vertical rhythm
- **Container constraint**: Content wrapped in `.container` class

## 📋 Section Patterns

### Standard Section Layout

```tsx
<section className="py-16">
  <div className="container">
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">Section Title</h2>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Supporting description with content constraint
      </p>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Grid content */}
    </div>
  </div>
</section>
```

### Alternating Background Section

```tsx
<section className="py-16 bg-muted/30">
  <div className="container">{/* Same internal structure */}</div>
</section>
```

## 🎯 Header Patterns

### Centered Section Headers

```tsx
<div className="text-center mb-12">
  <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Service</h2>
  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
    From regular maintenance to deep cleaning, we have the perfect service for
    your needs
  </p>
</div>
```

### Header Styling Elements

- **Responsive typography**: `text-3xl md:text-4xl`
- **Consistent spacing**: `mb-4` between title and description
- **Content constraints**: `max-w-2xl mx-auto` for readability
- **Color hierarchy**: Primary title, muted description

## 🔗 Grid System Examples

### Three-Column Responsive Grid

```tsx
{
  /* Services Grid */
}
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  {services.map((service, index) => (
    <ServiceCard key={index} {...service} />
  ))}
</div>;
```

### Grid with Action Row

```tsx
{/* Cleaners Grid with CTA */}
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
  {cleaners.map((cleaner, index) => (
    <CleanerCard key={index} {...cleaner} />
  ))}
</div>

<div className="text-center">
  <Button variant="outline" size="lg">
    View all cleaners
  </Button>
</div>
```

### Features Grid (Icon-Based)

```tsx
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
  <div className="text-center">
    <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
      <Shield className="w-8 h-8 text-primary-foreground" />
    </div>
    <h3 className="font-semibold text-lg mb-2">Fully Insured</h3>
    <p className="text-muted-foreground">
      All cleaners are background-checked and fully insured
    </p>
  </div>
  {/* More feature items */}
</div>
```

## 🎨 Background Patterns

### Alternating Section Backgrounds

```tsx
{
  /* Light background sections */
}
<section className="py-16">{/* Content on default background */}</section>;

{
  /* Subtle tinted sections */
}
<section className="py-16 bg-muted/30">
  {/* Content on light gray background */}
</section>;
```

### Gradient Background Sections

```tsx
{
  /* CTA Section with gradient */
}
<section className="py-16">
  <div className="container">
    <div className="bg-gradient-hero rounded-3xl p-8 md:p-12 text-center text-white">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        Ready for a spotless home?
      </h2>
      <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
        Join thousands of happy customers who trust CleanEase for their cleaning
        needs
      </p>
      <Button
        variant="secondary"
        size="lg"
        className="bg-white text-primary hover:bg-white/90"
      >
        Book your first clean
      </Button>
    </div>
  </div>
</section>;
```

## 📱 Responsive Layout Patterns

### Mobile-First Grid Adaptation

```tsx
{/* 1 column → 2 columns → 3 columns */}
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

{/* 1 column → 2 columns */}
<div className="grid lg:grid-cols-2 gap-12">

{/* Stack to side-by-side */}
<div className="flex flex-col md:flex-row gap-4">
```

### Responsive Section Spacing

```tsx
{/* Responsive padding */}
<section className="py-12 md:py-16 lg:py-20">

{/* Responsive internal spacing */}
<div className="text-center mb-8 md:mb-12">

{/* Responsive grid gaps */}
<div className="grid gap-4 md:gap-6 lg:gap-8">
```

## 🎯 Feature Section Layouts

### Icon-Text Feature Layout

```tsx
<div className="text-center">
  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
    <Shield className="w-8 h-8 text-primary-foreground" />
  </div>
  <h3 className="font-semibold text-lg mb-2">Feature Title</h3>
  <p className="text-muted-foreground">Feature description</p>
</div>
```

### Side-by-Side Feature Layout

```tsx
<div className="grid lg:grid-cols-2 gap-12 items-center">
  <div className="space-y-6">
    <h2 className="text-3xl font-bold">Feature Section</h2>
    <p className="text-lg text-muted-foreground">Detailed description</p>
    <Button variant="hero">Call to Action</Button>
  </div>
  <div className="relative">
    <img src="/feature-image.jpg" className="rounded-2xl" />
  </div>
</div>
```

## 🎨 Call-to-Action Layouts

### Gradient CTA Section

```tsx
<section className="py-16">
  <div className="container">
    <div className="bg-gradient-hero rounded-3xl p-8 md:p-12 text-center text-white">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        Ready for a spotless home?
      </h2>
      <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
        Join thousands of happy customers who trust CleanEase for their cleaning
        needs
      </p>
      <Button
        variant="secondary"
        size="lg"
        className="bg-white text-primary hover:bg-white/90"
      >
        Book your first clean
      </Button>
    </div>
  </div>
</section>
```

### Simple CTA Section

```tsx
<section className="py-16 bg-muted/30">
  <div className="container text-center">
    <h2 className="text-3xl font-bold mb-4">Get Started Today</h2>
    <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
      Ready to experience professional cleaning services?
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button variant="hero" size="lg">
        Get Started
      </Button>
      <Button variant="outline" size="lg">
        Learn More
      </Button>
    </div>
  </div>
</section>
```

## 🏗️ Layout Components

### Container System

```tsx
{
  /* Standard container with responsive padding */
}
<div className="container">
  {/* Content automatically centered with padding */}
</div>;

{
  /* Custom container constraints */
}
<div className="max-w-4xl mx-auto px-6">
  {/* Custom width with manual padding */}
</div>;

{
  /* Full width sections with container content */
}
<section className="w-full bg-muted/30">
  <div className="container">
    {/* Constrained content within full-width background */}
  </div>
</section>;
```

### Spacing Utilities

```tsx
{
  /* Vertical spacing between sections */
}
<div className="space-y-16">
  <section>Section 1</section>
  <section>Section 2</section>
</div>;

{
  /* Content group spacing */
}
<div className="space-y-8">
  <div className="space-y-4">
    <h2>Title</h2>
    <p>Description</p>
  </div>
  <div>Action area</div>
</div>;
```

## 📐 Layout Measurements

### Standard Measurements Reference

```tsx
{/* Section vertical spacing */}
py-16      /* 64px top/bottom - standard */
py-12      /* 48px top/bottom - compact */
py-20      /* 80px top/bottom - spacious */

{/* Header bottom margins */}
mb-12      /* 48px - section headers */
mb-8       /* 32px - subsection headers */
mb-4       /* 16px - card titles */

{/* Grid gaps */}
gap-6      /* 24px - standard card grids */
gap-8      /* 32px - feature grids */
gap-12     /* 48px - major layout sections */

{/* Container constraints */}
max-w-2xl  /* 672px - description text */
max-w-4xl  /* 896px - content sections */
max-w-7xl  /* 1280px - wide layouts */
```

## ✅ Layout Guidelines

### Do's

✅ Use consistent section spacing (`py-16`)  
✅ Implement responsive grid systems  
✅ Constrain content width for readability  
✅ Create clear visual hierarchy  
✅ Use alternating backgrounds for section separation

### Don'ts

❌ Use inconsistent spacing between sections  
❌ Create layouts that break on mobile  
❌ Ignore content width constraints  
❌ Mix different layout patterns without purpose  
❌ Overcomplicate grid systems

## 🎨 Advanced Layout Patterns

### Masonry-Style Layout

```tsx
<div className="columns-1 md:columns-2 lg:columns-3 gap-6">
  {items.map((item, index) => (
    <div key={index} className="break-inside-avoid mb-6">
      <Card>{item}</Card>
    </div>
  ))}
</div>
```

### Sidebar Layout

```tsx
<div className="grid lg:grid-cols-4 gap-8">
  <aside className="lg:col-span-1">{/* Sidebar content */}</aside>
  <main className="lg:col-span-3">{/* Main content */}</main>
</div>
```

### Dashboard-Style Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <div className="lg:col-span-2">{/* Main metric card */}</div>
  <div>{/* Secondary metric */}</div>
  <div>{/* Secondary metric */}</div>
  <div className="md:col-span-2 lg:col-span-3">{/* Chart/table area */}</div>
  <div className="lg:col-span-1">{/* Sidebar info */}</div>
</div>
```

---

_Page layouts designed for optimal content presentation, user engagement, and seamless responsive experience across all devices._
