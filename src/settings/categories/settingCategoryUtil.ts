import Setting from "@/settings/types/Setting";
import SettingCategory, { duplicateSettingCategory } from "@/settings/types/SettingCategory";

function _findMatchingSettingIndex(settings:Setting[], settingId:string):number {
  for (let i = 0; i < settings.length; i++) {
    if (settings[i].id === settingId) return i;
  }
  return -1;
}

export function mergeSettingsIntoCategory(category:SettingCategory, settings:Setting[]|null):SettingCategory {
  const nextCategory = duplicateSettingCategory(category);
  if (!settings) return nextCategory;

  settings.forEach(setting => {
    const defaultSettingIndex = _findMatchingSettingIndex(nextCategory.settings, setting.id);
    if (defaultSettingIndex === -1) {
      nextCategory.settings.push(setting);
    } else {
      nextCategory.settings[defaultSettingIndex] = setting;
    }
  });
  return nextCategory;
}