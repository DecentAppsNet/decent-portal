import Setting from "@/settings/types/Setting";
import { getText, setText } from "./pathStore";
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

export async function setCategorySettings(categoryName:string, settings:Setting[]):Promise<void> {
  const path = _categoryNameToPath(categoryName);
  const settingsJson = JSON.stringify(settings);
  await setText(path, settingsJson);
}