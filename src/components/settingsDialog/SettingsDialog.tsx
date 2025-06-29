import { useState, useEffect, useRef, useMemo } from "react";

import ModalDialog from "@/components/modalDialogs/ModalDialog";
import Setting from "@/settings/types/Setting";
import { LoadAppSettingsCallback, SaveAppSettingsCallback, ValidateSettingCallback } from "@/settings/types/AppSettingsCallbacks";
import SettingCategory from "@/settings/types/SettingCategory";
import { init } from "./interactions/initialization";
import SettingCategorySelector from "./SettingCategorySelector";
import SettingCategoryPanel from "./SettingCategoryPanel";
import DialogFooter from "../modalDialogs/DialogFooter";
import DialogButton from "../modalDialogs/DialogButton";
import AppSettingCategory from "@/settings/types/AppSettingCategory";
import { saveAndClose } from "./interactions/saving";

// The settings dialog is intended to eventually contain cross-device settings. But as I write this, there are no
// cross-device capabilities. So the dialog has the title "Device Settings" for now, and later it may be renamed to "Settings",
// with some indication in category panels that the settings are device-specific or cross-device.

type Props = {
  isOpen:boolean,
  defaultAppSettings:AppSettingCategory,
  onClose:(appSettings:Setting[]) => void,
  onLoadAppSettings?:LoadAppSettingsCallback,
  onSaveAppSettings?:SaveAppSettingsCallback,
  onValidateSetting?:ValidateSettingCallback
}

function SettingsDialog({isOpen, defaultAppSettings, onClose, onLoadAppSettings, onSaveAppSettings, onValidateSetting}: Props) {
  const initialAppSettingsRef = useRef<AppSettingCategory>(defaultAppSettings);
  const [categories, setCategories] = useState<SettingCategory[]>([]);
  const [selectedCategoryNo, setSelectedCategoryNo] = useState(0);
  const [categoryValidities, setCategoryValidities] = useState<boolean[]>(Array(categories.length).fill(true));

  const categoryNames = useMemo(() => categories.map(c => c.name), [categories]);

  function _updateCategory(categoryNo:number, nextCategory:SettingCategory, isValid:boolean) {
    const nextCategoryValidities = [...categoryValidities];
    if (categoryValidities[categoryNo] !== isValid) {
      nextCategoryValidities[categoryNo] = isValid;
      setCategoryValidities(nextCategoryValidities);
    }
    const nextCategories = [...categories];
    nextCategories[categoryNo] = nextCategory;
    setCategories(nextCategories);
  }

  useEffect(() => {
    if (!isOpen) return;
    init(initialAppSettingsRef.current, onLoadAppSettings).then(setCategories);
  }, [isOpen, onLoadAppSettings]);

  if (!isOpen || !categories.length) return null;

  const isSaveDisabled = categoryValidities.includes(false);

  return (
    <ModalDialog title="Device Settings" isOpen={isOpen} onCancel={() => onClose(categories[0].settings)}>
      <SettingCategorySelector selectedCategoryNo={selectedCategoryNo} categoryNames={categoryNames} onChange={setSelectedCategoryNo} disabled={isSaveDisabled} />
      { categories.map((category, categoryNo) => (
        <SettingCategoryPanel key={category.name} category={category} isOpen={selectedCategoryNo === categoryNo} 
          onValidateSetting={onValidateSetting}
          onChange={(nextCategory, isValid) => _updateCategory(categoryNo, nextCategory, isValid)} />
      )) }
      <DialogFooter>
        <DialogButton text="Cancel" onClick={onClose} />
        <DialogButton text="Save and Exit" onClick={() => saveAndClose(categories, onClose, onSaveAppSettings)} isPrimary disabled={isSaveDisabled}/>
      </DialogFooter>
    </ModalDialog>
  );
}

export default SettingsDialog;