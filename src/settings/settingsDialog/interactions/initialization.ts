import SettingCategory from "@/settings/types/SettingCategory";
import { LoadAppSettingsCallback } from "@/settings/types/AppSettingsCallbacks";
import { loadSettingCategories } from "@/settings/settingsUtil";
import AppSettingCategory from "@/settings/types/AppSettingCategory";

export async function init(defaultAppCategory:AppSettingCategory, appName:string, onLoadAppSettings?:LoadAppSettingsCallback):Promise<SettingCategory[]> {
  return await loadSettingCategories(defaultAppCategory, appName, onLoadAppSettings);
}