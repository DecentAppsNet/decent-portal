import SettingRow from "@/settings/types/SettingRow";
import { isBooleanToggleSettingFormat } from "./types/BooleanToggleSetting";
import Heading, { HEADING_TYPE } from "./types/Heading";
import { isNumericSettingFormat } from "./types/NumericSetting";
import { isSettingBaseFormat } from "./types/SettingBase";
import SettingCategory from "./types/SettingCategory";
import SettingType from "./types/SettingType";
import { isTextSettingFormat } from "./types/TextSetting";

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

function _isSettingFormat(maybeSetting:any):boolean {
  if (!isSettingBaseFormat(maybeSetting)) return false;
  if (maybeSetting.type === SettingType.NUMERIC) return isNumericSettingFormat(maybeSetting);
  if (maybeSetting.type === SettingType.BOOLEAN_TOGGLE) return isBooleanToggleSettingFormat(maybeSetting);
  if (maybeSetting.type === SettingType.TEXT) return isTextSettingFormat(maybeSetting);
  return false;
}

export function isSettingsFormat(maybeSettings:any):boolean {
  if (!maybeSettings || typeof maybeSettings !== 'object') return false;
  if (!Array.isArray(maybeSettings.settings)) return false;
  const settingsArray:any[] = maybeSettings;
  return settingsArray.every(setting => _isSettingFormat(setting));
}