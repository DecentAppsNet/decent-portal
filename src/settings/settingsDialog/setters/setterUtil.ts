import Setting from "@/settings/types/Setting";
import { ValidateSettingCallback } from "@/settings/types/AppSettingsCallbacks";
import { LAST_VALID_VALUE } from "@/settings/types/ValidationFailure";

let theValidationMessageDelayMs = 3000;
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
  }, theValidationMessageDelayMs);
  theValidationMessageTimers.set(settingId, timer);
}

export function setClearValidationMessageDelay(delayMs:number) {
  theValidationMessageDelayMs = delayMs;
}

export function handleValidation(nextSetting:Setting, lastValidValue:any, setValidationMessage:Function, onValidateSetting?:ValidateSettingCallback):boolean {
  if (!onValidateSetting) { setValidationMessage(null); return true; }
  const validationFailure = onValidateSetting(nextSetting.id, nextSetting.value);
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