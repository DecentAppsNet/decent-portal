import { describe, it, expect } from "vitest";
import SettingCategory, { duplicateSettingCategory } from "../SettingCategory";
import SettingType from "../SettingType";

describe('SettingCategory', () => {
  describe('duplicateSettingCategory()', () => {
    it('duplicates a minimal setting category', () => {
      const original:SettingCategory = {
        id: 'test-category',
        name: 'Test Category',
        description: 'This is a test category.',
        settings: []
      };
      const duplicate = duplicateSettingCategory(original);
      expect(duplicate).toEqual(original);
    });

    it('duplicates a maximal setting category', () => {
      const original:SettingCategory = {
        id: 'test-category',
        name: 'Test Category',
        description: 'This is a test category.',
        settings: [
          { id:'setting1', type:SettingType.TEXT, label:'Setting 1', value:'Value 1' },
          { id:'setting2', type:SettingType.BOOLEAN_TOGGLE, label:'Setting 2', value:true }
        ],
        headings: [
          { description:'Heading 1', precedeSettingId:'setting1' },
          { description:'Heading 2', precedeSettingId:null, buttons:[{label:'Button 1', value:'btn1'}] }
        ],
        disablementRules: [
          { targetSettingId:'setting2', criteriaSettingId:'setting1', criteriaValue:'Value 1' }
        ]
      };
      const duplicate = duplicateSettingCategory(original);
      expect(duplicate).toEqual(original);
    });
  });
});