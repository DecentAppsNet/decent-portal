import { getCategorySettings } from "@/persistence/settings";
import Setting from "@/settings/types/Setting";
import { mergeSettingsIntoCategory } from "./settingCategoryUtil";
import { LoadAppSettingsCallback } from "../types/AppSettingsCallbacks";
import SettingCategory from "../types/SettingCategory";
import AppSettingCategory from "../types/AppSettingCategory";

export function getAppCategoryId() {
  const parts = window.location.pathname.split('/').filter(part => part.length);
  if (!parts.length) return `app-root`;
  return `app-${parts[0]}`;
}

function _appSettingCategoryToSettingCategory(appCategory:AppSettingCategory):SettingCategory {
  return {
    name: 'This App',
    id: getAppCategoryId(),
    description: appCategory.description,
    headings: appCategory.headings,
    settings: appCategory.settings,
    disablementRules: appCategory.disablementRules
  }
}

/**
 * Retrieves application settings.
 * @returns {Setting[]} An array of settings.
 */
export async function getAppSettings():Promise<Setting[]|null> {
  const id = getAppCategoryId();
  return await getCategorySettings(id);
}

export async function loadAppSettingCategory(defaultAppCategory:AppSettingCategory, onLoadAppSettings?:LoadAppSettingsCallback):Promise<SettingCategory> {
  const category = _appSettingCategoryToSettingCategory(defaultAppCategory);
  let appSettings = await getAppSettings() ?? category.settings;
  if (onLoadAppSettings) {
    const overrideAppSettings = onLoadAppSettings(appSettings); // Allow caller to fix/upgrade settings or use their own loading mechanism.
    if (overrideAppSettings) appSettings = overrideAppSettings;
  }
  return mergeSettingsIntoCategory(category, appSettings);
}