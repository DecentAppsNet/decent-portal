import DisablementRule from "./DisablementRule";
import Heading from "./Heading";
import Setting from "./Setting";

// Same as SettingCategory, but without members that app code should not modify.
type AppSettingCategory = {
  description:string;
  headings?:Heading[];
  settings:Setting[];
  disablementRules?:DisablementRule[]; // Rules to disable settings based on other settings' values.
}

export default AppSettingCategory;