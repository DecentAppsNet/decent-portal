import { useState, useEffect, ReactNode } from "react";

import SupportedModelSetting from "@/settings/types/SupportedModelSetting";
import styles from "./Setters.module.css";
import Selector from "@/components/selector/Selector";
import { ValidateSettingCallback } from "@/settings/types/AppSettingsCallbacks";
import { handleValidation } from "./setterUtil";
import ModelDeviceProblem from "@/models/types/ModelDeviceProblem";
import { nicknameModelId } from "@/models/modelIdUtil";
import SupportedModel from "@/appMetadata/types/SupportedModel";
import { predictModelDeviceProblems } from "@/models/modelUtil";
import { getModelDeviceHistory } from "@/persistence/deviceHistory";
import ModelDeviceHistory from "@/models/types/ModelDeviceHistory";
import ModelDeviceProblemType from "@/models/types/ModelDeviceProblemType";
import SupportedModelPopoverContent from "./SupportedModelPopoverContent";
import Direction from "@/components/popOver/types/Direction";

export const AUTO_SELECT_ID = 'auto-select'; // Special model ID for auto-select option

const AUTO_SELECT_OPTION:ModelOption = {
  id: AUTO_SELECT_ID,
  originalIndex: -1,
  displayName: 'Auto Select',
  problems: null,
  inputCharsPerSec: 0,
  outputCharsPerSec: 0,
  appBehaviorSummary: 'Automatically select the best model for your device and this app.',
  beta: false,
  iconChar: null
}

type Props = {
  setting:SupportedModelSetting,
  onChange:(setting:SupportedModelSetting, isValid:boolean) => void,
  onValidateSetting?:ValidateSettingCallback,
  disabled?:boolean
}

type ModelOption = {
  id:string,
  originalIndex:number,
  beta:boolean,
  iconChar:string|null,
  displayName:string,
  appBehaviorSummary:string,
  problems:ModelDeviceProblem[]|null,
  inputCharsPerSec:number,
  outputCharsPerSec:number
}

// Sort beta models to the end, while otherwise preserving the original order.
function _sortModelOptions(options:ModelOption[]):ModelOption[] {
  return options.sort((a, b) => {
    if (a.beta && !b.beta) return 1;
    if (!a.beta && b.beta) return -1;
    return a.originalIndex - b.originalIndex;
  });
}

async function _initModelOptions(models:SupportedModel[], setModelOptions:Function) {
  // Quickly set display names.
  const modelNicknames:string[] = [];
  const modelOptions:ModelOption[] = models.map((model:SupportedModel, originalIndex:number) => {
    const { id, beta, appBehaviorSummary } = model;
    let displayName = nicknameModelId(id, modelNicknames);
    modelNicknames.push(displayName);
    return { id, originalIndex, displayName, problems:null, inputCharsPerSec:0, outputCharsPerSec:0, 
      beta:!!beta, iconChar:null, appBehaviorSummary }
  });
  const sortedModelOptions = _sortModelOptions(modelOptions);
  sortedModelOptions.unshift(AUTO_SELECT_OPTION);
  setModelOptions(modelOptions);

  // Asynchronously update to show problems and performance history.
  const PROBLEM_ICON = '⚠', AFTER_AUTO_SELECT = 1;
  const secondModelOptions = [...sortedModelOptions];
  for(let optionI = AFTER_AUTO_SELECT; optionI < secondModelOptions.length; ++optionI) {
    const option = secondModelOptions[optionI];
    option.problems = await predictModelDeviceProblems(option.id) ?? [];
    if (option.problems.length) option.problems = option.problems.filter(o => o.type !== ModelDeviceProblemType.DEVELOPER_MODE);
    if (option.beta) option.problems.push({ type: ModelDeviceProblemType.BETA, description: 'Beta status: app has not been fully tested with this model.' });
    if (!option.problems.length) option.problems = null;
    option.iconChar = option.problems ? PROBLEM_ICON : null;
    const history:ModelDeviceHistory = await getModelDeviceHistory(option.id);
    if (history.inputCharsPerSec.series.length) option.inputCharsPerSec = history.inputCharsPerSec.lastAverage;
    if (history.outputCharsPerSec.series.length) option.outputCharsPerSec = history.outputCharsPerSec.lastAverage;
  };
  setModelOptions(secondModelOptions);
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
    _initModelOptions(setting.models, setModelOptions);
  }, [setting.models])

  function _onChange(nextModelId:string) {
    const nextSetting = { ...setting, value:nextModelId };
    const isValid = handleValidation(nextSetting, lastValidValue, setValidationMessage, onValidateSetting);
    if (isValid) setLastValidValue(nextSetting.value);
    onChange(nextSetting, isValid);
  }
  const validationContent = validationMessage ? <div className={styles.validationMessage}>{validationMessage}</div> : null;

  const labelClass = disabled ? styles.labelDisabled : styles.label;
  const popoverContent:ReactNode[]|undefined = _renderPopoverContent(modelOptions);
  return (
    <div className={styles.container}>
      <span className={labelClass}>{setting.label}</span>
      <Selector
        optionNames={modelOptions.map(o => o.displayName)}
        iconChars={modelOptions.map(o => o.iconChar)}
        selectedOptionNo={Math.min(0, modelOptions.findIndex(o => o.id === setting.value))}
        onChange={optionI => _onChange(modelOptions[optionI].id)}
        disabled={disabled}
        popoverContent={popoverContent}
        popoverPreferredDirection={Direction.ABOVE}
      />
      {validationContent}
    </div>
  );
}

export default SupportedModelSetter;