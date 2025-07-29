import { getCategorySettings, setCategorySettings } from "@/persistence/settings";
import SettingCategory from "../types/SettingCategory";
import SettingType from "../types/SettingType";
import { mergeSettingValuesIntoCategory, settingsToSettingValues } from "./settingCategoryUtil";
import { estimateSystemMemory, GIGABYTE } from "@/deviceCapabilities/memoryUtil";
import { assertNonNullable } from "@/common/assertUtil";
import SettingValues from "../types/SettingValues";

export const LLM_CATEGORY_ID = "llm";
export const LLM_SETTING_MAX_SIZE = "llmMaxSize";
export const LLM_SETTING_AUTO_INC_MAX_SIZE = "autoIncMaxSize";

/*
  The system memory has nothing to do with GPU memory... sorta. Due to web API limitations, I can't directly query GPU memory available.
  So we won't really know how much GPU memory is available until we successfully allocate. I'm saying "GPU memory" instead of "video memory", 
  because WebGPU can allocate beyond video memory on devices with unified memory architecture (Macs). There is a danger of system 
  instability (hangs, hard reboots) by overallocating on unified memory devices. Browser code can crash the O/S. So by choosing a number 
  based on available memory as reported by the browser, I can stop allocation beyond the point where system stability becomes a risk.

  Where does 8gb AT_LEAST_THIS_MUCH magic number come from? It's to allow a device to try loading some smaller models, as a unified memory
  architecture is very unlikely to crash in this range.
*/
function _getDefaultMaxLlmSize():number {
  const AT_LEAST_THIS_MUCH = 8;
  const availableMemory = estimateSystemMemory();
  const availableMemoryGB = Math.round(availableMemory / GIGABYTE);
  return Math.max(AT_LEAST_THIS_MUCH, availableMemoryGB);
}

function _getLlmDefaultSettings():SettingCategory {
  return {
    name: "LLM",
    id: LLM_CATEGORY_ID,
    description: "Settings for loading and using LLMs (Large Language Models) on this device.",
    settings: [
      {type: SettingType.NUMERIC, id:LLM_SETTING_MAX_SIZE, label:"Max LLM size (GB)", value:_getDefaultMaxLlmSize(), minValue:1, maxValue:256},
      {type: SettingType.BOOLEAN_TOGGLE, id:LLM_SETTING_AUTO_INC_MAX_SIZE, label:"Auto-increase max LLM", value:true}
    ],
    headings: [
      {precedeSettingId:'llmMaxSize', description:`The max LLM size prevents attempting to load models that are unlikely to succeed and could cause system instability. The auto-increment option will increase the max LLM size if evidence is found during loading to support a larger size.`}
    ]
  };
}

export async function loadLlmSettingCategory():Promise<SettingCategory> {
  const settingValues = await getCategorySettings(LLM_CATEGORY_ID) ?? {};
  return mergeSettingValuesIntoCategory(_getLlmDefaultSettings(), settingValues);
}

export async function applyLlmSettings(_settingValues:SettingValues):Promise<void> {
  // Currently, no specific actions are needed to apply LLM settings.
  // This function is a placeholder for future logic if needed.
  // For now, it simply returns without doing anything.
  return Promise.resolve();
}

export async function incrementMaxLlmSizeAfterSuccessfulLoad(successfulLoadSize:number) {
  const llmCategory = await loadLlmSettingCategory();
  const settingValues = settingsToSettingValues(llmCategory.settings);
  const isAutoIncrementing = settingValues[LLM_SETTING_AUTO_INC_MAX_SIZE] as boolean;
  if (!isAutoIncrementing) return;
  const currentMaxSize = settingValues[LLM_SETTING_MAX_SIZE] as number;
  /* v8 ignore next */
  assertNonNullable(currentMaxSize); // The default settings at least should always have this setting.
  if (currentMaxSize >= successfulLoadSize) return;
  settingValues[LLM_SETTING_MAX_SIZE] = Math.ceil(successfulLoadSize); // Round up to nearest GB because setting is whole numbers only. Rounding down would cause this model to be treated pessimistically when loading later.
  setCategorySettings(LLM_CATEGORY_ID, settingValues);
}

export async function getMaxLlmSize():Promise<number> {
  const settingValues = await getCategorySettings(LLM_CATEGORY_ID);
  if (!settingValues) return _getDefaultMaxLlmSize();
  const maxSize = settingValues[LLM_SETTING_MAX_SIZE];
  if (!maxSize) return _getDefaultMaxLlmSize();
  return maxSize as number;
}