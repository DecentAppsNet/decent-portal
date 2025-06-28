import Setting from "@/settings/types/Setting";
import { getText } from "./pathStore";
import { isSettingsFormat } from "@/settings/settingsUtil";

function _categoryNameToPath(categoryName:string) {
  return `/settings/${categoryName}.json`;
}

export async function getCategorySettings(categoryName:string):Promise<Setting[]|null> {
   const path = _categoryNameToPath(categoryName);
   const settingsJson = await getText(path);
   if (!settingsJson) return null;
   const settings:Setting[] = JSON.parse(settingsJson);
   if (!isSettingsFormat(settings)) {
     console.error(`Settings for category "${categoryName}" are invalid.`);
     return null;
   }
   return settings.length ? settings : null;
}

export async function saveCategorySettings(_categoryName:string, _settings:Setting[]):Promise<void> {
}