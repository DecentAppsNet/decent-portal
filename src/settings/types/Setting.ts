import { botch } from "../../common/assertUtil";
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
  switch (maybeSetting.type) {
    case SettingType.BOOLEAN_TOGGLE: return isBooleanToggleSettingFormat(maybeSetting);
    case SettingType.NUMERIC: return isNumericSettingFormat(maybeSetting);
    case SettingType.TEXT: return isTextSettingFormat(maybeSetting);
    /* v8 ignore start */
    default: 
      botch(); // isSettingBaseFormat() should have caught this.
    /* v8 ignore end */
  }
}

export function duplicateSetting(setting:Setting):Setting {
  switch (setting.type) {
    case SettingType.BOOLEAN_TOGGLE: return duplicateBooleanToggleSetting(setting);
    case SettingType.NUMERIC: return duplicateNumericSetting(setting);
    case SettingType.TEXT: return duplicateTextSetting(setting);
    /* v8 ignore start */
    default: 
      botch();
    /* v8 ignore end */
  }
}

export default Setting;