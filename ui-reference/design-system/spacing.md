# Spacing System

CleanEase uses Tailwind CSS's default spacing scale with some custom extensions for consistent layout and rhythm throughout the application.

## 📏 Spacing Scale

### Core Spacing Units

```css
/* Tailwind's default spacing scale (in rem) */
0:     0px       /* 0 */
px:    1px       /* 1px */
0.5:   0.125rem  /* 2px */
1:     0.25rem   /* 4px */
1.5:   0.375rem  /* 6px */
2:     0.5rem    /* 8px */
2.5:   0.625rem  /* 10px */
3:     0.75rem   /* 12px */
3.5:   0.875rem  /* 14px */
4:     1rem      /* 16px */
5:     1.25rem   /* 20px */
6:     1.5rem    /* 24px */
8:     2rem      /* 32px */
10:    2.5rem    /* 40px */
12:    3rem      /* 48px */
16:    4rem      /* 64px */
20:    5rem      /* 80px */
24:    6rem      /* 96px */
32:    8rem      /* 128px */
40:    10rem     /* 160px */
48:    12rem     /* 192px */
56:    14rem     /* 224px */
64:    16rem     /* 256px */
```

## 🎯 Common Spacing Patterns

### Component Spacing

#### Card Content

```tsx
{/* Standard card padding */}
<div className="p-6">           {/* 24px all sides */}

{/* Compact cards */}
<div className="p-4">           {/* 16px all sides */}

{/* Spacious cards */}
<div className="p-8">           {/* 32px all sides */}
```

#### Section Spacing

```tsx
{/* Standard section padding */}
<section className="py-16">     {/* 64px top/bottom */}

{/* Compact sections */}
<section className="py-12">     {/* 48px top/bottom */}

{/* Large sections */}
<section className="py-20">     {/* 80px top/bottom */}
```

#### Element Spacing

```tsx
{/* Text content spacing */}
<div className="space-y-4">     {/* 16px between children */}
<div className="space-y-6">     {/* 24px between children */}
<div className="space-y-8">     {/* 32px between children */}

{/* Horizontal spacing */}
<div className="space-x-2">     {/* 8px between children */}
<div className="space-x-4">     {/* 16px between children */}
<div className="space-x-6">     {/* 24px between children */}
```

## 📱 Container System

### Container Configuration

```css
/* Custom container configuration */
.container {
  center: true;
  padding: "2rem";     /* 32px */
  screens: {
    "2xl": "1400px";   /* Custom max-width */
  }
}
```

### Container Usage

```tsx
{/* Standard container */}
<div className="container">     {/* Auto-centered with 32px padding */}

{/* Full width on small screens */}
<div className="container mx-auto px-4 md:px-8">
```

## 🏗️ Layout Patterns

### Hero Section Spacing

```tsx
<section className="relative min-h-[70vh] flex items-center">
  <div className="container relative z-10">
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <div className="space-y-8">                    {/* 32px between elements */}
        <div className="space-y-4">                  {/* 16px between text */}
          <h1 className="text-4xl font-bold">
          <p className="text-lg text-muted-foreground">
        </div>
```

### Card Grid Spacing

```tsx
{/* Service cards grid */}
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">    {/* 24px gaps */}

{/* Cleaner profiles grid */}
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
```

### Navigation Spacing

```tsx
{/* Header spacing */}
<header className="sticky top-0 z-50 w-full border-b">
  <div className="container flex h-16 items-center justify-between">
    <div className="flex items-center gap-6">        {/* 24px between nav items */}
      <div className="flex items-center gap-2">      {/* 8px between logo elements */}
```

## 🎨 Margin & Padding Patterns

### Content Sections

```tsx
{/* Section headers */}
<div className="text-center mb-12">                 {/* 48px bottom margin */}
  <h2 className="text-3xl font-bold mb-4">          {/* 16px bottom margin */}
  <p className="text-lg text-muted-foreground">
</div>

{/* Card content */}
<div className="p-6">                               {/* 24px padding */}
  <h3 className="font-semibold text-lg mb-2">       {/* 8px bottom margin */}
  <p className="text-muted-foreground mb-4">        {/* 16px bottom margin */}
</div>
```

### Form Spacing

```tsx
{/* Form elements */}
<div className="space-y-4">                        {/* 16px between form fields */}
  <Input className="h-12" />                       {/* 48px height */}
  <Button size="lg" className="w-full">            {/* h-11 (44px) */}
</div>

{/* Form containers */}
<div className="bg-background p-6 rounded-2xl shadow-card border">
```

### Button Spacing

```tsx
{/* Button groups */}
<div className="flex gap-2">                       {/* 8px between buttons */}
<div className="flex gap-3">                       {/* 12px between buttons */}
<div className="flex gap-4">                       {/* 16px between buttons */}

{/* Button internal spacing (from button.tsx) */}
size: {
  default: "h-10 px-4 py-2",                      {/* 40px height, 16px horizontal */}
  sm: "h-9 px-3",                                 {/* 36px height, 12px horizontal */}
  lg: "h-11 px-8",                                {/* 44px height, 32px horizontal */}
  icon: "h-10 w-10",                              {/* 40px square */}
}
```

## 📐 Grid Systems

### Responsive Grids

```tsx
{/* 1-column mobile, 2-column tablet, 3-column desktop */}
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

{/* 1-column mobile, 2-column desktop */}
<div className="grid lg:grid-cols-2 gap-12">

{/* Auto-fit responsive grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
```

### Gap Patterns

```tsx
{
  /* Small gaps - tight layouts */
}
gap - 2; /* 8px */
gap - 3; /* 12px */

{
  /* Medium gaps - standard layouts */
}
gap - 4; /* 16px */
gap - 6; /* 24px */

{
  /* Large gaps - spacious layouts */
}
gap - 8; /* 32px */
gap - 12; /* 48px */
```

## 🎯 Responsive Spacing

### Mobile-First Approach

```tsx
{/* Base mobile spacing, larger on desktop */}
<section className="py-12 md:py-16 lg:py-20">

{/* Container padding responsive */}
<div className="px-4 md:px-6 lg:px-8">

{/* Grid gaps responsive */}
<div className="grid gap-4 md:gap-6 lg:gap-8">
```

### Breakpoint-Specific Spacing

```tsx
{/* Different spacing at different breakpoints */}
<div className="space-y-4 md:space-y-6 lg:space-y-8">
<div className="p-4 md:p-6 lg:p-8">
<div className="mb-6 md:mb-8 lg:mb-12">
```

## 🔍 Spacing Guidelines

### Vertical Rhythm

```tsx
{/* Content hierarchy */}
<div className="space-y-8">                        {/* Major sections */}
  <div className="space-y-4">                      {/* Content groups */}
    <h2 className="mb-2">                          {/* Tight heading spacing */}
    <p className="mb-4">                           {/* Paragraph spacing */}
  </div>
</div>
```

### Component Spacing

```tsx
{/* Card internal spacing */}
<div className="p-6 space-y-4">                    {/* Consistent internal rhythm */}

{/* Button spacing */}
<div className="flex gap-2 pt-4">                  {/* Action area separation */}

{/* List spacing */}
<ul className="space-y-2">                        {/* List item separation */}
```

## ✅ Spacing Best Practices

### Do's

✅ Use consistent spacing scale (`space-y-4`, `gap-6`, etc.)  
✅ Follow mobile-first responsive patterns  
✅ Maintain vertical rhythm with `space-y-*`  
✅ Use semantic spacing (section padding, card spacing)  
✅ Consider touch targets on mobile (minimum 44px)

### Don'ts

❌ Use arbitrary margin/padding values  
❌ Mix different spacing systems  
❌ Ignore responsive spacing needs  
❌ Create cramped mobile layouts  
❌ Use excessive spacing that breaks visual hierarchy

## 🎨 Component-Specific Spacing

### Header Component

```tsx
<header className="sticky top-0 z-50 w-full border-b">
  <div className="container flex h-16 items-center justify-between">
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
```

### Service Cards

```tsx
<div className="p-6">                              {/* Standard card padding */}
  <div className="flex items-start justify-between mb-4">
  <h3 className="font-semibold text-lg mb-2">
  <p className="text-muted-foreground mb-4">
  <div className="flex items-center gap-4 mb-6">
```

### Hero Section

```tsx
<div className="space-y-8">                        {/* Major content spacing */}
  <div className="space-y-4">                      {/* Text group spacing */}
  <div className="bg-background p-6 rounded-2xl">  {/* Search box padding */}
  <div className="flex items-center gap-8 pt-4">   {/* Stats spacing */}
```

## 📊 Spacing Reference Chart

| Purpose             | Mobile | Tablet | Desktop | Classes                               |
| ------------------- | ------ | ------ | ------- | ------------------------------------- |
| **Section Padding** | 48px   | 64px   | 80px    | `py-12 md:py-16 lg:py-20`             |
| **Card Padding**    | 16px   | 24px   | 24px    | `p-4 md:p-6`                          |
| **Content Spacing** | 16px   | 24px   | 32px    | `space-y-4 md:space-y-6 lg:space-y-8` |
| **Grid Gaps**       | 16px   | 24px   | 24px    | `gap-4 md:gap-6`                      |
| **Button Height**   | 40px   | 44px   | 44px    | `h-10 md:h-11`                        |

---

_Spacing system designed for consistent rhythm, visual hierarchy, and responsive harmony._
