# Shadcn/ui Setup Documentation

## Overview

This project uses Shadcn/ui for consistent, accessible UI components with a blue theme.

## Configuration

### Components Configuration

- **Location**: `apps/web/components.json`
- **Style**: Default
- **Base Color**: Blue
- **CSS Variables**: Yes
- **RSC**: Yes
- **TypeScript**: Yes

### Theme Setup

- **CSS Variables**: `apps/web/src/app/globals.css`
- **Tailwind Config**: `apps/web/tailwind.config.ts`
- **Dark Mode**: Class-based switching

## Available Components

### Core Components

- **Button** (`@/components/ui/button`) - Multiple variants (default, secondary, outline, ghost)
- **Input** (`@/components/ui/input`) - Form input with consistent styling
- **Label** (`@/components/ui/label`) - Accessible form labels
- **Form** (`@/components/ui/form`) - Form wrapper with field and message components

### Usage Example

```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ExampleForm() {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="Enter email" />
      </div>
      <Button>Submit</Button>
    </div>
  );
}
```

## Theme Colors

The theme uses CSS variables for consistent theming:

- `--primary`: Main brand color (blue)
- `--secondary`: Secondary actions
- `--muted`: Subtle backgrounds
- `--accent`: Highlight elements
- `--destructive`: Error states

## Adding New Components

To add new Shadcn/ui components:

1. **Install component**:

   ```bash
   cd apps/web
   npx shadcn-ui@latest add [component-name]
   ```

2. **Import and use**:
   ```tsx
   import { ComponentName } from '@/components/ui/component-name';
   ```

## Development Notes

- All components follow Radix UI accessibility standards
- Components are fully typed with TypeScript
- Theme supports both light and dark modes
- CSS variables enable easy theme customization
