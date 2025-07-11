import { describe, it, expect } from "vitest";

import { isSettingFormat, duplicateSetting } from "../Setting";
import TextSetting from "../TextSetting";
import BooleanToggleSetting from "../BooleanToggleSetting";
import NumericRangeSetting from "../NumericSetting";
import SettingType from "../SettingType";

describe('Setting', () => {
  describe('isSettingFormat()', () => {
    it('returns false for non-setting objects', () => {
      expect(isSettingFormat({})).toBe(false);
      expect(isSettingFormat({ type: 'unknown' })).toBe(false);
    });

    it('returns false for setting with invalid type', () => {
      const invalidSetting = { id:'test', type:'invalid_type', label:'Test Setting', value:'Test Value' };
      expect(isSettingFormat(invalidSetting)).toBe(false);
    });

    it('returns true for valid text setting format', () => {
      const setting = { id:'test', type:SettingType.TEXT, label:'Test Setting', value:'Test Value' };
      expect(isSettingFormat(setting)).toBe(true);
    });

    it('returns true for valid boolean toggle setting format', () => {
      const setting = { id:'test', type:SettingType.BOOLEAN_TOGGLE, label:'Test Setting', value:true };
      expect(isSettingFormat(setting)).toBe(true);
    });

    it('returns true for valid numeric range setting format', () => {
      const setting = { id:'test', type:SettingType.NUMERIC, label:'Test Setting', value:42, minValue:0, maxValue:100 };
      expect(isSettingFormat(setting)).toBe(true);
    });
  });

  describe('duplicateSetting()', () => {
    it('duplicates a text setting', () => {
      const original:TextSetting = { 
        id:'text1', 
        type:SettingType.TEXT, 
        label:'Text Setting', 
        value:'Some text' 
      };
      const duplicate = duplicateSetting(original);
      expect(duplicate).toEqual(original);
    });

    it('duplicates a boolean toggle setting', () => {
      const original:BooleanToggleSetting = { 
        id:'bool1', 
        type:SettingType.BOOLEAN_TOGGLE, 
        label:'Boolean Setting', 
        value:true 
      };
      const duplicate = duplicateSetting(original);
      expect(duplicate).toEqual(original);
    });

    it('duplicates a numeric setting', () => {
      const original:NumericRangeSetting = { 
        id:'num1', 
        type:SettingType.NUMERIC, 
        label:'Numeric Setting', 
        value:42,
        minValue:0,
        maxValue:100
      };
      const duplicate = duplicateSetting(original);
      expect(duplicate).toEqual(original);
    });
  });
});