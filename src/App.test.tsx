import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the PhaserGame component to avoid Phaser initialization in tests
vi.mock('./PhaserGame', () => ({
  PhaserGame: ({ ref }: { ref: React.RefObject<unknown> }) => (
    <div data-testid="phaser-game" id="game-container" ref={ref} />
  ),
}));

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeInTheDocument();
  });

  it('renders UI buttons', () => {
    render(<App />);
    const changeSceneButtons = screen.getAllByText('Change Scene');
    expect(changeSceneButtons.length).toBeGreaterThan(0);
    expect(changeSceneButtons[0]).toBeInTheDocument();
  });
});
