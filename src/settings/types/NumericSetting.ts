import SettingBase from "./SettingBase"
import SettingType from "./SettingType"

type NumericRangeSetting = SettingBase & {
  type:SettingType.NUMERIC,
  value:number,
  minValue:number,
  maxValue:number,
  allowDecimals?:boolean
}

export default NumericRangeSetting;