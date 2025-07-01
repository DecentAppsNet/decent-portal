import { getCategorySettings } from "@/persistence/settings";
import SettingCategory from "@/settings/types/SettingCategory";
import SettingType from "@/settings/types/SettingType";
import { mergeSettingsIntoCategory } from "./settingCategoryUtil";
import { infoToast } from "@/components/toasts/toastUtil";

export const LOGGING_CATEGORY_ID = "logging";
export const LOGGING_SETTING_ENABLE = "enableLogging";
export const LOGGING_SETTING_MAX_RETENTION_DAYS = "maxRetentionDays";

enum ButtonAction {
  COPY_ALL_LOGS = 'copyAllLogs',
  COPY_TODAY_LOGS = 'copyTodayLogs',
  CLEAR_LOGS = 'clearLogs'
};

function _onButtonClick(value:ButtonAction):void {
  switch (value) {
    case ButtonAction.COPY_ALL_LOGS:
      infoToast("All logs copied to clipboard. You can paste them into an email, issue, etc.");
      break;
    case ButtonAction.COPY_TODAY_LOGS:
      infoToast("Today's logs copied to clipboard. You can paste them into an email, issue, etc.");
      break;
    case ButtonAction.CLEAR_LOGS:
      infoToast("Logs cleared.");
      break;
    default:
      throw Error(`Unexpected button action: ${value}`);
  }
}

export function getLoggingDefaultSettings():SettingCategory {
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
          { label:'Clear Logs', value:ButtonAction.CLEAR_LOGS }
        ],
        onButtonClick:(value) => _onButtonClick(value as ButtonAction)
      }
    ],
    disablementRules:[{ targetSettingId:LOGGING_SETTING_MAX_RETENTION_DAYS, criteriaSettingId:LOGGING_SETTING_ENABLE, criteriaValue:false }]
  };
}

export async function loadLoggingSettingCategory():Promise<SettingCategory> {
  const settings = await getCategorySettings(LOGGING_CATEGORY_ID);
  return mergeSettingsIntoCategory(getLoggingDefaultSettings(), settings);
}