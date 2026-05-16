import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from './Modal';

// Mock react-icons
vi.mock('react-icons/fi', () => ({
  FiX: () => <span data-testid="icon-close">✕</span>,
}));

describe('Modal', () => {
  it('should return null when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <p>Content</p>
      </Modal>
    );

    expect(container.innerHTML).toBe('');
  });

  it('should render title and children when open', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <p>Modal content here</p>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content here')).toBeInTheDocument();
  });

  it('should call onClose when clicking close button', () => {
    const onClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <p>Content</p>
      </Modal>
    );

    const closeButton = screen.getByTestId('icon-close').closest('button');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should render multiple children', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Multi Content">
        <p>First paragraph</p>
        <p>Second paragraph</p>
        <button>Action Button</button>
      </Modal>
    );

    expect(screen.getByText('First paragraph')).toBeInTheDocument();
    expect(screen.getByText('Second paragraph')).toBeInTheDocument();
    expect(screen.getByText('Action Button')).toBeInTheDocument();
  });
});
