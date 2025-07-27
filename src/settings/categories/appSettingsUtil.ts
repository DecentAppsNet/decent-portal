import { getCategorySettings } from "../../persistence/settings";
import Setting from "../../settings/types/Setting";
import { mergeSettingValuesIntoCategory } from "./settingCategoryUtil";
import { LoadAppSettingsCallback } from "../types/AppSettingsCallbacks";
import SettingCategory from "../types/SettingCategory";
import AppSettingCategory from "../types/AppSettingCategory";
import { windowLocationPathname } from "../../common/windowUtil";
import SettingType from "../types/SettingType";
import { AUTO_SELECT_ID } from "../settingsDialog/setters/interactions/models";
import { getAppMetaData } from "@/appMetadata/appMetadataUtil";
import Heading from "../types/Heading";
import SettingValues from "../types/SettingValues";

// Without the app name appended, this category ID can only be used for operations that need to do 
// something specifying the app category, but not a specific app. For example, saving settings to persistent 
// storage needs the app name appended, but opening the dialog with app settings category selected does not.
export const APP_CATEGORY_ID = 'app-';
export const APP_SETTINGS_LLM_ID = 'llm';

export function getAppCategoryId(appName:string):string {
  const parts = windowLocationPathname().split('/').filter(part => part.length);
  if (!parts.length) return `${APP_CATEGORY_ID}${appName}`;
  return `${APP_CATEGORY_ID}${parts[0]}`;
}

async function _addAppLlmSettingIfMissing(settings:Setting[]) {
  if (settings.some(s => s.id === APP_SETTINGS_LLM_ID)) return;
  const appMetaData = await getAppMetaData();
  settings.unshift({
    id: APP_SETTINGS_LLM_ID,
    type: SettingType.SUPPORTED_MODEL,
    label: 'LLM to use',
    value: AUTO_SELECT_ID,
    models: appMetaData.supportedModels
  });
}

function _addAppLlmHeadingIfMissing(headings:Heading[]) {
  if (headings.some(h => h.precedeSettingId === APP_SETTINGS_LLM_ID)) return;
  headings.unshift({
    id: 'LLM',
    description: 'LLM Settings Specific to This App',
    precedeSettingId: APP_SETTINGS_LLM_ID
  });
}

async function _appSettingCategoryToSettingCategory(appCategory:AppSettingCategory, appName:string):Promise<SettingCategory> {
  const settings = [...appCategory.settings];
  await _addAppLlmSettingIfMissing(settings);
  const headings = appCategory.headings ? [...appCategory.headings] : []
  _addAppLlmHeadingIfMissing(headings);
  return {
    name: 'This App',
    id: getAppCategoryId(appName),
    description: appCategory.description,
    headings,
    settings,
    disablementRules: appCategory.disablementRules
  }
}

/**
 * Retrieves application settings.
 * @returns {SettingValues} Associative array of settings.
 */
export async function getAppSettings(appName:string):Promise<SettingValues|null> {
  const id = getAppCategoryId(appName);
  return await getCategorySettings(id);
}

export async function loadAppSettingCategory(defaultAppCategory:AppSettingCategory, appName:string, onLoadAppSettings?:LoadAppSettingsCallback):Promise<SettingCategory> {
  const category = await _appSettingCategoryToSettingCategory(defaultAppCategory, appName);
  let appSettings = await getAppSettings(appName) ?? category.settings;
  if (onLoadAppSettings) {
    const overrideAppSettings = onLoadAppSettings(appSettings); // Allow caller to fix/upgrade settings or use their own loading mechanism.
    if (overrideAppSettings) appSettings = overrideAppSettings;
  }
  return mergeSettingValuesIntoCategory(category, appSettings);
}