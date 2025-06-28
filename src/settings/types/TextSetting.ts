import SettingBase from './SettingBase';
import SettingType from './SettingType';

type TextSetting = SettingBase & {
  type:SettingType.TEXT,
  value:string,
  placeholder?:string
}

export function isTextSettingFormat(maybeSetting:any):boolean {
  return !!maybeSetting &&
         maybeSetting.type === SettingType.TEXT &&
         typeof maybeSetting.value === 'string' &&
         (maybeSetting.placeholder === undefined || typeof maybeSetting.placeholder === 'string');
}

export default TextSetting;