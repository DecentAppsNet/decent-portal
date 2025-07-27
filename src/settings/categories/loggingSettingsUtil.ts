import { getCategorySettings } from "@/persistence/settings";
import SettingCategory from "@/settings/types/SettingCategory";
import SettingType from "@/settings/types/SettingType";
import { mergeSettingValuesIntoCategory, settingsToSettingValues } from "./settingCategoryUtil";
import { ButtonAction, onLogSettingsButtonClick } from './interactions/loggingSettingsButtons';
import SettingValues from "../types/SettingValues";

export const LOGGING_CATEGORY_ID = "logging";
export const LOGGING_SETTING_ENABLE = "enableLogging";
export const LOGGING_SETTING_MAX_RETENTION_DAYS = "maxRetentionDays";

function _getLoggingDefaultSettings():SettingCategory {
  return {
    name: "Logging",
    id: LOGGING_CATEGORY_ID,
    description: "Settings for locally logging application events and errors. Logs are never sent to a server.",
    settings: [
      {type: SettingType.BOOLEAN_TOGGLE, id:LOGGING_SETTING_ENABLE, label:"Logging enabled?", value:true},
      {type: SettingType.NUMERIC, id:LOGGING_SETTING_MAX_RETENTION_DAYS, label:"Max days to keep", value:7, minValue:1, maxValue:1000, allowDecimals:false}, 
    ],
    headings: [
      {precedeSettingId:null, description:`Logs can be useful for troubleshooting problems with apps. You can copy them from this dialog and paste into emails, Github issues, etc.`,
        buttons: [
          { label:'Copy All Logs', value:ButtonAction.COPY_ALL_LOGS },
          { label:'Copy Logs from Today', value:ButtonAction.COPY_TODAY_LOGS },
          { label:'Clear Logs', value:ButtonAction.CLEAR_LOGS },
        ],
        /* v8 ignore next */
        onButtonClick:(value) => onLogSettingsButtonClick(value as ButtonAction)
      }
    ],
    disablementRules:[{ targetSettingId:LOGGING_SETTING_MAX_RETENTION_DAYS, criteriaSettingId:LOGGING_SETTING_ENABLE, criteriaValue:false }]
  };
}

export async function loadLoggingSettingCategory():Promise<SettingCategory> {
  const settingValues = await getCategorySettings(LOGGING_CATEGORY_ID) ?? {};
  return mergeSettingValuesIntoCategory(_getLoggingDefaultSettings(), settingValues);
}

export async function getLoggingSettings():Promise<SettingValues> {
  const loggingSettings = await getCategorySettings(LOGGING_CATEGORY_ID);
  if (loggingSettings) return loggingSettings;
  const defaultSettings = _getLoggingDefaultSettings();
  return settingsToSettingValues(defaultSettings.settings);
}