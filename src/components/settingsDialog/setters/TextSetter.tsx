import { useState } from "react";

import TextSetting from "@/settings/types/TextSetting";
import { ValidateSettingCallback } from "../types/AppSettingsCallbacks";
import { LAST_VALID_VALUE } from "@/components/settingsDialog/types/ValidationFailure";
import styles from "./Setters.module.css";

type Props = {
  setting:TextSetting,
  onChange:(setting:TextSetting, isValid:boolean) => void,
  onValidateSetting?:ValidateSettingCallback
}

function TextSetter({ setting, onChange, onValidateSetting }:Props) {
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  
  function _onChange(value:string) {
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