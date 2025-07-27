import ValidationFailure from "../../settings/types/ValidationFailure";
import SettingValues from "./SettingValues";

/*  Called when settings dialog is opened and loaded app settings have not yet been shown.
    App code may use this to provide its own loading mechanism for settings, or
    to perform upgrades to existing setting, e.g. new settings added, or existing settings 
    changed.

    @param appSettings  Existing settings, null if no settings were available to load.
    @return
      null to make no changes/upgrades to settings, or 
      an array of overriding settings. 
*/
export type LoadAppSettingsCallback = (appSettings:SettingValues|null) => null|SettingValues;

/*  Called when the user initiates a save of the settings. App code may use this to
    provide its own saving mechanism for settings.

    @param appSettings  Settings that contain modifications made by the user.
    @return
      null to not save settings, (implies app code will handle the save itself),
      an array of settings to save, which may or may not be the same as appSettings.
*/
export type SaveAppSettingsCallback = (appSettings:SettingValues) => null|SettingValues;

/* Called before each change user makes to a setting. 

    @param settingId - Which setting is changing.
    @param settingValue - The new user-supplied value of the setting, not yet applied.
    @return
      null if change is valid, or
      validation failure describing handling.
*/
export type ValidateSettingCallback = (settingId:string, settingValue:any) => ValidationFailure|null;