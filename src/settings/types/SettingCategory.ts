import DisablementRule from "./DisablementRule";
import Heading from "./Heading";
import Setting from "./Setting";

/* A category is a container for settings and the rules and presentation of them. Some setting-specific data
   (disablementRules) is purposefully put in the SettingCategory rather than in the Setting type to keep 
   the settings member representing data that changes and needs persistence. */
type SettingCategory = {
  name:string;
  description:string;
  headings?:Heading[];
  settings:Setting[];
  disablementRules?:DisablementRule[]; // Rules to disable settings based on other settings' values.
};

export default SettingCategory;