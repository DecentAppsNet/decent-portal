import BooleanToggleSetting from "./BooleanToggleSetting";
import NumericSetting from "./NumericSetting";
import TextSetting from "./TextSetting";

// Don't add any types that aren't intended to persist setting data. Presentation-only types can be added to SettingCategory type instead.
type Setting = 
  BooleanToggleSetting |
  NumericSetting | 
  TextSetting;

export default Setting;