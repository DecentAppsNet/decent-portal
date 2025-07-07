// Mocks first.

vi.mock("@/common/windowUtil", async () => ({
  ...(await vi.importActual("@/common/windowUtil")),
  windowLocationPathname: vi.fn(() => theWindowLocationPathname)
}));

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
import { vi, describe, expect, it, beforeEach } from "vitest";

let theWindowLocationPathname = "";
let theFakeStore: Record<string, any> = {};

import { getAppCategoryId, loadAppSettingCategory } from "../appSettingsUtil";
import AppSettingCategory from "@/settings/types/AppSettingCategory";
import SettingType from "@/settings/types/SettingType";
import Setting from "@/settings/types/Setting";

describe("appSettingsUtil", () => {
  beforeEach(() => {
    theWindowLocationPathname = "";
    theFakeStore = {};
  });

  describe("getAppCategoryId()", () => {
    it("returns 'app-root' for root pathname", () => {
      theWindowLocationPathname = "/";
      expect(getAppCategoryId()).toBe("app-root");
    });

    it("returns 'app-root' for empty pathname", () => {
      theWindowLocationPathname = "";
      expect(getAppCategoryId()).toBe("app-root");
    });

    it("returns correct name for a path with an app part in it", () => {
      theWindowLocationPathname = "/dog";
      expect(getAppCategoryId()).toBe("app-dog");
    });

    it("returns correct name for app part followed by trailing /'", () => {
      theWindowLocationPathname = "/dog/";
      expect(getAppCategoryId()).toBe("app-dog");
    });

    it("returns correct name for app part followed by more stuff'", () => {
      theWindowLocationPathname = "/dog/index.html";
      expect(getAppCategoryId()).toBe("app-dog");
    });
  });

  describe('loadAppSettingCategory()', () => {
    it('returns default settings when no settings are in store', async () => {
      const defaultAppSettings:AppSettingCategory = {
        description: "default",
        settings:[
          { id:"s1", type:SettingType.TEXT, label:"l", value:"x" },
          { id:"s2", type:SettingType.BOOLEAN_TOGGLE, label:"l", value: true }
        ]
      }
      const category = await loadAppSettingCategory(defaultAppSettings);
      expect(category.name).toBe("This App");
      expect(category.id).toBe("app-root");
      expect(category.description).toBe("default");
      expect(category.settings.length).toBe(2);
      expect(category.settings[0].id).toBe("s1");
      expect(category.settings[1].id).toBe("s2");
    });

    it('returns settings from store when they exist', async () => {
      theFakeStore["/settings/app-root.json"] = JSON.stringify([
        { id:"s1", type:SettingType.TEXT, label:"l", value:"x" },
        { id:"s2", type:SettingType.BOOLEAN_TOGGLE, label:"l", value: true }
      ]);
      const defaultAppSettings:AppSettingCategory = {
        description: "default",
        settings:[
          { id:"s1", type:SettingType.TEXT, label:"l", value:"y"},
          { id:"s2", type:SettingType.BOOLEAN_TOGGLE, label:"l", value:false }
        ]
      }
      const category = await loadAppSettingCategory(defaultAppSettings);
      expect(category.name).toBe("This App");
      expect(category.id).toBe("app-root");
      expect(category.description).toBe("default");
      expect(category.settings.length).toBe(2);
      expect(category.settings[0].value).toBe("x");
      expect(category.settings[1].value).toBe(true);
    });

    it('returns settings as-is if onLoadAppSettings() returns null', async () => {
      function _onLoadAppSettings(_settings:Setting[]|null):Setting[]|null {
        return null;
      }
      const defaultAppSettings:AppSettingCategory = {
        description: "default",
        settings:[
          { id:"s1", type:SettingType.TEXT, label:"l", value:"y"},
          { id:"s2", type:SettingType.BOOLEAN_TOGGLE, label:"l", value:false }
        ]
      };
      const category = await loadAppSettingCategory(defaultAppSettings, _onLoadAppSettings);
      expect(category.settings.length).toBe(2);
      expect(category.settings[0].id).toBe("s1");
      expect(category.settings[1].id).toBe("s2");
    });

    it('merges settings if onLoadAppSettings() returns settings', async () => {
      function _onLoadAppSettings(_settings:Setting[]|null):Setting[]|null {
        return [
          { id:"s2", type:SettingType.BOOLEAN_TOGGLE, label:"l", value:true },
          { id:"s3", type:SettingType.TEXT, label:"l", value:"y"}
        ];
      }
      const defaultAppSettings:AppSettingCategory = {
        description: "default",
        settings:[
          { id:"s1", type:SettingType.TEXT, label:"l", value:"y"},
          { id:"s2", type:SettingType.BOOLEAN_TOGGLE, label:"l", value:false }
        ]
      };
      const category = await loadAppSettingCategory(defaultAppSettings, _onLoadAppSettings);
      expect(category.settings.length).toBe(3);
      expect(category.settings[0].id).toBe("s1");
      expect(category.settings[1].id).toBe("s2");
      expect(category.settings[1].value).toBe(true);
      expect(category.settings[2].id).toBe("s3");
    });
  });
});