import BooleanToggleSetting from "./BooleanToggleSetting";
import Heading from "./Heading";
import NumericRangeSetting from "./NumericRangeSetting";
import TextSetting from "./TextSetting";

type Setting = 
  BooleanToggleSetting |
  Heading |
  NumericRangeSetting | 
  TextSetting;

export default Setting;