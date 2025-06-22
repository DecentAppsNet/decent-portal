import Setting from "./Setting";

type SettingCategory = {
  name: string;
  description?: string;
  settings: Setting[];
};

export default SettingCategory;