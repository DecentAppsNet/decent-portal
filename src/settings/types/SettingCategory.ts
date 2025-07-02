import DisablementRule, { duplicateDisablementRule } from "./DisablementRule";
import Heading, { duplicateHeading } from "./Heading";
import Setting, { duplicateSetting } from "./Setting";

/* A category is a container for settings and the rules for their presentation. Some setting-specific data
   (e.g., disablementRules) is purposefully put in the SettingCategory rather than in the Setting type to keep 
   the settings member representing data that changes and needs persistence. */
type SettingCategory = {
  id:string;
  name:string; // Display name shown on the settings page.
  description:string;
  headings?:Heading[];
  settings:Setting[];
  disablementRules?:DisablementRule[]; // Rules to disable settings based on other settings' values.
};

export function duplicateSettingCategory(category:SettingCategory):SettingCategory {
  return {
    name: category.name,
    id: category.id,
    description: category.description,
    headings: category.headings ? category.headings.map(duplicateHeading) : undefined,
    settings: category.settings.map(duplicateSetting),
    disablementRules: category.disablementRules ? category.disablementRules.map(duplicateDisablementRule) : undefined
  };
}

export default SettingCategory;