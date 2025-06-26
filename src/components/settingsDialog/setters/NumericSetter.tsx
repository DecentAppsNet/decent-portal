import { useState } from "react";

import NumericRangeSetting from "@/settings/types/NumericSetting";
import styles from "./Setters.module.css";
import NumericInput from "@/components/numericInput/NumericInput";
import { ValidateSettingCallback } from "@/components/settingsDialog/types/AppSettingsCallbacks";
import { LAST_VALID_VALUE } from "@/components/settingsDialog/types/ValidationFailure";

type Props = {
  setting:NumericRangeSetting,
  onChange:(setting:NumericRangeSetting, isValid:boolean) => void,
  onValidateSetting?:ValidateSettingCallback
}

function NumericSetter({ setting, onChange, onValidateSetting }:Props) {
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  
  function _onChange(value:number) {
    const nextSetting = { ...setting, value };
    let isValid = true;
    if (onValidateSetting) {
      const validationFailure = onValidateSetting(nextSetting);
      if (validationFailure) {
        isValid = false;
        setValidationMessage(validationFailure.failReason);
        if (validationFailure.nextValue === LAST_VALID_VALUE) return;
        if (validationFailure.nextValue !== undefined) nextSetting.value = validationFailure.nextValue;
      } else {
        setValidationMessage(null);
      }
    }
    onChange(nextSetting, isValid);
  }
  const validationContent = validationMessage ? <div className={styles.validationMessage}>{validationMessage}</div> : null;

  return (
    <div className={styles.container}>
      <span className={styles.label}>{setting.label}</span>
      <NumericInput minValue={setting.minValue} maxValue={setting.maxValue} allowDecimals={setting.allowDecimals} value={setting.value} onChange={_onChange} />
      {validationContent}
    </div>
  );
}

export default NumericSetter;