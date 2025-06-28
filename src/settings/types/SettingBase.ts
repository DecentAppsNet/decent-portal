import SettingType from "./SettingType";

type SettingBase = {
  id:string,
  label:string,
  type:SettingType
}

export function isSettingBaseFormat(maybeSetting:any):boolean {
  return !!maybeSetting &&
         typeof maybeSetting.id === 'string' &&
         typeof maybeSetting.label === 'string' &&
         Object.values(SettingType).includes(maybeSetting.type);
}

export default SettingBase;