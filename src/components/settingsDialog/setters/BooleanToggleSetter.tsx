import { useState } from "react";

import BooleanToggleSetting from "@/settings/types/BooleanToggleSetting";
import { ValidateSettingCallback } from "@/components/settingsDialog/types/AppSettingsCallbacks";
import styles from "./Setters.module.css";
import Selector from "@/components/selector/Selector";
import { handleValidation } from "./setterUtil";

type Props = {
  setting:BooleanToggleSetting,
  onChange:(setting:BooleanToggleSetting, isValid:boolean) => void,
  onValidateSetting?:ValidateSettingCallback,
}

function BooleanToggleSetter({ setting, onChange, onValidateSetting }:Props) {
  const [lastValidValue, setLastValidValue] = useState<boolean>(setting.value);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  
  function _onChange(value:boolean) {
    const nextSetting = { ...setting, value };
    const isValid = handleValidation(nextSetting, lastValidValue, setValidationMessage, onValidateSetting);
    if (isValid) setLastValidValue(nextSetting.value);
    onChange(nextSetting, isValid);
  }

  const validationContent = validationMessage ? <div className={styles.validationMessage}>{validationMessage}</div> : null;
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