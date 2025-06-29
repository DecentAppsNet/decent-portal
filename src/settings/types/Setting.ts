import BooleanToggleSetting, { duplicateBooleanToggleSetting, isBooleanToggleSettingFormat } from "./BooleanToggleSetting";
import NumericSetting, { duplicateNumericSetting, isNumericSettingFormat } from "./NumericSetting";
import { isSettingBaseFormat } from "./SettingBase";
import SettingType from "./SettingType";
import TextSetting, { duplicateTextSetting, isTextSettingFormat } from "./TextSetting";

// Don't add any types that aren't intended to persist setting data. Presentation-only types can be added to SettingCategory type instead.
type Setting = 
  BooleanToggleSetting |
  NumericSetting | 
  TextSetting;

export function isSettingFormat(maybeSetting:any):boolean {
  if (!isSettingBaseFormat(maybeSetting)) return false;
  if (maybeSetting.type === SettingType.NUMERIC) return isNumericSettingFormat(maybeSetting);
  if (maybeSetting.type === SettingType.BOOLEAN_TOGGLE) return isBooleanToggleSettingFormat(maybeSetting);
  if (maybeSetting.type === SettingType.TEXT) return isTextSettingFormat(maybeSetting);
  return false;
}

export function duplicateSetting(setting:Setting):Setting {
  switch (setting.type) {
    case SettingType.BOOLEAN_TOGGLE: return duplicateBooleanToggleSetting(setting);
    case SettingType.NUMERIC: return duplicateNumericSetting(setting);
    case SettingType.TEXT: return duplicateTextSetting(setting);
    default: throw Error('Unexpected');
  }
}

export default Setting;