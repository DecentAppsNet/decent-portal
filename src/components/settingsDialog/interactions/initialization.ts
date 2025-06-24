import SettingCategory from "@/settings/types/SettingCategory";
import { LoadAppSettingsCallback } from "../types/AppSettingsCallbacks";
import Setting from "@/settings/types/Setting";
import { getCategorySettings } from "@/persistence/settings";

function _getAppCategoryName() { // TODO refactor?
  const parts = window.location.pathname.split('/').filter(part => part.length);
  if (!parts.length) return `app-root`;
  return `app-${parts[0]}`;
}

function _findMatchingSettingIndex(settings:Setting[], settingId:string):number { // TODO refactor?
  for (let i = 0; i < settings.length; i++) {
    if (settings[i].id === settingId) return i;
  }
  return -1;
}

function _mergeAppCategory(defaultAppCategory:SettingCategory, loadedAppSettings:Setting[]|null):SettingCategory { // TODO refactor? Probably useful for other categories as well.
  if (!loadedAppSettings) return defaultAppCategory;

  loadedAppSettings.forEach(loadedSetting => {
    const defaultSettingIndex = _findMatchingSettingIndex(defaultAppCategory.settings, loadedSetting.id);
    if (defaultSettingIndex === -1) {
      defaultAppCategory.settings.push(loadedSetting);
    } else {
      defaultAppCategory.settings[defaultSettingIndex] = loadedSetting;
    }
  });
  
  return defaultAppCategory;
}

function _fakeLlmCategory():SettingCategory {
  return {
    name: "LLM",
    description: "Settings for the LLM (Large Language Model) integration.",
    settings: []
  }
}

function _fakeLoggingCategory():SettingCategory {
  return {
    name: "Logging",
    description: "Settings for logging.",
    settings: []
  }
}

export async function init(defaultAppCategory:SettingCategory, onLoadAppSettings?:LoadAppSettingsCallback):Promise<SettingCategory[]> {
  const loadedAppSettings = await getCategorySettings(_getAppCategoryName());
  const mergedAppCategory = _mergeAppCategory(defaultAppCategory, loadedAppSettings);
  if (onLoadAppSettings) {
    const updatedAppSettings = onLoadAppSettings(mergedAppCategory.settings);
    if (updatedAppSettings) mergedAppCategory.settings = updatedAppSettings;
  }

  return [mergedAppCategory, _fakeLlmCategory(), _fakeLoggingCategory()];
}