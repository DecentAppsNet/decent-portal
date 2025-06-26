import { useState } from "react";

import BooleanToggleSetting from "@/settings/types/BooleanToggleSetting";
import { ValidateSettingCallback } from "@/components/settingsDialog/types/AppSettingsCallbacks";
import { LAST_VALID_VALUE } from "@/components/settingsDialog/types/ValidationFailure";
import styles from "./Setters.module.css";
import Selector from "@/components/selector/Selector";

type Props = {
  setting:BooleanToggleSetting,
  onChange:(setting:BooleanToggleSetting, isValid:boolean) => void,
  onValidateSetting?:ValidateSettingCallback
}

function BooleanToggleSetter({ setting, onChange, onValidateSetting }:Props) {
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  
  function _onChange(value:boolean) {
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

  const validationContent = validationMessage ? <div className={styles.validationContent}>{validationMessage}</div> : null;
  const optionNames = [setting.falseLabel ?? "No", setting.trueLabel ?? "Yes"];

  return (
    <div className={styles.container}>
      <span className={styles.label}>{setting.label}</span>
      <Selector optionNames={optionNames} selectedOptionNo={setting.value ? 1 : 0} onChange={optionNo => _onChange(optionNo === 1)} />
      {validationContent}
    </div>
  );
}

export default BooleanToggleSetter;