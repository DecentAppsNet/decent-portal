import { describe, it, expect } from 'vitest';

import { isSettingValuesFormat } from '../SettingValues';

describe('SettingValues', () => {
  describe('isSettingValuesFormat()', () => {
    it('returns true for a valid SettingValues object', () => {
      const validSettingValues = { key1: 'value1', key2: 42 };
      expect(isSettingValuesFormat(validSettingValues)).toBe(true);
    });

    it('returns false for null', () => {
      expect(isSettingValuesFormat(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isSettingValuesFormat(undefined)).toBe(false);
    });

    it('returns false for an array', () => {
      expect(isSettingValuesFormat(['value1', 'value2'])).toBe(false);
    });

    it('returns false for a non-object type', () => {
      expect(isSettingValuesFormat(123)).toBe(false);
      expect(isSettingValuesFormat('string')).toBe(false);
      expect(isSettingValuesFormat(true)).toBe(false);
    });
  });
});