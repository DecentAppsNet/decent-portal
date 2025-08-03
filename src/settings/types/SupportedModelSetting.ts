import SupportedModel, { duplicateSupportedModel, isSupportedModelFormat } from "../../appMetadata/types/SupportedModel";
import SettingBase from "./SettingBase"
import SettingType from "./SettingType"

type SupportedModelSetting = SettingBase & {
  type:SettingType.SUPPORTED_MODEL,
  value:string,
  models:SupportedModel[]
}

export function isSupportedModelSettingFormat(maybeSetting:any):boolean {
  return !!maybeSetting && 
         maybeSetting.type === SettingType.SUPPORTED_MODEL &&
         typeof maybeSetting.value === 'string' &&
         maybeSetting.models &&
         Array.isArray(maybeSetting.models) &&
         maybeSetting.models.every(isSupportedModelFormat);
}

export function duplicateSupportedModelSetting(setting:SupportedModelSetting):SupportedModelSetting {
  return { ...setting,
    models: setting.models.map(duplicateSupportedModel)
  };
}

export default SupportedModelSetting;