import SettingCategory from "./types/SettingCategory";
import SettingType from "./types/SettingType";

export function getLlmDefaultSettings():SettingCategory {
  return {
    name: "LLM",
    description: "Settings for loading and using LLMs (Large Language Models) on this device.",
    settings: [
      {type: SettingType.NUMERIC, id:"llmMaxSize", label:"Max LLM size (GB)", value:8, minValue:1, maxValue:256}
    ],
    headings: [
      {precedeSettingId:'llmMaxSize', description:`The max LLM size prevents attempting to load models that are unlikely to succeed and could cause system instability.`}
    ]
  };
}