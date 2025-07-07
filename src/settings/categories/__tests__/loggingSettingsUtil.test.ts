// Mocks first.

vi.mock("@/persistence/pathStore", async () => ({
  ...(await vi.importActual("@/persistence/pathStore")),
  getText: vi.fn(async (key:string) => Promise.resolve(theFakeStore[key] ?? null)),
  setText: vi.fn(async (key:string, value:string) => {
    theFakeStore[key] = value;
    return Promise.resolve();
  }),
  getAllKeysAtPath: vi.fn(async (_path:string) => Promise.resolve(Object.keys(theFakeStore))),
  deleteByKey: vi.fn(async (key:string) => {
    delete theFakeStore[key];
    return Promise.resolve();
  })
}));

// Imports after mocks.
import { describe, expect, it, vi, beforeEach } from "vitest";
import { LOGGING_CATEGORY_ID, getLoggingSettings, loadLoggingSettingCategory } from "../loggingSettingsUtil";
import SettingType from "@/settings/types/SettingType";

let theFakeStore: Record<string, any> = {};

describe(('loggingSettingsUtil'), () => {
  beforeEach(() => {
    theFakeStore = {};
  });

  describe('loadLoggingSettingCategory()', () => {
    it('returns default settings when no settings are stored', async () => {
      const category = await loadLoggingSettingCategory();
      expect(category.id).toBe(LOGGING_CATEGORY_ID);
      expect(category.name).toBe("Logging");
      expect(category.settings.length > 0).toBe(true);
    });

    it('returns stored settings when they exist', async () => {
      theFakeStore[`/settings/${LOGGING_CATEGORY_ID}.json`] = JSON.stringify([
        { type:SettingType.BOOLEAN_TOGGLE, id: "enableLogging", label: "Logging enabled?", value:false },
        { type:SettingType.NUMERIC, id: "maxRetentionDays", label: "Max days to keep", value: 14, minValue: 1, maxValue: 1000, allowDecimals: false }
      ]);
      const category = await loadLoggingSettingCategory();
      expect(category.settings[0].value).toBe(false);
      expect(category.settings[1].value).toBe(14);
    });
  });

  describe('getLoggingSettings()', () => {
    it('returns default settings when no settings are stored', async () => {
      const settings = await getLoggingSettings();
      expect(settings.length > 0).toBe(true);
    });

    it('returns stored settings when they exist', async () => {
      theFakeStore[`/settings/${LOGGING_CATEGORY_ID}.json`] = JSON.stringify([
        { type:SettingType.BOOLEAN_TOGGLE, id: "enableLogging", label: "Logging enabled?", value:false },
        { type:SettingType.NUMERIC, id: "maxRetentionDays", label: "Max days to keep", value: 14, minValue: 1, maxValue: 1000, allowDecimals: false }
      ]);
      const settings = await getLoggingSettings();
      expect(settings[0].value).toBe(false);
      expect(settings[1].value).toBe(14);
    });
  });
});