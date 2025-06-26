import { useState } from "react";

import TextSetting from "@/settings/types/TextSetting";
import { ValidateSettingCallback } from "../types/AppSettingsCallbacks";
import styles from "./Setters.module.css";
import { handleValidation } from "./setterUtil";

type Props = {
  setting:TextSetting,
  onChange:(setting:TextSetting, isValid:boolean) => void,
  onValidateSetting?:ValidateSettingCallback
}

function TextSetter({ setting, onChange, onValidateSetting }:Props) {
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [lastValidValue, setLastValidValue] = useState<string>(setting.value);
  
  function _onChange(value:string) {
    const nextSetting = { ...setting, value };
    const isValid = handleValidation(nextSetting, lastValidValue, setValidationMessage, onValidateSetting);
    if (isValid) setLastValidValue(nextSetting.value);
    onChange(nextSetting, isValid);
  }

  const validationContent = validationMessage ? <div className={styles.validationMessage}>{validationMessage}</div> : null;

  return (
    <div className={styles.container}>
      <span className={styles.label}>{setting.label}</span>
      <input
        id={setting.id}
        type="text"
        value={setting.value}
        onChange={(e) => _onChange(e.target.value)}
        placeholder={setting.placeholder}
      />
      {validationContent}
    </div>
  );
}

export default TextSetter;