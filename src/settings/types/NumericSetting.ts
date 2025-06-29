import SettingBase from "./SettingBase"
import SettingType from "./SettingType"

type NumericRangeSetting = SettingBase & {
  type:SettingType.NUMERIC,
  value:number,
  minValue:number,
  maxValue:number,
  allowDecimals?:boolean
}

export function isNumericSettingFormat(maybeSetting:any):boolean {
  return !!maybeSetting && 
         maybeSetting.type === SettingType.NUMERIC &&
         typeof maybeSetting.value === 'number' &&
         typeof maybeSetting.minValue === 'number' &&
         typeof maybeSetting.maxValue === 'number' &&
         (maybeSetting.allowDecimals === undefined || typeof maybeSetting.allowDecimals === 'boolean');
}

export function duplicateNumericSetting(setting:NumericRangeSetting):NumericRangeSetting {
  return { ...setting };
}

export default NumericRangeSetting;