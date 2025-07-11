import SettingCategory from "@/settings/types/SettingCategory";
import { ValidateSettingCallback } from "../types/AppSettingsCallbacks";
import Setting from "@/settings/types/Setting";
import styles from "./SettingCategoryPanel.module.css";
import SettingType from "@/settings/types/SettingType";
import BooleanToggleSetter from "./setters/BooleanToggleSetter";
import NumericSetter from "./setters/NumericSetter";
import TextSetter from "./setters/TextSetter";
import Heading from "./setters/Heading";
import { useState } from "react";
import { collateSettingRows, findDisabledSettings } from "@/settings/settingsUtil";
import { HEADING_TYPE } from "@/settings/types/Heading";
import BooleanToggleSetting from "@/settings/types/BooleanToggleSetting";
import NumericSetting from "@/settings/types/NumericSetting";
import TextSetting from "@/settings/types/TextSetting";

type Props = {
  category:SettingCategory,
  isOpen:boolean,
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

  const setterRows = collateSettingRows(category);
  if (!setterRows.length) return <p>No settings are available.</p>;
  
  const disabledSettings = findDisabledSettings(category);
  return setterRows.map((settingRow, settingRowNo) => {
    const settingNo = category.settings.findIndex((s) => s.id === settingRow.id);
    switch (settingRow.type) {
      case SettingType.BOOLEAN_TOGGLE:
        const booleanToggleSetting = settingRow as BooleanToggleSetting; 
      return <BooleanToggleSetter key={settingRow.id} setting={booleanToggleSetting}
        onValidateSetting={onValidateSetting} 
        onChange={(nextSetting, isValid) => _onChangeSetting(category, settingNo, nextSetting, isValid, validities, setValidities, onChange)} 
        disabled={disabledSettings.includes(booleanToggleSetting.id)}
      />

      case SettingType.NUMERIC:
        const numericSetting = settingRow as NumericSetting;
      return <NumericSetter key={settingRow.id} setting={numericSetting}
        onValidateSetting={onValidateSetting} 
        onChange={(nextSetting, isValid) => _onChangeSetting(category, settingNo, nextSetting, isValid, validities, setValidities, onChange)} 
        disabled={disabledSettings.includes(numericSetting.id)}
      />

      case SettingType.TEXT:
        const textSetting = settingRow as TextSetting;
      return <TextSetter key={settingRow.id} setting={textSetting}
        onValidateSetting={onValidateSetting}
        onChange={(nextSetting, isValid) => _onChangeSetting(category, settingNo, nextSetting, isValid, validities, setValidities, onChange)} 
        disabled={disabledSettings.includes(textSetting.id)}
      />

      case HEADING_TYPE:
      return <Heading key={`heading@${settingRowNo}`} heading={settingRow} />
      
      default:
        throw Error('Unexpected');
    }
  });
}

function SettingCategoryPanel({ category, onValidateSetting, onChange, isOpen }: Props) {
  const [validities, setValidities] = useState<boolean[]>(Array(category.settings.length).fill(true));

  const settersContent = _renderSetters(category, validities, setValidities, onChange, onValidateSetting);

  if (!isOpen) return null;
  
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