import Selector from "../selector/Selector"

type Props = {
  categoryNames: string[],
  selectedCategoryNo: number,
  onChange:(categoryNo: number) => void,
  disabled?: boolean
}

function SettingsCategorySelector({ categoryNames, selectedCategoryNo, onChange, disabled }: Props) {
  return (
    <Selector optionNames={categoryNames} selectedOptionNo={selectedCategoryNo} onChange={onChange} disabled={disabled} displayAsTabs />
  );
}

export default SettingsCategorySelector;