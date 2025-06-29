import { saveSettingCategories } from "@/settings/settingsUtil";
import { SaveAppSettingsCallback } from "@/settings/types/AppSettingsCallbacks";
import SettingCategory from "@/settings/types/SettingCategory";

export async function saveAndClose(categories:SettingCategory[], onClose:Function, onSaveAppSettings?:SaveAppSettingsCallback): Promise<void> {
  await saveSettingCategories(categories, onSaveAppSettings);
  onClose(categories[0].settings);
}