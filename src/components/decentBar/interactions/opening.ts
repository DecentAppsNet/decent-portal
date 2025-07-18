import { APP_CATEGORY_ID } from "@/settings/categories/appSettingsUtil";
import SettingsDialog from "@/settings/settingsDialog/SettingsDialog";
import SettingCategory from "@/settings/types/SettingCategory";
import { assert } from "@/common/assertUtil";

let theSetModalDialogName:Function|null = null;
let theOpeningCategoryId:string|null = null;

function _findCategoryNoById(categories:SettingCategory[], categoryId:string):number {
  if (categoryId.startsWith(APP_CATEGORY_ID)) return 0; // The app category is always the first one. Special-cased because matching ID is different.
  return categories.findIndex(category => category.id === categoryId);
}

export function initOpening(setModalDialogName:Function):void {
  theSetModalDialogName = setModalDialogName;
}

export function setOpeningCategoryId(categoryId:string|null):void {
  theOpeningCategoryId = categoryId;
}

export function findOpeningCategoryNo(categories:SettingCategory[]):number {
  /* v8 ignore next */
  assert(categories.length > 0);
  if (!theOpeningCategoryId) return 0; // Default to the first category if none is selected.
  const selectedCategoryNo = _findCategoryNoById(categories, theOpeningCategoryId);
  /* v8 ignore next */
  assert(selectedCategoryNo >= 0);
  return selectedCategoryNo;
}

export function openSettingsDialog(categoryId:string = APP_CATEGORY_ID):void {
  if (!theSetModalDialogName) throw Error('Call openSettingsDialog() only after the DecentBar component has been rendered.');
  setOpeningCategoryId(categoryId);
  theSetModalDialogName(SettingsDialog.name);
}