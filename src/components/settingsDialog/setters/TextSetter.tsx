import { useState } from "react";

import TextSetting from "@/settings/types/TextSetting";
import { ValidateSettingCallback } from "../types/AppSettingsCallbacks";
import styles from "./Setters.module.css";
import { handleValidation } from "./setterUtil";

type Props = {
  setting:TextSetting,
  onChange:(setting:TextSetting, isValid:boolean) => void,
  onValidateSetting?:ValidateSettingCallback
  disabled?:boolean,
}

function TextSetter({ setting, onChange, onValidateSetting, disabled }:Props) {
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [lastValidValue, setLastValidValue] = useState<string|null>(null);
  
  function _onChange(value:string) {
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
      <input
        id={setting.id}
        type="text"
        value={setting.value}
        onChange={(e) => _onChange(e.target.value)}
        placeholder={setting.placeholder}
        disabled={disabled}
      />
      {validationContent}
    </div>
  );
}

export default TextSetter;