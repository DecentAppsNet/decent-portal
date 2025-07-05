import { getCategorySettings } from "@/persistence/settings";
import SettingCategory from "@/settings/types/SettingCategory";
import SettingType from "@/settings/types/SettingType";
import { mergeSettingsIntoCategory } from "./settingCategoryUtil";
import { errorToast, infoToast } from "@/components/toasts/toastUtil";
import { copyLogsToClipboard, deleteAllLogMessages } from "@/localLogging/logUtil";
import Setting from "../types/Setting";
import { botch } from "@/common/assertUtil";

export const LOGGING_CATEGORY_ID = "logging";
export const LOGGING_SETTING_ENABLE = "enableLogging";
export const LOGGING_SETTING_MAX_RETENTION_DAYS = "maxRetentionDays";

enum ButtonAction {
  COPY_ALL_LOGS = 'copyAllLogs',
  COPY_TODAY_LOGS = 'copyTodayLogs',
  CLEAR_LOGS = 'clearLogs'
};

async function _onButtonClick(value:ButtonAction) {
  switch (value) {
    case ButtonAction.COPY_ALL_LOGS:
      try {
        if (await copyLogsToClipboard()) {
          infoToast("All logs copied to clipboard. You can paste them into an email, issue, etc.");
        } else {
          infoToast("No logs found.");
        }
      } catch (e) {
        console.error(e);
        errorToast("Could not copy logs to the clipboard.");
      }
      break;
    case ButtonAction.COPY_TODAY_LOGS:
      try{
        if (await copyLogsToClipboard(1)) {
          infoToast("Todays logs copied to clipboard. You can paste them into an email, issue, etc.");
        } else {
          infoToast("No logs found for today.");
        }
      } catch (e) {
        console.error(e);
        errorToast("Could not copy logs to the clipboard.");
      }
      break;
    case ButtonAction.CLEAR_LOGS:
      try {
        await deleteAllLogMessages();
        infoToast("Logs cleared.");
      } catch (e) {
        console.error(e);
        errorToast("Could not copy logs to the clipboard.");
      }
      break;
    default:
      botch();
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
          { label:'Clear Logs', value:ButtonAction.CLEAR_LOGS },
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

export async function getLoggingSettings():Promise<Setting[]> {
  const loggingSettings = await getCategorySettings(LOGGING_CATEGORY_ID);
  if (loggingSettings) return loggingSettings;
  const defaultSettings = getLoggingDefaultSettings();
  return defaultSettings.settings;
}