import SettingCategory from "@/settings/types/SettingCategory";
import { ValidateSettingCallback } from "./types/AppSettingsCallbacks";
import Setting from "@/settings/types/Setting";
import styles from "./SettingCategoryPanel.module.css";
import SettingType from "@/settings/types/SettingType";
import BooleanToggleSetter from "./setters/BooleanToggleSetter";
import NumericSetter from "./setters/NumericSetter";
import TextSetter from "./setters/TextSetter";
import Heading from "./setters/Heading";
import { useState } from "react";

type Props = {
  category:SettingCategory,
  onChange:(nextCategory:SettingCategory, isValid:boolean) => void,
  onValidateSetting?:ValidateSettingCallback
};

function _onChangeSetting(category:SettingCategory, settingNo:number, nextSetting:Setting, 
  isValid:boolean, validities:boolean[], setValidities:Function, 
  onChange:Function) {
  
  const nextCategoryValidities = [...validities];
  if (validities[settingNo] !== isValid) {  
    nextCategoryValidities[settingNo] = isValid;
    setValidities(nextCategoryValidities);
  }
  const isEverySettingValid = !nextCategoryValidities.includes(false);

  const nextCategory = { ...category };
  nextCategory.settings[settingNo] = nextSetting;
  onChange(nextCategory, isEverySettingValid);
}

function _renderSetters(category:SettingCategory, validities:boolean[], setValidities:Function, 
    onChange:Function, onValidateSetting?:ValidateSettingCallback) {
  return category.settings.map((setting, settingNo) => {
    switch (setting.type) {
      case SettingType.BOOLEAN_TOGGLE: 
      return <BooleanToggleSetter key={setting.id} setting={setting} 
        onValidateSetting={onValidateSetting} 
        onChange={(nextSetting, isValid) => _onChangeSetting(category, settingNo, nextSetting, isValid, validities, setValidities, onChange)} 
      />

      case SettingType.NUMERIC:
      return <NumericSetter key={setting.id} setting={setting} 
        onValidateSetting={onValidateSetting} 
        onChange={(nextSetting, isValid) => _onChangeSetting(category, settingNo, nextSetting, isValid, validities, setValidities, onChange)} 
      />

      case SettingType.TEXT:
      return <TextSetter key={setting.id} setting={setting} 
        onValidateSetting={onValidateSetting}
        onChange={(nextSetting, isValid) => _onChangeSetting(category, settingNo, nextSetting, isValid, validities, setValidities, onChange)} 
      />

      case SettingType.HEADING:
      return <Heading key={setting.id} heading={setting} />
      
      default:
        throw Error('Unexpected');
    }
  });
}

function SettingCategoryPanel({ category, onValidateSetting, onChange }: Props) {
  const [validities, setValidities] = useState<boolean[]>(Array(category.settings.length).fill(true));
  const settersContent = _renderSetters(category, validities, setValidities, onChange, onValidateSetting);
  
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