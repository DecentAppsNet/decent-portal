import Setting from "@/settings/types/Setting";
import ValidationFailure from "@/settings/types/ValidationFailure";

/*  Called when settings dialog is opened and loaded app settings have not yet been shown.
    App code may use this to provide its own loading mechanism for settings, or
    to perform upgrades to existing setting, e.g. new settings added, or existing settings 
    changed.

    @param appSettings  Existing settings, null if no settings were available to load.
    @return
      null to make no changes/upgrades to settings, or 
      an array of overriding settings. 
*/

export type LoadAppSettingsCallback = (appSettings:Setting[]|null) => null|Setting[];

/*  Called when the user initiates a save of the settings. App code may use this to
    provide its own saving mechanism for settings.

    @param appSettings  Settings that contain modifications made by the user.
    @return
      null to not save settings, (implies app code will handle the save itself),
      an array of settings to save, which may or may not be the same as appSettings.
*/
export type SaveAppSettingsCallback = (appSettings:Setting[]) => null|Setting[];

/* Called after each change user makes to a setting. 

    @param appSetting - User-provided change to a setting.
    @return
      null if change is valid, or
      validation failure describing handling. Causes "Save" to be disabled.
*/
export type ValidateSettingCallback = (appSetting:Setting) => ValidationFailure|null;