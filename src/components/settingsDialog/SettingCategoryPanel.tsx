import SettingCategory from "@/settings/types/SettingCategory";
import { ValidateSettingCallback } from "./types/AppSettingsCallbacks";
import Setting from "@/settings/types/Setting";
import styles from "./SettingCategoryPanel.module.css";
import SettingType from "@/settings/types/SettingType";
import BooleanToggleSetter from "./setters/BooleanToggleSetter";
import NumericSetter from "./setters/NumericSetter";
import TextSetter from "./setters/TextSetter";
import Heading from "./setters/Heading";

type Props = {
  category: SettingCategory,
  onChange: (nextCategory: SettingCategory) => void,
  onValidateSetting?: ValidateSettingCallback
};

function _renderSetters(settings:Setting[], _onValidateSetting?:ValidateSettingCallback) {
  return settings.map((setting) => {
    switch (setting.type) {
      case SettingType.BOOLEAN_TOGGLE: 
      return <BooleanToggleSetter key={setting.id} setting={setting} onValidateSetting={_onValidateSetting} onChange={(_nextSetting, _isValid) => { }} />

      case SettingType.NUMERIC:
      return <NumericSetter key={setting.id} setting={setting} onChange={(_nextSetting, _isValid) => { }} />

      case SettingType.TEXT:
      return <TextSetter key={setting.id} setting={setting} onValidateSetting={_onValidateSetting} onChange={(_nextSetting, _isValid) => { }} />

      case SettingType.HEADING:
      return <Heading key={setting.id} heading={setting} />
      
      default:
        throw Error('Unexpected');
    }
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