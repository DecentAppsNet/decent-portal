import SettingBase from "./SettingBase"
import SettingType from "./SettingType"

type BooleanToggleSetting = SettingBase & {
  type:SettingType.BOOLEAN_TOGGLE,
  value:boolean,
  trueLabel?:string,
  falseLabel?:string
}

export default BooleanToggleSetting;