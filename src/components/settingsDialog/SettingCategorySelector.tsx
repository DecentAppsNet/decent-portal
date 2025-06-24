import Selector from "../selector/Selector"

type Props = {
  categoryNames: string[],
  selectedCategoryNo: number,
  onChange:(categoryNo: number) => void
}

function SettingsCategorySelector({ categoryNames, selectedCategoryNo, onChange }: Props) {
  return (
    <Selector optionNames={categoryNames} selectedOptionNo={selectedCategoryNo} onChange={onChange} displayAsTabs />
  );
}

export default SettingsCategorySelector;