import { getCategorySettings } from "@/persistence/settings";
import SettingCategory from "../types/SettingCategory";
import SettingType from "../types/SettingType";
import { mergeSettingsIntoCategory } from "./settingCategoryUtil";
import Setting from "../types/Setting";

export const LLM_CATEGORY_ID = "llm";
export const LLM_SETTING_MAX_SIZE = "llmMaxSize";

export function getLlmDefaultSettings():SettingCategory {
  return {
    name: "LLM",
    id: LLM_CATEGORY_ID,
    description: "Settings for loading and using LLMs (Large Language Models) on this device.",
    settings: [
      {type: SettingType.NUMERIC, id:LLM_SETTING_MAX_SIZE, label:"Max LLM size (GB)", value:8, minValue:1, maxValue:256}
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