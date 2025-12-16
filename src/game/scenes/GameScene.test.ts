import { describe, it, expect, vi } from 'vitest';
import { FIELD_WIDTH, FIELD_VISIBLE_HEIGHT } from '../../model/constants';

// Mock Phaser to avoid WebGL initialization in jsdom tests
vi.mock('phaser', () => ({
  default: {
    Scene: class MockScene {
      scene = { key: 'GameScene' };
      create() {}
      update() {}
    },
  },
}));

/**
 * Note: These are structural tests only. Full integration testing of Phaser scenes
 * requires a WebGL context which is not available in jsdom. Manual testing in
 * the browser is required to verify rendering behavior.
 */
describe('GameScene', () => {
  it('should verify grid dimensions constants', () => {
    // This test verifies the constants used for rendering
    // Actual rendering must be verified manually in browser
    const expectedCells = FIELD_WIDTH * FIELD_VISIBLE_HEIGHT;
    expect(expectedCells).toBe(200);
    expect(FIELD_WIDTH).toBe(10);
    expect(FIELD_VISIBLE_HEIGHT).toBe(20);
  });

  it('should import GameScene without errors', async () => {
    // This verifies the module can be loaded (with Phaser mocked)
    const { GameScene } = await import('./GameScene');
    expect(GameScene).toBeDefined();
    expect(typeof GameScene).toBe('function');
  });
});
