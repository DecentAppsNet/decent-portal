import SettingBase from './SettingBase';
import SettingType from './SettingType';

type TextSetting = SettingBase & {
  type:SettingType.TEXT,
  value:string,
  placeholder?:string
}

export default TextSetting;