import { isBooleanToggleSettingFormat } from "../BooleanToggleSetting";
import { describe, expect, it } from "vitest";
import SettingType from "../SettingType";

describe('BooleanToggleSetting', () => {
  describe('isBooleanToggleSettingFormat()', () => {
    it('returns false if passed null', () => {
      expect(isBooleanToggleSettingFormat(null)).toBe(false);
    });

    it('returns false if passed undefined', () => {
      expect(isBooleanToggleSettingFormat(undefined)).toBe(false);
    });

    it('returns false if type is a different setting type', () => {
      const setting = { type:SettingType.BOOLEAN_TOGGLE, label: 'Test' };
      expect(isBooleanToggleSettingFormat(setting)).toBe(false);
    });

    it('returns true for minimally defined boolean toggle setting', () => {
      const setting = {
        id: 'test',
        type: SettingType.BOOLEAN_TOGGLE,
        label: 'label',
        value: true
      };
      expect(isBooleanToggleSettingFormat(setting)).toBe(true);
    });

    it('returns false if value is non-boolean', () => {
      const setting = {
        id: 'test',
        type: SettingType.BOOLEAN_TOGGLE,
        label: 'Test Boolean Toggle',
        value: 'not a boolean'
      };
      expect(isBooleanToggleSettingFormat(setting)).toBe(false);
    });

    it('returns false if trueLabel is defined but not a string', () => {
      const setting = {
        id: 'test',
        type: SettingType.BOOLEAN_TOGGLE,
        label: 'Test Boolean Toggle',
        value: true,
        trueLabel: 123 // not a string
      };
      expect(isBooleanToggleSettingFormat(setting)).toBe(false);
    });

    it('returns true if trueLabel is a string', () => {
      const setting = {
        id: 'test',
        type: SettingType.BOOLEAN_TOGGLE,
        label: 'Test Boolean Toggle',
        value: true,
        trueLabel: 'Enabled'
      };
      expect(isBooleanToggleSettingFormat(setting)).toBe(true);
    });

    it('returns false if falseLabel is defined but not a string', () => {
      const setting = {
        id: 'test',
        type: SettingType.BOOLEAN_TOGGLE,
        label: 'Test Boolean Toggle',
        value: false,
        falseLabel: 123 // not a string
      };
      expect(isBooleanToggleSettingFormat(setting)).toBe(false);
    });

    it('returns true if falseLabel is a string', () => {
      const setting = {
        id: 'test',
        type: SettingType.BOOLEAN_TOGGLE,
        label: 'Test Boolean Toggle',
        value: false,
        falseLabel: 'Disabled'
      };
      expect(isBooleanToggleSettingFormat(setting)).toBe(true);
    });
  });
});