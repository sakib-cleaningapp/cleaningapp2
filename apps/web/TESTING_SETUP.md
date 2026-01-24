# Testing Setup Documentation

## Overview

This project uses Vitest and React Testing Library for frontend testing.

## Configuration

### Testing Framework

- **Vitest**: Fast unit test runner with ES modules support
- **React Testing Library**: DOM testing utilities for React components
- **jsdom**: Browser environment simulation for testing

### Setup Files

- **Config**: `vitest.config.ts` - Main Vitest configuration
- **Setup**: `src/test/setup.ts` - Global test setup and imports
- **Types**: `@testing-library/jest-dom` for additional matchers

## Running Tests

### Commands

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui
```

### Test Location

Tests are located next to the components they test:

- `src/components/**/__tests__/**/*.test.tsx`

## Writing Tests

### Basic Component Test

```tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../my-component';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### User Interaction Test

```tsx
import userEvent from '@testing-library/user-event';

it('handles click events', async () => {
  const user = userEvent.setup();
  const handleClick = vi.fn();

  render(<Button onClick={handleClick}>Click me</Button>);

  await user.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

## Available Matchers

From `@testing-library/jest-dom`:

- `toBeInTheDocument()`
- `toHaveClass()`
- `toBeDisabled()`
- `toHaveValue()`
- And many more...

## Best Practices

1. Test behavior, not implementation
2. Use semantic queries (getByRole, getByLabelText)
3. Test user interactions with userEvent
4. Keep tests focused and isolated
5. Use descriptive test names
