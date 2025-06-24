import BooleanToggleSetting from "./BooleanToggleSetting";
import Heading from "./Heading";
import NumericSetting from "./NumericSetting";
import TextSetting from "./TextSetting";

type Setting = 
  BooleanToggleSetting |
  Heading |
  NumericSetting | 
  TextSetting;

export default Setting;