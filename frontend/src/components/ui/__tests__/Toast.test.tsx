import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ToastProvider, useToast } from '../Toast';

// Test component to use the toast hook
const TestComponent = () => {
  const { addToast, clearToasts } = useToast();

  return (
    <div>
      <button
        onClick={() => addToast({ title: 'Test Toast', description: 'Test description', type: 'success' })}
      >
        Add Toast
      </button>
      <button onClick={clearToasts}>Clear Toasts</button>
    </div>
  );
};

describe('Toast', () => {
  it('renders toast provider without errors', () => {
    render(
      <ToastProvider>
        <div>Test content</div>
      </ToastProvider>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('adds and displays toast', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Add Toast'));
    
    await waitFor(() => {
      expect(screen.getByText('Test Toast')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });
  });

  it('removes toast when close button is clicked', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Add Toast'));
    
    await waitFor(() => {
      expect(screen.getByText('Test Toast')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText('Test Toast')).not.toBeInTheDocument();
    });
  });

  it('clears all toasts', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Add Toast'));
    
    await waitFor(() => {
      expect(screen.getByText('Test Toast')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Clear Toasts'));

    await waitFor(() => {
      expect(screen.queryByText('Test Toast')).not.toBeInTheDocument();
    });
  });
});