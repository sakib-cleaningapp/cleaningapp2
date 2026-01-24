import { render, screen } from '@testing-library/react';
import { UIShowcase } from '../ui-showcase';

describe('UIShowcase', () => {
  it('renders the component showcase', () => {
    render(<UIShowcase />);

    // Check for main heading
    expect(screen.getByText('UI Component Showcase')).toBeInTheDocument();

    // Check for description
    expect(
      screen.getByText('Demonstrating Shadcn/ui components with our theme')
    ).toBeInTheDocument();

    // Check for form elements
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();

    // Check for buttons
    expect(
      screen.getByRole('button', { name: 'Primary Button' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Secondary' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Outline' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ghost' })).toBeInTheDocument();

    // Check for theme colors section
    expect(screen.getByText('Theme Colors')).toBeInTheDocument();
    expect(screen.getByText('Primary')).toBeInTheDocument();
    expect(screen.getAllByText('Secondary')).toHaveLength(2); // Button and color swatch
    expect(screen.getByText('Muted')).toBeInTheDocument();
    expect(screen.getByText('Accent')).toBeInTheDocument();
  });

  it('renders input fields with placeholders', () => {
    render(<UIShowcase />);

    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Enter your full name')
    ).toBeInTheDocument();
  });
});
