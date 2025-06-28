import { isSettingBaseFormat } from "../SettingBase";
import { describe, it, expect } from "vitest";
import SettingType from "../SettingType";

describe('SettingBase', () => {
  describe('isSettingBaseFormat()', () => {
    it('returns false if passed null', () => {
      expect(isSettingBaseFormat(null)).toBe(false);
    });

    it('returns false if passed undefined', () => {
      expect(isSettingBaseFormat(undefined)).toBe(false);
    });

    it('returns false if id is missing', () => {
      const setting = { label:'Test', type:SettingType.NUMERIC };
      expect(isSettingBaseFormat(setting)).toBe(false);
    });

    it('returns false if id is not a string', () => {
      const setting = { id:123, label:'Test', type:SettingType.NUMERIC };
      expect(isSettingBaseFormat(setting)).toBe(false);
    });

    it('returns false if label is missing', () => {
      const setting = { id:'test', type:SettingType.NUMERIC };
      expect(isSettingBaseFormat(setting)).toBe(false);
    });

    it('returns false if label is not a string', () => {
      const setting = { id:'test', label:123, type:SettingType.NUMERIC };
      expect(isSettingBaseFormat(setting)).toBe(false);
    });

    it('returns false if type is missing', () => {
      const setting = { id:'test', label:'Test Label' };
      expect(isSettingBaseFormat(setting)).toBe(false);
    });

    it('returns false if type is not a string', () => {
      const setting = { id:'test', label:'Test Label', type:123 };
      expect(isSettingBaseFormat(setting)).toBe(false);
    });

    it('returns true for minimally defined setting base', () => {
      const setting = { id:'test', label:'Test Label', type:SettingType.NUMERIC };
      expect(isSettingBaseFormat(setting)).toBe(true);
    });
  });
});