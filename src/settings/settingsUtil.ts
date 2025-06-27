import SettingCategory from "./types/SettingCategory";
import SettingType from "./types/SettingType";

export function getLlmDefaultSettings():SettingCategory {
  return {
    name: "LLM",
    description: "Settings for loading and using LLMs (Large Language Models) on this device.",
    settings: [
      {type:SettingType.HEADING, id:'heading', label:`The max LLM size prevents attempting to load models that are unlikely to succeed and could cause system instability.`},
      {type: SettingType.NUMERIC, id:"llmMaxSize", label:"Max LLM size (GB)", value:8, minValue:1, maxValue:256}
    ]
  };
}

export function getLoggingDefaultSettings():SettingCategory {
  return {
    name: "Logging",
    description: "Settings for locally logging application events and errors. Logs are never sent to a server.",
    settings: [
      {type: SettingType.BOOLEAN_TOGGLE, id:"enableLogging", label:"Logging enabled?", value:true},
      {type: SettingType.NUMERIC, id:"maxRetentionDays", label:"Max days to keep", value:7, minValue:1, maxValue:1000, allowDecimals:false},
      { 
        type:SettingType.HEADING, id:'heading', 
        label:`Logs can be useful for troubleshooting problems with apps. You can copy them from this dialog and paste into emails, Github issues, etc.`,
        buttons: [
          { label:'Copy All Logs', value:'copyAllLogs' },
          { label:'Copy Logs from Today', value:'copyTodayLogs' },
          { label:'Clear Logs', value:'clearLogs' }
        ],
        onButtonClick: (value) => { console.log(`Button clicked: ${value}`); } // Placeholder for actual button actions
      } 
    ]
  };
}