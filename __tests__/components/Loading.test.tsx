import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { waitForNextTick as _importedWaitForNextTick } from '../utils/test-utils';
import Loading from '@/components/Loading';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      className,
      role,
      'aria-label': ariaLabel,
    }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} role={role} aria-label={ariaLabel}>
        {children}
      </div>
    ),
    p: ({
      children,
      className,
    }: React.HTMLAttributes<HTMLParagraphElement>) => (
      <p className={className}>{children}</p>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

export const _waitForNextTick = (): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, 0));

describe('Loading Component', () => {
  it('renders with correct accessibility attributes', () => {
    render(<Loading />);

    const loadingElement = screen.getByRole('status');
    expect(loadingElement).toHaveAttribute('aria-label', 'Loading content');
  });

  it('displays loading text with proper visibility', () => {
    render(<Loading />);

    expect(screen.getByText('Loading...')).toBeVisible();
    expect(
      screen.getByText(/Please wait while content loads/i)
    ).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    render(<Loading />);

    const container = screen.getByRole('status');
    expect(container).toHaveClass('flex', 'items-center', 'justify-center');
  });

  it('renders spinner animation elements', () => {
    render(<Loading />);

    const spinnerElements = screen.getAllByRole('presentation', {
      hidden: true,
    });
    expect(spinnerElements.length).toBeGreaterThanOrEqual(1);
  });

  it('maintains proper DOM hierarchy', () => {
    const { container } = render(<Loading />);

    const loadingContainer = container.firstChild;
    expect(loadingContainer?.childNodes.length).toBeGreaterThanOrEqual(1);
    expect(loadingContainer).toContainElement(screen.getByText('Loading...'));
  });
});
