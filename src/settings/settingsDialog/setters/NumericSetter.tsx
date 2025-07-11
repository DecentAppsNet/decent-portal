import { useState } from "react";

import NumericRangeSetting from "@/settings/types/NumericSetting";
import styles from "./Setters.module.css";
import NumericInput from "@/components/numericInput/NumericInput";
import { ValidateSettingCallback } from "@/settings/types/AppSettingsCallbacks";
import { handleValidation } from "./setterUtil";

type Props = {
  setting:NumericRangeSetting,
  onChange:(setting:NumericRangeSetting, isValid:boolean) => void,
  onValidateSetting?:ValidateSettingCallback,
  disabled?:boolean
}

function NumericSetter({ setting, onChange, onValidateSetting, disabled }:Props) {
  const [lastValidValue, setLastValidValue] = useState<number>(setting.value);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  function _onChange(value:number) {
    const nextSetting = { ...setting, value };
    const isValid = handleValidation(nextSetting, lastValidValue, setValidationMessage, onValidateSetting);
    if (isValid) setLastValidValue(nextSetting.value);
    onChange(nextSetting, isValid);
  }
  const validationContent = validationMessage ? <div className={styles.validationMessage}>{validationMessage}</div> : null;

  const labelClass = disabled ? styles.labelDisabled : styles.label;
  return (
    <div className={styles.container}>
      <span className={labelClass}>{setting.label}</span>
      <NumericInput 
        minValue={setting.minValue} 
        maxValue={setting.maxValue} 
        allowDecimals={setting.allowDecimals} 
        value={setting.value} 
        onChange={_onChange} 
        disabled={disabled}
      />
      {validationContent}
    </div>
  );
}

export default NumericSetter;