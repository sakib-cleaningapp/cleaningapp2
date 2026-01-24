# Card Components

CleanEase uses two main card patterns for displaying services and cleaner profiles. Both follow consistent design principles while serving different content purposes.

## 🎯 Service Cards

Service cards display cleaning service options with pricing, duration, and booking capabilities.

### Basic Structure

```tsx
interface ServiceCardProps {
  title: string;
  description: string;
  duration: string;
  price: string;
  icon: React.ReactNode;
  popular?: boolean;
}

const ServiceCard = ({
  title,
  description,
  duration,
  price,
  icon,
  popular,
}: ServiceCardProps) => {
  return (
    <div
      className={`relative bg-card rounded-2xl p-6 border transition-smooth hover:shadow-card ${
        popular ? 'ring-2 ring-primary shadow-card' : 'hover:border-primary/50'
      }`}
    >
      {/* Card content */}
    </div>
  );
};
```

### Visual Elements

#### Popular Badge

```tsx
{
  popular && (
    <div className="absolute -top-3 left-6 bg-gradient-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
      Most Popular
    </div>
  );
}
```

#### Header Section

```tsx
<div className="flex items-start justify-between mb-4">
  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
    {icon}
  </div>
  <div className="text-right">
    <div className="text-2xl font-bold">{price}</div>
    <div className="text-sm text-muted-foreground">per session</div>
  </div>
</div>
```

#### Content Section

```tsx
<h3 className="font-semibold text-lg mb-2">{title}</h3>
<p className="text-muted-foreground mb-4">{description}</p>

<div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
  <div className="flex items-center gap-1">
    <Clock className="w-4 h-4" />
    <span>{duration}</span>
  </div>
  <div className="flex items-center gap-1">
    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
    <span>4.9</span>
  </div>
</div>
```

#### Action Button

```tsx
<Button variant={popular ? 'hero' : 'default'} className="w-full">
  Book now
</Button>
```

### Complete Example

```tsx
const services = [
  {
    title: 'Regular Cleaning',
    description: 'Weekly or bi-weekly cleaning to keep your home spotless',
    duration: '2-3 hours',
    price: '£25/hr',
    icon: <Home className="w-6 h-6" />,
    popular: true,
  },
  // ... more services
];

<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  {services.map((service, index) => (
    <ServiceCard key={index} {...service} />
  ))}
</div>;
```

## 👤 Cleaner Cards

Cleaner cards display professional cleaner profiles with ratings, availability, and booking options.

### Basic Structure

```tsx
interface CleanerCardProps {
  name: string;
  rating: number;
  reviews: number;
  distance: string;
  hourlyRate: string;
  avatar: string;
  specialties: string[];
  verified?: boolean;
  available?: boolean;
}

const CleanerCard = ({
  name,
  rating,
  reviews,
  distance,
  hourlyRate,
  avatar,
  specialties,
  verified,
  available,
}: CleanerCardProps) => {
  return (
    <div className="bg-card rounded-2xl p-6 border hover:shadow-card transition-smooth hover:border-primary/50">
      {/* Card content */}
    </div>
  );
};
```

### Visual Elements

#### Profile Header

```tsx
<div className="flex items-start gap-4 mb-4">
  <div className="relative">
    <img
      src={avatar}
      alt={name}
      className="w-16 h-16 rounded-full object-cover"
    />
    {verified && (
      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
        <Shield className="w-3 h-3 text-accent-foreground" />
      </div>
    )}
    {available && (
      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
    )}
  </div>

  <div className="flex-1">
    <div className="flex items-center justify-between mb-1">
      <h3 className="font-semibold text-lg">{name}</h3>
      <div className="text-right">
        <div className="font-bold text-lg">{hourlyRate}</div>
        <div className="text-sm text-muted-foreground">per hour</div>
      </div>
    </div>

    {/* Rating and distance */}
    <div className="flex items-center gap-4 mb-2 text-sm text-muted-foreground">
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        <span className="font-medium">{rating}</span>
        <span>({reviews} reviews)</span>
      </div>
      <div className="flex items-center gap-1">
        <MapPin className="w-4 h-4" />
        <span>{distance} away</span>
      </div>
    </div>

    {/* Availability indicator */}
    {available && (
      <div className="flex items-center gap-1 text-sm text-green-600 mb-3">
        <Clock className="w-4 h-4" />
        <span>Available today</span>
      </div>
    )}
  </div>
</div>
```

#### Specialties Section

```tsx
<div className="flex flex-wrap gap-2 mb-4">
  {specialties.map((specialty, index) => (
    <Badge key={index} variant="secondary" className="text-xs">
      {specialty}
    </Badge>
  ))}
</div>
```

#### Action Buttons

```tsx
<div className="flex gap-2">
  <Button variant="outline" size="sm" className="flex-1">
    View profile
  </Button>
  <Button variant="hero" size="sm" className="flex-1">
    Book now
  </Button>
</div>
```

### Complete Example

```tsx
const cleaners = [
  {
    name: 'Sarah Johnson',
    rating: 4.9,
    reviews: 127,
    distance: '0.8 miles',
    hourlyRate: '£25/hr',
    avatar: cleaner1,
    specialties: ['Deep Clean', 'Eco-Friendly', 'Pet-Friendly'],
    verified: true,
    available: true,
  },
  // ... more cleaners
];

<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  {cleaners.map((cleaner, index) => (
    <CleanerCard key={index} {...cleaner} />
  ))}
</div>;
```

## 🎨 Card Design Patterns

### Base Card Styling

```tsx
{/* Standard card container */}
<div className="bg-card rounded-2xl p-6 border hover:shadow-card transition-smooth">

{/* Interactive hover effects */}
<div className="hover:border-primary/50 transition-smooth">

{/* Featured/popular cards */}
<div className="ring-2 ring-primary shadow-card">
```

### Common Card Elements

#### Icon Containers

```tsx
{
  /* Service icon background */
}
<div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
  {icon}
</div>;

{
  /* Status indicators */
}
<div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center">
  <Shield className="w-3 h-3 text-accent-foreground" />
</div>;
```

#### Rating Display

```tsx
<div className="flex items-center gap-1">
  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
  <span className="font-medium">{rating}</span>
  <span className="text-muted-foreground">({reviews} reviews)</span>
</div>
```

#### Price/Rate Display

```tsx
<div className="text-right">
  <div className="text-2xl font-bold">{price}</div>
  <div className="text-sm text-muted-foreground">per session</div>
</div>
```

## 📱 Responsive Behavior

### Grid Layouts

```tsx
{/* Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

{/* Mobile: 1 column, Desktop: 2 columns */}
<div className="grid lg:grid-cols-2 gap-12">
```

### Content Adaptation

```tsx
{/* Hide/show content based on screen size */}
<div className="hidden md:flex items-center gap-1">
  <MapPin className="w-4 h-4" />
  <span>{distance} away</span>
</div>

{/* Responsive spacing */}
<div className="p-4 md:p-6">
```

## 🎯 Card States

### Hover States

```tsx
{
  /* Standard hover elevation */
}
className = 'hover:shadow-card transition-smooth';

{
  /* Border highlight on hover */
}
className = 'hover:border-primary/50';

{
  /* Combined hover effects */
}
className = 'hover:shadow-card hover:border-primary/50 transition-smooth';
```

### Popular/Featured States

```tsx
{
  /* Featured ring */
}
className = 'ring-2 ring-primary shadow-card';

{
  /* Popular badge */
}
<div className="absolute -top-3 left-6 bg-gradient-primary text-primary-foreground px-3 py-1 rounded-full">
  Most Popular
</div>;
```

### Loading States

```tsx
{
  /* Skeleton loading */
}
<div className="bg-card rounded-2xl p-6 border animate-pulse">
  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-muted rounded w-1/2"></div>
</div>;
```

## 🔍 Card Variations

### Compact Cards

```tsx
{
  /* Reduced padding and spacing */
}
<div className="bg-card rounded-xl p-4 border">
  <div className="space-y-2">
    <h4 className="font-medium">{title}</h4>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
</div>;
```

### Image Cards

```tsx
{
  /* Cards with image backgrounds */
}
<div className="relative overflow-hidden rounded-2xl">
  <img src={image} className="w-full h-48 object-cover" />
  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
    <h3 className="font-semibold text-lg">{title}</h3>
  </div>
</div>;
```

### Action Cards

```tsx
{
  /* Cards that are entirely clickable */
}
<button className="bg-card rounded-2xl p-6 border hover:shadow-card transition-smooth text-left w-full">
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
      {icon}
    </div>
    <div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
</button>;
```

## ✅ Card Guidelines

### Do's

✅ Use consistent padding (`p-6` for standard, `p-4` for compact)  
✅ Include hover effects for interactive cards  
✅ Maintain visual hierarchy with proper spacing  
✅ Use semantic HTML within cards  
✅ Include proper alt text for images

### Don'ts

❌ Overcrowd cards with too much information  
❌ Use inconsistent corner radius across card types  
❌ Ignore mobile touch target sizes  
❌ Mix different card styling patterns in the same section  
❌ Use cards without any interactive elements

## 🎨 Advanced Card Patterns

### Card with Floating Elements

```tsx
{
  /* Hero section floating card */
}
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
</div>;
```

### Multi-Section Cards

```tsx
{
  /* Cards with distinct sections */
}
<div className="bg-card rounded-2xl border overflow-hidden">
  <div className="p-6 border-b">
    <h3 className="font-semibold">{title}</h3>
  </div>
  <div className="p-6">
    <p className="text-muted-foreground">{content}</p>
  </div>
  <div className="p-6 bg-muted/30 border-t">
    <Button className="w-full">Action</Button>
  </div>
</div>;
```

---

_Card system designed for clarity, consistency, and optimal information presentation across all content types._
