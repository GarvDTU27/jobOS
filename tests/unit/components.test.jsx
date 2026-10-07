import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog, DialogTrigger, DialogContent } from '../../components/ui/Dialog';

describe('UI Primitives', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders Button correctly', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeDefined();
    expect(button.className).toContain('bg-blue-600'); // default variant
  });

  it('Button handles onClick', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button', { name: /click me/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders Input correctly', () => {
    render(<Input placeholder="Enter email" />);
    const input = screen.getByPlaceholderText(/enter email/i);
    expect(input).toBeDefined();
  });

  it('renders Dialog and opens on trigger click', () => {
    render(
      <Dialog>
        <DialogTrigger asChild>
          <button>Open Dialog</button>
        </DialogTrigger>
        <DialogContent>
          <p>Dialog Content Here</p>
        </DialogContent>
      </Dialog>
    );

    // Content should not be visible initially
    expect(screen.queryByText('Dialog Content Here')).toBeNull();

    // Click trigger
    fireEvent.click(screen.getByText('Open Dialog'));

    // Content should now be visible
    expect(screen.getByText('Dialog Content Here')).toBeDefined();
  });
});
