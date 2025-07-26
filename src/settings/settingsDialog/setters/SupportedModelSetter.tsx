import { useState, useEffect, ReactNode } from "react";

import SupportedModelSetting from "@/settings/types/SupportedModelSetting";
import styles from "./Setters.module.css";
import Selector from "@/components/selector/Selector";
import { ValidateSettingCallback } from "@/settings/types/AppSettingsCallbacks";
import { handleValidation } from "./setterUtil";
import SupportedModelPopoverContent from "./SupportedModelPopoverContent";
import Direction from "@/components/popOver/types/Direction";
import { initModelOptions, ModelOption } from "./interactions/models";

type Props = {
  setting:SupportedModelSetting,
  onChange:(setting:SupportedModelSetting, isValid:boolean) => void,
  onValidateSetting?:ValidateSettingCallback,
  disabled?:boolean
}

function _renderPopoverContent(modelOptions:ModelOption[]):ReactNode[]|undefined {
  return modelOptions.map(option => <SupportedModelPopoverContent 
    key={option.id}
    modelId={option.id}
    appBehaviorSummary={option.appBehaviorSummary}
    problems={option.problems}
    inputCharsPerSec={option.inputCharsPerSec}
    outputCharsPerSec={option.outputCharsPerSec}
  />);
}

function SupportedModelSetter({ setting, onChange, onValidateSetting, disabled }:Props) {
  const [lastValidValue, setLastValidValue] = useState<string>(setting.value);
  const [validationMessage, setValidationMessage] = useState<string|null>(null);
  const [modelOptions, setModelOptions] = useState<ModelOption[]>([]);

  useEffect(() => {
    initModelOptions(setting.models, setModelOptions);
  }, [setting.models])

  function _onChange(nextModelId:string) {
    const nextSetting = { ...setting, value:nextModelId };
    const isValid = handleValidation(nextSetting, lastValidValue, setValidationMessage, onValidateSetting);
    if (isValid) setLastValidValue(nextSetting.value);
    onChange(nextSetting, isValid);
  }
  const validationContent = validationMessage ? <div className={styles.validationMessage}>{validationMessage}</div> : null;

  const availableModelCount = setting.models.length;

  const labelClass = disabled ? styles.labelDisabled : styles.label;
  const popoverContent:ReactNode[]|undefined = _renderPopoverContent(modelOptions);
  let selectedOptionNo = modelOptions.findIndex(o => o.id === setting.value);
  if (selectedOptionNo === -1) selectedOptionNo = 0; // If the model is not found, default to the first one.
  const content = availableModelCount === 0
    ? <span>LLM is not used by app.</span>
    : <Selector
        optionNames={modelOptions.map(o => o.displayName)}
        iconChars={modelOptions.map(o => o.iconChar)}
        selectedOptionNo={selectedOptionNo}
        onChange={optionI => _onChange(modelOptions[optionI].id)}
        disabled={disabled}
        popoverContent={popoverContent}
        popoverPreferredDirection={Direction.BELOW}
      />;
  return (
    <div className={styles.container}>
      <span className={labelClass}>{setting.label}</span>
      {content}
      {validationContent}
    </div>
  );
}

export default SupportedModelSetter;