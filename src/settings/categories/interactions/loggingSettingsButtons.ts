import { errorToast, infoToast } from "@/components/toasts/toastUtil";
import { copyLogsToClipboard, deleteAllLogMessages } from "@/localLogging/logUtil";
import { botch } from "@/common/assertUtil";

export enum ButtonAction {
  COPY_ALL_LOGS = 'copyAllLogs',
  COPY_TODAY_LOGS = 'copyTodayLogs',
  CLEAR_LOGS = 'clearLogs'
};

export async function onLogSettingsButtonClick(value:ButtonAction) {
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