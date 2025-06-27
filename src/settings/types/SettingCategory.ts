import DisablementRule from "./DisablementRule";
import Setting from "./Setting";

type SettingCategory = {
  name:string;
  description:string;
  settings:Setting[];
  disablementRules?:DisablementRule[]; // Rules to disable settings based on other settings' values.
};

export default SettingCategory;