import SettingRow from "@/settings/types/SettingRow";
import Heading, { HEADING_TYPE } from "./types/Heading";
import SettingCategory from "./types/SettingCategory";
import { LoadAppSettingsCallback, SaveAppSettingsCallback } from "./types/AppSettingsCallbacks";
import { getAppCategoryId, loadAppSettingCategory } from "@/settings/categories/appSettingsUtil";
import { applyLlmSettings, LLM_CATEGORY_ID, loadLlmSettingCategory } from "./categories/llmSettingsUtil";
import { loadLoggingSettingCategory, LOGGING_CATEGORY_ID } from "./categories/loggingSettingsUtil";
import Setting, { isSettingFormat } from "./types/Setting";
import { setCategorySettings } from "@/persistence/settings";
import AppSettingCategory from "./types/AppSettingCategory";
import { applyLoggingSettings } from "@/localLogging/logUtil";
import { openSettingsDialog } from "@/components/decentBar/interactions/opening";
import { mergeSettingValuesIntoSettings } from "./categories/settingCategoryUtil";

export function collateSettingRows(category:SettingCategory):SettingRow[] {
  const rows:SettingRow[] = [];
  const headings:Heading[] = category.headings ?? [];
  category.settings.forEach(setting => {
    let precedingHeading = headings.find(heading => heading.precedeSettingId === setting.id);
    if (precedingHeading) rows.push({type:HEADING_TYPE, ...precedingHeading});
    rows.push(setting);
  });

  const lastHeading = headings.find(heading => heading.precedeSettingId === null);
  if (lastHeading) rows.push({type:HEADING_TYPE, ...lastHeading});

  return rows;
}

export function findDisabledSettings(category:SettingCategory):string[] {
  if (!category.disablementRules) return [];
  const disabledSettings:string[] = [];
  category.disablementRules.forEach(rule => {
    const criteriaSetting = category.settings.find(s => s.id === rule.criteriaSettingId);
    if (!criteriaSetting) throw new Error(`Disablement rule for setting ${rule.targetSettingId} references non-existent criteria setting ${rule.criteriaSettingId}`);
    const criteriaValue:any = (criteriaSetting as any).value;
    if (criteriaValue === rule.criteriaValue) disabledSettings.push(rule.targetSettingId);
  });
  return disabledSettings;
}

export function isSettingsFormat(maybeSettings:any):boolean {
  if (!maybeSettings || typeof maybeSettings !== 'object') return false;
  if (!Array.isArray(maybeSettings)) return false;
  const settingsArray:any[] = maybeSettings;
  return settingsArray.every(setting => isSettingFormat(setting));
}

export async function loadSettingCategories(defaultAppCategory:AppSettingCategory, appName:string, onLoadAppSettings?:LoadAppSettingsCallback):Promise<SettingCategory[]> {
  const appCategory = await loadAppSettingCategory(defaultAppCategory, appName, onLoadAppSettings);
  const llmCategory = await loadLlmSettingCategory();
  const loggingCategory = await loadLoggingSettingCategory();
  return [appCategory, llmCategory, loggingCategory];
}

export async function saveSettingCategories(categories:SettingCategory[], appName:string, onSaveAppSettings?:SaveAppSettingsCallback):Promise<void> {
  const appCategoryId = getAppCategoryId(appName);
  const promises = categories.map(category => {
    let settings = category.settings;
    switch (category.id) {
      case appCategoryId:
        if (onSaveAppSettings) {
          const overrideAppSettings = onSaveAppSettings(settings);
          if (overrideAppSettings) settings = mergeSettingValuesIntoSettings(settings, overrideAppSettings);
        }
      break;

      case LOGGING_CATEGORY_ID:
        applyLoggingSettings(settings);
      break;

      case LLM_CATEGORY_ID:
        applyLlmSettings(settings);
      break;
    }
    return setCategorySettings(category.id, settings);
  });
  try {
    await Promise.all(promises);
  } catch (error) {
    console.error("Error saving settings:", error);
    throw new Error("Failed to save settings. Please try again later.");
  }
}

export function settingValue(settingId:string, settings?:Setting[]|null):number|string|boolean|null {
  if (!settings) return null;
  const setting = settings.find(s => s.id === settingId);
  return !setting ? null : setting.value;
}

export function openSettings(categoryId?:string) {
  openSettingsDialog(categoryId);
}