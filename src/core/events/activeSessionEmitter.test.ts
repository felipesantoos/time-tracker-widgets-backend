import { describe, it, expect, vi } from 'vitest';
import { activeSessionEmitter } from './activeSessionEmitter';

describe('ActiveSessionEmitter', () => {
  it('should emit activeSessionChange event when notifyActiveSessionChange is called', () => {
    const userId = 'user-123';
    const callback = vi.fn();

    activeSessionEmitter.on('activeSessionChange', callback);
    activeSessionEmitter.notifyActiveSessionChange(userId);

    expect(callback).toHaveBeenCalledWith(userId);
    expect(callback).toHaveBeenCalledTimes(1);

    // Cleanup
    activeSessionEmitter.removeListener('activeSessionChange', callback);
  });

  it('should support multiple listeners', () => {
    const userId = 'user-456';
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    activeSessionEmitter.on('activeSessionChange', callback1);
    activeSessionEmitter.on('activeSessionChange', callback2);
    
    activeSessionEmitter.notifyActiveSessionChange(userId);

    expect(callback1).toHaveBeenCalledWith(userId);
    expect(callback2).toHaveBeenCalledWith(userId);

    // Cleanup
    activeSessionEmitter.removeListener('activeSessionChange', callback1);
    activeSessionEmitter.removeListener('activeSessionChange', callback2);
  });
});
