import { isTextSettingFormat } from "../TextSetting";
import { describe, expect, it } from "vitest";
import SettingType from "../SettingType";

describe('TextSetting', () => {
  describe('isTextSettingFormat()', () => {
    it('returns false if passed null', () => {
      expect(isTextSettingFormat(null)).toBe(false);
    });

    it('returns false if passed undefined', () => {
      expect(isTextSettingFormat(undefined)).toBe(false);
    });

    it('returns false if type is a different setting type', () => {
      const setting = { type:SettingType.NUMERIC, label: 'Test' };
      expect(isTextSettingFormat(setting)).toBe(false);
    });

    it('returns true for minimally defined text setting', () => {
      const setting = {
        id: 'test',
        type: SettingType.TEXT,
        label: 'label',
        value: 'some text'
      };
      expect(isTextSettingFormat(setting)).toBe(true);
    });

    it('returns false if value is non-string', () => {
      const setting = {
        id: 'test',
        type: SettingType.TEXT,
        label: 'Test Text Setting',
        value: 123 // not a string
      };
      expect(isTextSettingFormat(setting)).toBe(false);
    });

    it('returns false if placeholder is defined but not a string', () => {
      const setting = {
        id: 'test',
        type: SettingType.TEXT,
        label: 'Test Text Setting',
        value: 'some text',
        placeholder: 123 // not a string
      };
      expect(isTextSettingFormat(setting)).toBe(false);
    });

    it('returns true if placeholder is a string', () => {
      const setting = {
        id: 'test',
        type: SettingType.TEXT,
        label: 'Test Text Setting',
        value: 'some text',
        placeholder: 'Enter text here'
      };
      expect(isTextSettingFormat(setting)).toBe(true);
    });
  });
});