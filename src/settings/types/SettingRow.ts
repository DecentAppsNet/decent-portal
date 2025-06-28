import Heading, { HEADING_TYPE } from "@/settings/types/Heading";
import Setting from "@/settings/types/Setting";
import SettingType from "./SettingType";

type SettingRow = (Heading|Setting) & {
  type:SettingType | typeof HEADING_TYPE
};

export default SettingRow;