// Mocks first before importing modules that may use them.

vi.mock("@/settings/categories/appSettingsUtil", async () => ({
  ...(await vi.importActual("@/settings/categories/appSettingsUtil")),
  loadAppSettingCategory: vi.fn(async () => Promise.resolve(FAKE_APP_SETTING_CATEGORY)),
  getAppCategoryId: vi.fn(() => 'app-root')
}));

vi.mock("@/persistence/pathStore", async () => ({
  ...(await vi.importActual("@/persistence/pathStore")),
  getText: vi.fn(async (key:string) => Promise.resolve(theFakeStore[key] ?? null)),
  setText: vi.fn(async (key:string, value:string) => {
    if (theFakeStoreSetTextShouldThrow) { throw new Error(`setText() failed`); }
    theFakeStore[key] = value;
    return Promise.resolve();
  })
}));

// Imports after mocks.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadSettingCategories, saveSettingCategories } from '../settingsUtil';
import SettingCategory from '../types/SettingCategory';
import { LLM_CATEGORY_ID } from '../categories/llmSettingsUtil';
import { LOGGING_CATEGORY_ID } from '../categories/loggingSettingsUtil';
import SettingType from '../types/SettingType';

const FAKE_APP_SETTING_CATEGORY:SettingCategory = {
  id:'app-root',
  name:'This App',
  description:'d',
  settings:[]
};

let theFakeStore:Record<string, any> = {};
let theFakeStoreSetTextShouldThrow = false;

function _idToKey(id:string):string {
  return `/settings/${id}.json`;
}

describe('settingsUtil_store', () => {
  describe('loadSettingCategories()', () => {
    beforeEach(() => {
      theFakeStore = {};
    });

    it('loads categories', async () => {
      const defaultAppCategory = { description:'d', settings:[] };
      const categories = await loadSettingCategories(defaultAppCategory, 'root');
      expect(categories.length > 0);
    });
  });

  describe('saveSettingCategories()', () => {
    it('saves categories', async () => {
      const appCategory = { ...FAKE_APP_SETTING_CATEGORY };
      const llmCategory = { id:LLM_CATEGORY_ID, name:'llm', description:'d', settings:[] };
      const loggingCategory = { id:LOGGING_CATEGORY_ID, name:'logging', description:'d', settings:[] };
      const categories:SettingCategory[] = [appCategory, llmCategory, loggingCategory];
      await saveSettingCategories(categories, 'root');
      expect(theFakeStore[_idToKey(appCategory.id)]).toBeDefined();
      expect(theFakeStore[_idToKey(llmCategory.id)]).toBeDefined();
      expect(theFakeStore[_idToKey(loggingCategory.id)]).toBeDefined();
    });

    it('if no onSaveAppSettings callback, settings are saved as is', async () => {
      const appCategory:SettingCategory = { 
        ...FAKE_APP_SETTING_CATEGORY, 
        settings:[{ id:'s1', type:SettingType.TEXT, label:'Test Setting', value:'test' }] 
      };
      const categories:SettingCategory[] = [appCategory];
      await saveSettingCategories(categories, 'root');
      const savedSettings = JSON.parse(theFakeStore[_idToKey(appCategory.id)]);
      expect(savedSettings.s1).toBe('test');
    });

    it('if onSaveAppSettings() returns null, settings are saved as is', async () => {
      const appCategory:SettingCategory = { 
        ...FAKE_APP_SETTING_CATEGORY, 
        settings:[{ id:'s1', type:SettingType.TEXT, label:'Test Setting', value:'test' }] 
      };
      const categories:SettingCategory[] = [appCategory];
      await saveSettingCategories(categories, 'root', () => null);
      const savedSettings = JSON.parse(theFakeStore[_idToKey(appCategory.id)]);
      expect(savedSettings.s1).toBe('test');
    });

    it('if onSaveAppSettings() returns modified settings, those are saved', async () => {
      const appCategory:SettingCategory = { 
        ...FAKE_APP_SETTING_CATEGORY, 
        settings:[{ id:'s1', type:SettingType.TEXT, label:'Test Setting', value:'test' }] 
      };
      const categories:SettingCategory[] = [appCategory];
      await saveSettingCategories(categories, 'root', (settings) => {
        settings.s1 = 'modified';
        return settings;
      });
      const savedSettings = JSON.parse(theFakeStore[_idToKey(appCategory.id)]);
      expect(savedSettings.s1).toBe('modified');
    });

    it('if onSaveAppSettings() throws, so does saveSettingsCategories()', async () => {
      const appCategory:SettingCategory = { 
        ...FAKE_APP_SETTING_CATEGORY, 
        settings:[{ id:'s1', type:SettingType.TEXT, label:'Test Setting', value:'test' }] 
      };
      const categories:SettingCategory[] = [appCategory];
      const _onSaveAppSettings = () => { throw new Error('Test error'); };
      await expect(
        saveSettingCategories(categories, 'root', _onSaveAppSettings)
      ).rejects.toThrow('Test error');
    });

    it('if setCategorySettings() throws, so does saveSettingsCategories()', async () => {
      theFakeStoreSetTextShouldThrow = true;
      const appCategory:SettingCategory = { 
        ...FAKE_APP_SETTING_CATEGORY, 
        settings:[{ id:'s1', type:SettingType.TEXT, label:'Test Setting', value:'test' }] 
      };
      const categories:SettingCategory[] = [appCategory];
      const originalError = console.error; // Suppress console.error for this test so output is clean.
      console.error = vi.fn();
      await expect(
        saveSettingCategories(categories, 'root')
      ).rejects.toThrow();
      console.error = originalError;
      theFakeStoreSetTextShouldThrow = false;
    });
  });
});