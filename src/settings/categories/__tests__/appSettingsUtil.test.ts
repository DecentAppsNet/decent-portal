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

vi.mock("@/appMetaData/fetchAppMetaData", async () => ({
  ...(await vi.importActual("@/appMetaData/fetchAppMetaData")),
  fetchAppMetadataText: vi.fn(() => Promise.resolve(theAppMetaDataText))
}));

// Imports after mocks.
import { vi, describe, expect, it, beforeEach } from "vitest";

let theWindowLocationPathname = "";
let theFakeStore: Record<string, any> = {};
let theAppMetaDataText = '{"id":"root","name":"n","description":"d","supportedModels":[]}';

import { APP_SETTINGS_LLM_ID, getAppCategoryId, loadAppSettingCategory } from "../appSettingsUtil";
import AppSettingCategory from "@/settings/types/AppSettingCategory";
import SettingType from "@/settings/types/SettingType";
import Heading from "@/settings/types/Heading";
import SettingValues from "@/settings/types/SettingValues";

describe("appSettingsUtil", () => {
  beforeEach(() => {
    theWindowLocationPathname = "";
    theFakeStore = {};
  });

  describe("getAppCategoryId()", () => {
    it("returns ID based on appName for root pathname", () => {
      theWindowLocationPathname = "/";
      expect(getAppCategoryId('root')).toBe("app-root");
    });

    it("returns ID based on appName for empty pathname", () => {
      theWindowLocationPathname = "";
      expect(getAppCategoryId('root')).toBe("app-root");
    });

    it("returns correct name for a path with an app part in it", () => {
      theWindowLocationPathname = "/dog";
      expect(getAppCategoryId('wrong')).toBe("app-dog");
    });

    it("returns correct name for app part followed by trailing /'", () => {
      theWindowLocationPathname = "/dog/";
      expect(getAppCategoryId('wrong')).toBe("app-dog");
    });

    it("returns correct name for app part followed by more stuff'", () => {
      theWindowLocationPathname = "/dog/index.html";
      expect(getAppCategoryId('wrong')).toBe("app-dog");
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
      expect(category.settings.length).toBe(3);
      expect(category.settings[1].id).toBe("s1");
      expect(category.settings[2].id).toBe("s2");
    });

    it('adds LLM setting and heading if not found in category', async () => {
      const defaultAppSettings:AppSettingCategory = {
        description: "default",
        settings:[]
      }
      const category = await loadAppSettingCategory(defaultAppSettings);
      expect(category.settings.length).toBe(1);
      expect(category.settings[0].id).toBe(APP_SETTINGS_LLM_ID);
      expect(category.headings).toBeDefined();
      const headings = category.headings as Heading[];
      expect(headings.length === 1);
      expect(headings[0].precedeSettingId).toEqual(APP_SETTINGS_LLM_ID);
    });

    it('does not overwrite existing LLM setting and heading', async () => {
      const defaultAppSettings:AppSettingCategory = {
        description: "default",
        settings:[
          {id:APP_SETTINGS_LLM_ID, label:'test', value:'v', type:SettingType.SUPPORTED_MODEL, models:[]}
        ],
        headings:[
          {precedeSettingId:APP_SETTINGS_LLM_ID, description:'test'}
        ]
      }
      const category = await loadAppSettingCategory(defaultAppSettings);
      expect(category.settings.length).toBe(1);
      expect(category.settings[0].id).toBe(APP_SETTINGS_LLM_ID);
      expect(category.settings[0].label).toEqual('test');
      expect(category.headings).toBeDefined();
      const headings = category.headings as Heading[];
      expect(headings.length === 1);
      expect(headings[0].precedeSettingId).toEqual(APP_SETTINGS_LLM_ID);
      expect(headings[0].description).toEqual('test');
    });

    it('returns settings from store when they exist', async () => {
      theFakeStore["/settings/app-root.json"] = JSON.stringify({s1:"x",s2:true});
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
      expect(category.settings.length).toBe(3);
      expect(category.settings[1].value).toBe("x");
      expect(category.settings[2].value).toBe(true);
    });

    it('returns settings as-is if onLoadAppSettings() returns null', async () => {
      function _onLoadAppSettings(_settings:SettingValues|null):SettingValues|null {
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
      expect(category.settings.length).toBe(3);
      expect(category.settings[1].id).toBe("s1");
      expect(category.settings[2].id).toBe("s2");
    });

    it('merges settings if onLoadAppSettings() returns settings', async () => {
      function _onLoadAppSettings(_settings:SettingValues|null):SettingValues|null {
        return { s2:true };
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
      expect(category.settings[1].id).toBe("s1");
      expect(category.settings[2].id).toBe("s2");
      expect(category.settings[2].value).toBe(true);
    });

    it('does not create a settings for a value with no category settings', async () => {
      function _onLoadAppSettings(_settings:SettingValues|null):SettingValues|null {
        return { s3:"y" };
      }
      const defaultAppSettings:AppSettingCategory = {
        description: "default",
        settings:[]
      };
      const category = await loadAppSettingCategory(defaultAppSettings, _onLoadAppSettings);
      expect(category.settings.length).toBe(1);
      expect(category.settings[0].id).not.toBe("s3");
    });
  });
});