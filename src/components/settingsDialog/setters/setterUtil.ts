import Setting from "@/settings/types/Setting";
import { ValidateSettingCallback } from "@/components/settingsDialog/types/AppSettingsCallbacks";
import { LAST_VALID_VALUE } from "@/components/settingsDialog/types/ValidationFailure";
import { _ } from "vitest/dist/chunks/reporters.d.BFLkQcL6";

const theValidationMessageTimers = new Map<string, NodeJS.Timeout>();

function _clearValidationMessageTimer(settingId:string) {
  const previousTimer = theValidationMessageTimers.get(settingId);
  if (previousTimer) {
    clearTimeout(previousTimer);
    theValidationMessageTimers.delete(settingId);
  }
}

function _setValidationMessageTimer(settingId:string, setValidationMessage:Function) {
  _clearValidationMessageTimer(settingId);
  const timer = setTimeout(() => {
    setValidationMessage(null);
    theValidationMessageTimers.delete(settingId);
  }, 3000);
  theValidationMessageTimers.set(settingId, timer);
}

export function handleValidation(nextSetting:Setting, lastValidValue:any, setValidationMessage:Function, onValidateSetting?:ValidateSettingCallback):boolean {
  if (!onValidateSetting) return true;
  const validationFailure = onValidateSetting(nextSetting);
  if (validationFailure) {
    _clearValidationMessageTimer(nextSetting.id);
    setValidationMessage(validationFailure.failReason ?? null);
    if (validationFailure.nextValue !== undefined) {
      (nextSetting as any).value = validationFailure.nextValue === LAST_VALID_VALUE ? lastValidValue : validationFailure.nextValue;
      // A message shown should be hidden after a short delay, because the problem with the value has been resolved.
      if (validationFailure.failReason) _setValidationMessageTimer(nextSetting.id, setValidationMessage);
      return true;
    }
    return false;
  }
  setValidationMessage(null);
  return true;
}