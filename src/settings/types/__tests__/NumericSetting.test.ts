import { isNumericSettingFormat } from "../NumericSetting";
import { describe, expect, it } from "vitest";
import SettingType from "../SettingType";

describe('NumericSetting', () => {
  describe('isNumericSettingFormat()', () => {
    it('returns false if passed null', () => {
      expect(isNumericSettingFormat(null)).toBe(false);
    });

    it('returns false if passed undefined', () => {
      expect(isNumericSettingFormat(undefined)).toBe(false);
    });

    it('returns false if type is a different setting type', () => {
      const setting = {
        id: 'test',
        type:SettingType.BOOLEAN_TOGGLE, 
        label: 'Test',
        value: 10,
        minValue: 0,
        maxValue: 100
      };
      expect(isNumericSettingFormat(setting)).toBe(false);
    });

    it('returns true for minimally defined numeric setting', () => {
      const setting = {
        id: 'test',
        type: SettingType.NUMERIC,
        label: 'Label',
        value: 10,
        minValue: 0,
        maxValue: 100
      };
      expect(isNumericSettingFormat(setting)).toBe(true);
    });

    it('returns false if value is non-numeric', () => {
      const setting = {
        id: 'test',
        type: SettingType.NUMERIC,
        label: 'Label',
        minValue: 0,
        maxValue: 100,
        value: 'not a number'
      };
      expect(isNumericSettingFormat(setting)).toBe(false);
    });

    it('returns false if minValue is undefined', () => {
      const setting = {
        id: 'test',
        type: SettingType.NUMERIC,
        label: 'Label',
        value: 10,
        maxValue: 100
      };
      expect(isNumericSettingFormat(setting)).toBe(false);
    });

    it('returns false if maxValue is undefined', () => {
      const setting = {
        id: 'test',
        type: SettingType.NUMERIC,
        label: 'Label',
        value: 10,
        minValue: 0
      };
      expect(isNumericSettingFormat(setting)).toBe(false);
    });

    it('returns false if allowDecimals is a string', () => {
      const setting = {
        id: 'test',
        type: SettingType.NUMERIC,
        label: 'Label',
        value: 10,
        minValue: 0,
        maxValue: 100,
        allowDecimals: 'true'
      };
      expect(isNumericSettingFormat(setting)).toBe(false);
    });

    it('returns true if allowDecimals is a boolean', () => {
      const setting = {
        id: 'test',
        type: SettingType.NUMERIC,
        label: 'Label',
        value: 10,
        minValue: 0,
        maxValue: 100,
        allowDecimals: true
      };
      expect(isNumericSettingFormat(setting)).toBe(true);
    });
  });
});