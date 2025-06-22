import SettingCategory from "@/settings/types/SettingCategory";
import { ValidateSettingCallback } from "./types/AppSettingsCallbacks";
import Setting from "@/settings/types/Setting";
import styles from "./SettingCategoryPanel.module.css";

type Props = {
  category: SettingCategory,
  onChange: (nextCategory: SettingCategory) => void,
  onValidateSetting?: ValidateSettingCallback
};

function _renderSetters(settings:Setting[], _onValidateSetting?:ValidateSettingCallback) {
  return settings.map((setting) => {
    return <div key={setting.id}>{setting.label}</div>; // TODO
  });
}

function SettingCategoryPanel({ category, onValidateSetting }: Props) {
  const settersContent = _renderSetters(category.settings, onValidateSetting);
  return (
    <div className={styles.container}>
      <p>{category.description}</p>
      <div className={styles.setterList}>
        {settersContent}
      </div>
    </div>
  );
}

export default SettingCategoryPanel;