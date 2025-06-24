import SettingBase from "./SettingBase"
import SettingType from "./SettingType"

type NumericRangeSetting = SettingBase & {
  type:SettingType.NUMERIC,
  value:number,
  min:number,
  max:number,
  useDecimal?:boolean
}

export default NumericRangeSetting;