import { getCategorySettings } from "@/persistence/settings";
import SettingCategory from "../types/SettingCategory";
import SettingType from "../types/SettingType";
import { mergeSettingsIntoCategory } from "./settingCategoryUtil";
import Setting from "../types/Setting";
import { estimateSystemMemory, GIGABYTE } from "@/deviceCapabilities/memoryUtil";

export const LLM_CATEGORY_ID = "llm";
export const LLM_SETTING_MAX_SIZE = "llmMaxSize";

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

export function getLlmDefaultSettings():SettingCategory {
  return {
    name: "LLM",
    id: LLM_CATEGORY_ID,
    description: "Settings for loading and using LLMs (Large Language Models) on this device.",
    settings: [
      {type: SettingType.NUMERIC, id:LLM_SETTING_MAX_SIZE, label:"Max LLM size (GB)", value:_getDefaultMaxLlmSize(), minValue:1, maxValue:256}
    ],
    headings: [
      {precedeSettingId:'llmMaxSize', description:`The max LLM size prevents attempting to load models that are unlikely to succeed and could cause system instability.`}
    ]
  };
}

export async function loadLlmSettingCategory():Promise<SettingCategory> {
  const settings = await getCategorySettings("llm");
  return mergeSettingsIntoCategory(getLlmDefaultSettings(), settings);
}

export async function applyLlmSettings(_settings:Setting[]):Promise<void> {
  // Currently, no specific actions are needed to apply LLM settings.
  // This function is a placeholder for future logic if needed.
  // For now, it simply returns without doing anything.
  return Promise.resolve();
}

/* v8 ignore start */
export async function getMaxLlmSize():Promise<number> {
  const settings = await getCategorySettings(LLM_CATEGORY_ID);
  if (!settings) return _getDefaultMaxLlmSize();
  const maxSizeSetting = settings.find(s => s.id === LLM_SETTING_MAX_SIZE);
  if (!maxSizeSetting) return _getDefaultMaxLlmSize();
  return maxSizeSetting.value as number;
}
/* v8 ignore end */