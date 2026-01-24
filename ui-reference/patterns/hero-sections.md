# Hero Section Patterns

CleanEase's hero section demonstrates a comprehensive approach to creating impactful landing experiences with modern design principles.

## 🎯 Hero Section Structure

### Complete Hero Implementation

```tsx
const HeroSection = () => {
  return (
    <section className="relative min-h-[70vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-10" />

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            {/* Typography & Content */}
            {/* Search Component */}
            {/* Social Proof */}
          </div>

          {/* Hero Image */}
          <div className="relative">
            {/* Main Image */}
            {/* Floating Card */}
          </div>
        </div>
      </div>
    </section>
  );
};
```

## 📝 Typography Hierarchy

### Multi-Line Hero Headlines

```tsx
<div className="space-y-4">
  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
    Professional
    <span className="block text-primary">Cleaning</span>
    <span className="block">On Demand</span>
  </h1>
  <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
    Book trusted, professional cleaners in minutes. Quality cleaning services
    delivered to your door.
  </p>
</div>
```

### Typography Patterns

- **Responsive sizing**: `text-4xl md:text-5xl lg:text-6xl`
- **Line breaks**: Strategic `block` spans for visual impact
- **Brand highlighting**: `text-primary` for key terms
- **Supporting text**: Muted color with responsive sizing
- **Content constraint**: `max-w-lg` for readability

## 🔍 Search Integration

### Hero Search Component

```tsx
<div className="bg-background p-6 rounded-2xl shadow-card border max-w-md">
  <div className="space-y-4">
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
      <Input placeholder="Enter your postcode" className="pl-10 h-12" />
    </div>
    <Button variant="hero" size="lg" className="w-full">
      <Search className="w-5 h-5" />
      Find cleaners near me
    </Button>
  </div>
</div>
```

### Search Box Features

- **Card container**: Elevated background with shadow
- **Icon integration**: Left-positioned location icon
- **Input styling**: Increased height (`h-12`) for prominence
- **CTA button**: Hero variant with icon and full width
- **Spacing**: Consistent internal rhythm

## 📊 Social Proof Elements

### Stats and Ratings Display

```tsx
<div className="flex items-center gap-8 pt-4">
  <div className="flex items-center gap-2">
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      ))}
    </div>
    <span className="text-sm text-muted-foreground">4.9/5 rating</span>
  </div>
  <div className="text-sm text-muted-foreground">
    <span className="font-semibold text-foreground">50,000+</span> happy
    customers
  </div>
</div>
```

### Social Proof Patterns

- **Star ratings**: Visual representation with filled stars
- **Customer count**: Emphasized numbers with descriptive text
- **Layout**: Horizontal grouping with consistent spacing
- **Hierarchy**: Bold numbers, muted descriptions

## 🖼️ Hero Imagery

### Image Container

```tsx
<div className="relative">
  <div className="relative overflow-hidden rounded-3xl shadow-card">
    <img
      src={heroImage}
      alt="Professional cleaner working in a modern home"
      className="w-full h-[500px] object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
  </div>

  {/* Floating card */}
  <div className="absolute -bottom-6 -left-6 bg-background p-4 rounded-2xl shadow-card border">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center">
        <span className="text-accent-foreground font-bold">✓</span>
      </div>
      <div>
        <p className="font-semibold">Insured & Verified</p>
        <p className="text-sm text-muted-foreground">All cleaners checked</p>
      </div>
    </div>
  </div>
</div>
```

### Image Styling Elements

- **Rounded corners**: `rounded-3xl` for modern aesthetic
- **Fixed height**: `h-[500px]` with `object-cover`
- **Overlay gradient**: Subtle dark gradient from bottom
- **Floating elements**: Positioned trust indicators
- **Shadow hierarchy**: Card shadow for elevation

## 🎨 Background Treatments

### Gradient Background

```tsx
<section className="relative min-h-[70vh] flex items-center overflow-hidden">
  {/* Background */}
  <div className="absolute inset-0 bg-gradient-hero opacity-10" />

  <div className="container relative z-10">{/* Content */}</div>
</section>
```

### Background Patterns

- **Hero gradient**: Multi-color gradient at low opacity
- **Full coverage**: `absolute inset-0` positioning
- **Content layering**: `relative z-10` for content stack
- **Overflow control**: `overflow-hidden` on container

## 📱 Responsive Layout

### Grid System

```tsx
<div className="grid lg:grid-cols-2 gap-12 items-center">
  <div className="space-y-8">{/* Content column */}</div>
  <div className="relative">{/* Image column */}</div>
</div>
```

### Mobile Considerations

```tsx
{/* Mobile-stacked, desktop-side-by-side */}
<div className="grid lg:grid-cols-2 gap-12 items-center">

{/* Responsive typography */}
<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">

{/* Responsive description */}
<p className="text-lg md:text-xl text-muted-foreground">

{/* Content constraints */}
<div className="max-w-md"> {/* Search box */}
<p className="max-w-lg">   {/* Description text */}
```

## 🎭 Floating Elements

### Trust Badge Implementation

```tsx
<div className="absolute -bottom-6 -left-6 bg-background p-4 rounded-2xl shadow-card border">
  <div className="flex items-center gap-3">
    <div className="w-12 h-12 bg-gradient-accent rounded-full flex items-center justify-center">
      <span className="text-accent-foreground font-bold">✓</span>
    </div>
    <div>
      <p className="font-semibold">Insured & Verified</p>
      <p className="text-sm text-muted-foreground">All cleaners checked</p>
    </div>
  </div>
</div>
```

### Floating Element Patterns

- **Positioning**: Negative margins for overlap effect
- **Background**: Solid background to stand out
- **Icon treatment**: Gradient background with contrasting icon
- **Typography**: Clear hierarchy with semibold titles
- **Shadow**: Card shadow for proper elevation

## 🎯 CTA Variations

### Primary CTA in Hero

```tsx
<Button variant="hero" size="lg" className="w-full">
  <Search className="w-5 h-5" />
  Find cleaners near me
</Button>
```

### Secondary CTA Example

```tsx
{
  /* From CTA section */
}
<Button
  variant="secondary"
  size="lg"
  className="bg-white text-primary hover:bg-white/90"
>
  Book your first clean
</Button>;
```

### CTA Patterns

- **Hero variant**: Primary gradient with scale effect
- **Icon integration**: Meaningful icons for context
- **Full width**: Especially in mobile/contained layouts
- **Size consistency**: Large sizing for prominence

## 🏗️ Layout Variants

### Split Hero (Current Pattern)

```tsx
<div className="grid lg:grid-cols-2 gap-12 items-center">
  <div className="space-y-8">
    {/* Content: Title, description, search, proof */}
  </div>
  <div className="relative">{/* Visual: Image with floating elements */}</div>
</div>
```

### Centered Hero Alternative

```tsx
<div className="text-center max-w-4xl mx-auto">
  <div className="space-y-8">
    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold">
      {/* Centered title */}
    </h1>
    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
      {/* Centered description */}
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
      {/* Centered CTAs */}
    </div>
  </div>
</div>
```

### Full-Width Hero Alternative

```tsx
<div className="relative">
  <img src={heroImage} className="w-full h-[80vh] object-cover" />
  <div className="absolute inset-0 bg-black/40" />
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="text-center text-white max-w-4xl px-6">
      {/* Overlay content */}
    </div>
  </div>
</div>
```

## ✅ Hero Section Guidelines

### Do's

✅ Use responsive typography scaling  
✅ Include social proof elements  
✅ Integrate functional search/CTA components  
✅ Apply proper visual hierarchy  
✅ Consider mobile experience first

### Don'ts

❌ Overcrowd with too many elements  
❌ Use poor quality or irrelevant imagery  
❌ Ignore loading performance for images  
❌ Create overly complex layouts  
❌ Forget accessibility considerations

## 🎨 Advanced Hero Patterns

### Video Background Hero

```tsx
<section className="relative min-h-screen flex items-center overflow-hidden">
  <video
    autoPlay
    muted
    loop
    className="absolute inset-0 w-full h-full object-cover"
  >
    <source src="/hero-video.mp4" type="video/mp4" />
  </video>
  <div className="absolute inset-0 bg-black/30" />
  <div className="container relative z-10 text-white">{/* Content */}</div>
</section>
```

### Animated Hero Elements

```tsx
<div className="space-y-8">
  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-fade-in-up">
    Professional
    <span className="block text-primary animate-fade-in-up animation-delay-200">
      Cleaning
    </span>
    <span className="block animate-fade-in-up animation-delay-400">
      On Demand
    </span>
  </h1>
</div>
```

### Interactive Hero Elements

```tsx
{
  /* Hover effects on floating cards */
}
<div className="absolute -bottom-6 -left-6 bg-background p-4 rounded-2xl shadow-card border hover:shadow-lg transition-smooth cursor-pointer">
  {/* Interactive trust badge */}
</div>;

{
  /* Parallax image effects */
}
<div
  className="relative overflow-hidden rounded-3xl shadow-card transform hover:scale-105 transition-smooth"
  style={{ transform: `translateY(${scrollY * 0.1}px)` }}
>
  {/* Parallax image */}
</div>;
```

---

_Hero section patterns designed to create immediate impact, clear value proposition, and seamless user journey initiation._
