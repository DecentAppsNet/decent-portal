import SettingBase from "./SettingBase"
import SettingType from "./SettingType"

type NumericRangeSetting = SettingBase & {
  type:SettingType.NUMERIC_RANGE,
  value:number,
  min:number,
  max:number,
  useDecimal?:boolean
}

export default NumericRangeSetting;