import { describe, it, expect } from 'vitest';
import { estimateAvailableStorage } from '../storageUtil';

describe('storageUtil', () => {
  describe('estimateAvailableStorage()', () => {
    it('returns 0 in test environement where storage is not supported', async () => {
      expect(await estimateAvailableStorage()).toBe(0);
    });
  });
});