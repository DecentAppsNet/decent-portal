
import { describe, it, expect } from 'vitest';

import { collateSettingRows, findDisabledSettings, isSettingsFormat } from '../settingsUtil';
import SettingCategory from '../types/SettingCategory';
import SettingRow from '../types/SettingRow';
import SettingType from '../types/SettingType';
import { HEADING_TYPE } from '../types/Heading';

describe('settingsUtil', () => {
  describe('collateSettingRows()', () => {
    it('returns empty array for category with no settings or headings', () => {
      const category:SettingCategory = {
        id:'id', name:'name', description:'d', settings:[],
      };
      const rows = collateSettingRows(category);
      const expected:SettingRow[] = [];
      expect(rows).toEqual(expected);
    });

    it('returns rows for settings for category with settings and no headings', () => {
      const category:SettingCategory = {
        id:'id', name:'name', description:'d',
        settings: [
          { id:'s1', type:SettingType.TEXT, label:'l', value:'x' },
          { id:'s2', type:SettingType.BOOLEAN_TOGGLE, label:'l', value:true }
        ]
      };
      const rows = collateSettingRows(category);
      const expected:SettingRow[] = [
        { type:SettingType.TEXT, id:'s1', label:'l', value:'x' },
        { type:SettingType.BOOLEAN_TOGGLE, id:'s2', label:'l', value:true }
      ];
      expect(rows).toEqual(expected);
    });

    it('returns row for heading for category with no settings and a heading row', () => {
      const category:SettingCategory = {
        id:'id', name:'name', description:'d',
        settings: [],
        headings: [{ description:'h1', precedeSettingId:null }]
      };
      const rows = collateSettingRows(category);
      const expected:SettingRow[] = [
        { type:HEADING_TYPE, description:'h1', precedeSettingId:null }
      ];
      expect(rows).toEqual(expected);
    });

    it('returns heading rows interspersed with associated setting rows', () => {
      const category:SettingCategory = {
        id:'id', name:'name', description:'d',
        settings: [
          { id:'s1', type:SettingType.TEXT, label:'l', value:'x' },
          { id:'s2', type:SettingType.BOOLEAN_TOGGLE, label:'l', value:true }
        ],
        headings: [
          { description:'h1', precedeSettingId:'s1' },
          { description:'h2', precedeSettingId:'s2' }
        ]
      };
      const rows = collateSettingRows(category);
      const expected:SettingRow[] = [
        { type:HEADING_TYPE, description:'h1', precedeSettingId:'s1' },
        { type:SettingType.TEXT, id:'s1', label:'l', value:'x' },
        { type:HEADING_TYPE, description:'h2', precedeSettingId:'s2' },
        { type:SettingType.BOOLEAN_TOGGLE, id:'s2', label:'l', value:true }
      ];
      expect(rows).toEqual(expected);
    });

    it('returns a heading coming after all settings', () => {
      const category:SettingCategory = {
        id:'id', name:'name', description:'d',
        settings: [
          { id:'s1', type:SettingType.TEXT, label:'l', value:'x' },
          { id:'s2', type:SettingType.BOOLEAN_TOGGLE, label:'l', value:true }
        ],
        headings: [
          { description:'h1', precedeSettingId:null }
        ]
      };
      const rows = collateSettingRows(category);
      const expected:SettingRow[] = [
        { type:SettingType.TEXT, id:'s1', label:'l', value:'x' },
        { type:SettingType.BOOLEAN_TOGGLE, id:'s2', label:'l', value:true },
        { type:HEADING_TYPE, description:'h1', precedeSettingId:null }
      ];
      expect(rows).toEqual(expected);
    });
  });

  describe('findDisabledSettings()', () => {
    it('returns empty array if no disablement rules defined', () => {
      const category:SettingCategory = {
        id:'id', name:'name', description:'d',
        settings: []
      };
      const disabledIds = findDisabledSettings(category);
      expect(disabledIds).toEqual([]);
    });

    it('throws if a rule specifies a criteria setting ID that does not exist in category', () => {
      const category:SettingCategory = {
        id:'id', name:'name', description:'d',
        settings: [
          { id:'s1', type:SettingType.TEXT, label:'l', value:'x' },
          { id:'s2', type:SettingType.BOOLEAN_TOGGLE, label:'l', value:true }
        ],
        disablementRules:[
          {targetSettingId:'s1', criteriaSettingId:'s3', criteriaValue:'x'}
        ]
      };
      expect(() => findDisabledSettings(category)).toThrow();
    });

    it('returns empty array if no rules specify criteria values contained by criteria settings in the category', () => {
      const category:SettingCategory = {
        id:'id', name:'name', description:'d',
        settings: [
          { id:'s1', type:SettingType.TEXT, label:'l', value:'x' },
          { id:'s2', type:SettingType.BOOLEAN_TOGGLE, label:'l', value:true }
        ],
        disablementRules:[
          {targetSettingId:'s1', criteriaSettingId:'s2', criteriaValue:false}
        ]
      };
      const disabledIds = findDisabledSettings(category);
      expect(disabledIds).toEqual([]);
    });

    it('returns ID of a target setting that will be disabled due to a rule', () => {
      const category:SettingCategory = {
        id:'id', name:'name', description:'d',
        settings: [
          { id:'s1', type:SettingType.TEXT, label:'l', value:'x' },
          { id:'s2', type:SettingType.BOOLEAN_TOGGLE, label:'l', value:true }
        ],
        disablementRules:[
          {targetSettingId:'s1', criteriaSettingId:'s2', criteriaValue:true}
        ]
      };
      const disabledIds = findDisabledSettings(category);
      expect(disabledIds).toEqual(['s1']);
    });

    it('returns multiple IDs of target settings that will be disabled due to rules', () => {
      const category:SettingCategory = {
        id:'id', name:'name', description:'d',
        settings: [
          { id:'s1', type:SettingType.TEXT, label:'l', value:'x' },
          { id:'s2', type:SettingType.BOOLEAN_TOGGLE, label:'l', value:true },
          { id:'s3', type:SettingType.NUMERIC, label:'l', value:5, minValue:0, maxValue:10 }
        ],
        disablementRules:[
          {targetSettingId:'s1', criteriaSettingId:'s2', criteriaValue:true},
          {targetSettingId:'s3', criteriaSettingId:'s1', criteriaValue:'x'}
        ]
      };
      const disabledIds = findDisabledSettings(category);
      expect(disabledIds).toEqual(['s1', 's3']);
    });
  });

  describe('isSettingsFormat()', () => {
    it('returns false if settings are undefined', () => {
      const result = isSettingsFormat(undefined);
      expect(result).toBe(false);
    });

    it('returns false if settings are null', () => {
      const result = isSettingsFormat(null);
      expect(result).toBe(false);
    });

    it('returns false if settings are a string', () => {
      const result = isSettingsFormat('not an array');
      expect(result).toBe(false);
    });

    it('returns false if setting is an object but not an array', () => {
      const result = isSettingsFormat({ id: 'test', type: SettingType.TEXT, label: 'Test' });
      expect(result).toBe(false);
    });

    it('returns true for an empty array of settings', () => {
      const result = isSettingsFormat([]);
      expect(result).toBe(true);
    });

    it('returns true for an array with all valid settings', () => {
      const settings = [
        { id: 's1', type: SettingType.TEXT, label: 'Text Setting', value: 'Some text' },
        { id: 's2', type: SettingType.BOOLEAN_TOGGLE, label: 'Boolean Setting', value: true },
        { id: 's3', type: SettingType.NUMERIC, label: 'Numeric Setting', value: 42, minValue: 0, maxValue: 100 }
      ];
      const result = isSettingsFormat(settings);
      expect(result).toBe(true);
    });

    it('returns false if a setting in the array is invalid', () => {
      const settings = [
        { id: 's1', type: SettingType.TEXT, label: 'Text Setting', value: 'Some text' },
        { id: 's2', type: 'INVALID_TYPE', label: 'Invalid Setting', value: 123 } // Invalid type
      ];
      const result = isSettingsFormat(settings);
      expect(result).toBe(false);
    });
  });
});