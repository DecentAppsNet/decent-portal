import SettingValues, { isSettingValuesFormat } from "@/settings/types/SettingValues";
import { getText, setText } from "./pathStore";

function _categoryNameToPath(categoryName:string) {
  return `/settings/${categoryName}.json`;
}

export async function getCategorySettings(categoryName:string):Promise<SettingValues|null> {
   const path = _categoryNameToPath(categoryName);
   const settingsJson = await getText(path);
   if (!settingsJson) return null;
   const settings:SettingValues = JSON.parse(settingsJson);
   if (!isSettingValuesFormat(settings)) {
     console.error(`Settings for category "${categoryName}" are invalid.`);
     return null;
   }
   return Object.keys(settings).length > 0 ? settings : null;
}

export async function setCategorySettings(categoryName:string, settingValues:SettingValues):Promise<void> {
  const path = _categoryNameToPath(categoryName);
  const settingsJson = JSON.stringify(settingValues);
  await setText(path, settingsJson);
}