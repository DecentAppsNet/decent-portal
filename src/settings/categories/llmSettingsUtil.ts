import { getCategorySettings } from "@/persistence/settings";
import SettingCategory from "../types/SettingCategory";
import SettingType from "../types/SettingType";
import { mergeSettingsIntoCategory } from "./settingCategoryUtil";

export function getLlmDefaultSettings():SettingCategory {
  return {
    name: "LLM",
    id: "llm",
    description: "Settings for loading and using LLMs (Large Language Models) on this device.",
    settings: [
      {type: SettingType.NUMERIC, id:"llmMaxSize", label:"Max LLM size (GB)", value:8, minValue:1, maxValue:256}
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