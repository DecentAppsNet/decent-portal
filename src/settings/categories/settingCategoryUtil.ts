import Setting, { duplicateSetting } from "@/settings/types/Setting";
import SettingCategory, { duplicateSettingCategory } from "@/settings/types/SettingCategory";
import SettingValues from "../types/SettingValues";

function _findMatchingSettingIndex(settings:Setting[], settingId:string):number {
  for (let i = 0; i < settings.length; i++) {
    if (settings[i].id === settingId) return i;
  }
  return -1;
}

export function mergeSettingValuesIntoSettings(settings:Setting[], settingValues:SettingValues):Setting[] {
  const nextSettings = settings.map(duplicateSetting);
  Object.keys(settingValues).forEach(settingId => {
    const defaultSettingIndex = _findMatchingSettingIndex(nextSettings, settingId);
    if (defaultSettingIndex !== -1) nextSettings[defaultSettingIndex].value = settingValues[settingId];
  });
  return nextSettings;
}

export function mergeSettingValuesIntoCategory(category:SettingCategory, settingValues:SettingValues):SettingCategory {
  const nextCategory = duplicateSettingCategory(category);
  nextCategory.settings = mergeSettingValuesIntoSettings(nextCategory.settings, settingValues);
  return nextCategory;
}

export function settingsToSettingValues(settings:Setting[]):SettingValues {
  const settingValues:SettingValues = {};
  settings.forEach(setting => {
    if (setting.id) {
      settingValues[setting.id] = setting.value;
    }
  });
  return settingValues;
}