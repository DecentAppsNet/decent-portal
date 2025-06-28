import SettingBase from "./SettingBase"
import SettingType from "./SettingType"

type BooleanToggleSetting = SettingBase & {
  type:SettingType.BOOLEAN_TOGGLE,
  value:boolean,
  trueLabel?:string,
  falseLabel?:string
}

export function isBooleanToggleSettingFormat(maybeSetting:any):boolean {
  return !!maybeSetting && 
         maybeSetting.type === SettingType.BOOLEAN_TOGGLE &&
         typeof maybeSetting.value === 'boolean' &&
         (maybeSetting.trueLabel === undefined || typeof maybeSetting.trueLabel === 'string') &&
         (maybeSetting.falseLabel === undefined || typeof maybeSetting.falseLabel === 'string');
}

export default BooleanToggleSetting;