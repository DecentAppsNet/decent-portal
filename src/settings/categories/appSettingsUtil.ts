import { getCategorySettings } from "../../persistence/settings";
import Setting from "../../settings/types/Setting";
import { mergeSettingsIntoCategory } from "./settingCategoryUtil";
import { LoadAppSettingsCallback } from "../types/AppSettingsCallbacks";
import SettingCategory from "../types/SettingCategory";
import AppSettingCategory from "../types/AppSettingCategory";
import { windowLocationPathname } from "../../common/windowUtil";

export function getAppCategoryId(appName:string):string {
  const parts = windowLocationPathname().split('/').filter(part => part.length);
  if (!parts.length) return `app-${appName}`;
  return `app-${parts[0]}`;
}

function _appSettingCategoryToSettingCategory(appCategory:AppSettingCategory, appName:string):SettingCategory {
  return {
    name: 'This App',
    id: getAppCategoryId(appName),
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
export async function getAppSettings(appName:string):Promise<Setting[]|null> {
  const id = getAppCategoryId(appName);
  return await getCategorySettings(id);
}

export async function loadAppSettingCategory(defaultAppCategory:AppSettingCategory, appName:string, onLoadAppSettings?:LoadAppSettingsCallback):Promise<SettingCategory> {
  const category = _appSettingCategoryToSettingCategory(defaultAppCategory, appName);
  let appSettings = await getAppSettings(appName) ?? category.settings;
  if (onLoadAppSettings) {
    const overrideAppSettings = onLoadAppSettings(appSettings); // Allow caller to fix/upgrade settings or use their own loading mechanism.
    if (overrideAppSettings) appSettings = overrideAppSettings;
  }
  return mergeSettingsIntoCategory(category, appSettings);
}