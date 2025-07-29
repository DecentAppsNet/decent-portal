import SupportedModel from "@/appMetadata/types/SupportedModel";
import { nicknameModelId } from "@/models/modelIdUtil";
import { predictModelDeviceProblems } from "@/models/modelUtil";
import ModelDeviceHistory from "@/models/types/ModelDeviceHistory";
import ModelDeviceProblem from "@/models/types/ModelDeviceProblem"
import ModelDeviceProblemType from "@/models/types/ModelDeviceProblemType";
import { getModelDeviceHistory } from "@/persistence/deviceHistory";

export type ModelOption = {
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

// Sort beta models to the end, while otherwise preserving the original order.
function _sortModelOptions(options:ModelOption[]):ModelOption[] {
  return options.sort((a, b) => {
    if (a.beta && !b.beta) return 1;
    if (!a.beta && b.beta) return -1;
    return a.originalIndex - b.originalIndex;
  });
}

export async function initModelOptions(models:SupportedModel[], setModelOptions:Function) {
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