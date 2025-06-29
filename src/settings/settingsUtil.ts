import SettingRow from "@/settings/types/SettingRow";
import Heading, { HEADING_TYPE } from "./types/Heading";
import SettingCategory from "./types/SettingCategory";
import { LoadAppSettingsCallback, SaveAppSettingsCallback } from "./types/AppSettingsCallbacks";
import { getAppCategoryStorageName, loadAppSettingCategory } from "./categories/appSettingsUtil";
import { loadLlmSettingCategory } from "./categories/llmSettingsUtil";
import { loadLoggingSettingCategory } from "./categories/loggingSettingsUtil";
import { isSettingFormat } from "./types/Setting";
import { setCategorySettings } from "@/persistence/settings";
import AppSettingCategory from "./types/AppSettingCategory";

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
    if (!criteriaSetting) { console.error(`Disablement rule for setting ${rule.targetSettingId} references non-existent criteria setting ${rule.criteriaSettingId}`); return; }
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

export async function loadSettingCategories(defaultAppCategory:AppSettingCategory, onLoadAppSettings?:LoadAppSettingsCallback):Promise<SettingCategory[]> {
  const appCategory = await loadAppSettingCategory(defaultAppCategory, onLoadAppSettings);
  const llmCategory = await loadLlmSettingCategory();
  const loggingCategory = await loadLoggingSettingCategory();
  return [appCategory, llmCategory, loggingCategory];
}

export async function saveSettingCategories(categories:SettingCategory[], onSaveAppSettings?:SaveAppSettingsCallback):Promise<void> {
  const appCategoryStorageName = getAppCategoryStorageName();
  const promises = categories.map(category => {
    let settings = category.settings;
    if (category.storageName === appCategoryStorageName) {
      if (onSaveAppSettings) {
        const overrideAppSettings = onSaveAppSettings(settings);
        if (overrideAppSettings) settings = overrideAppSettings;
      }
    }
    return setCategorySettings(category.storageName, settings);
  });
  try {
    await Promise.all(promises);
  } catch (error) {
    console.error("Error saving settings:", error);
    throw new Error("Failed to save settings. Please try again later.");
  }
}
