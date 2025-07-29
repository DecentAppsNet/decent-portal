/* v8 ignore start */

/*
What to include in exports?
- API: All functions that correspond to released features intended to be supported and maintained over time.
- Types related to any value returned by API. It's okay if there's no real use case for the type.

Things that aren't good to export:
- Stuff that you want to brag about, but isn't going to be useful to most people.
- Stuff that is likely to have breaking changes in next 6 months.
- Stuff that is great to use internally to the project, but takes more productionalizing for people to use.

People can always vendor and fork more functionality from `decent-portal`. Or ask for it to be included. 
I wrote this note to myself to curtail my habit of over-exporting, but if you are reading this and wishing 
for something to be exported, please file an issue. I'll consider it!
*/

// The DecentBar
export { default as DecentBar, defaultOnClickLink } from './components/decentBar/DecentBar';
export type { default as Link } from './components/decentBar/types/Link';
export type { default as DecentBarCssOverrides } from './components/decentBar/types/DecentBarCssOverrides';

// App settings management
export { getAppSettings } from './settings/categories/appSettingsUtil';
export type { LoadAppSettingsCallback, SaveAppSettingsCallback, ValidateSettingCallback } from './settings/types/AppSettingsCallbacks';
export type { default as AppSettingCategory } from './settings/types/AppSettingCategory';
export type { default as BooleanToggleSetting } from './settings/types/BooleanToggleSetting';
export type { default as DisablementRule } from './settings/types/DisablementRule';
export type { default as Heading } from './settings/types/Heading';
export type { default as Setting } from './settings/types/Setting';
export type { default as SettingBase } from './settings/types/SettingBase';
export type { default as SettingCategory } from './settings/types/SettingCategory';
export { default as SettingType } from './settings/types/SettingType';
export type { default as TextSetting } from './settings/types/TextSetting';
export type { default as ValidationFailure } from './settings/types/ValidationFailure';

// Explicitly opening the settings dialog
export { openSettings } from './settings/settingsUtil';
export { APP_CATEGORY_ID } from './settings/categories/appSettingsUtil';
export { LOGGING_CATEGORY_ID } from './settings/categories/loggingSettingsUtil';
export { LLM_CATEGORY_ID } from './settings/categories/llmSettingsUtil';

// Toasts - these complement the buttons that can be defined in app settings.
export { infoToast, errorToast, importantToast } from './components/toasts/toastUtil';

// Updating model device history and predicting problems
export { predictModelDeviceProblems, updateModelDevicePerformanceHistory, updateModelDeviceLoadHistory } from './models/modelUtil';

// Model Device Problems dialog
export { default as ModelDeviceProblemsDialog } from './models/ModelDeviceProblemsDialog';
export { default as ModelDeviceProblemType } from './models/types/ModelDeviceProblemType';
export type { default as ModelDeviceProblem } from './models/types/ModelDeviceProblem';
export type { default as ModelDeviceHistory } from './models/types/ModelDeviceHistory';

// Logging
export { log } from './localLogging/logUtil';

/* v8 ignore end */