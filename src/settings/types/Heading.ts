import SettingBase from "./SettingBase"
import SettingType from "./SettingType"

// Headings don't hold settings, and aren't (de)serialized to storage. They are used for grouping.
// The label value is displayed as informational text. Clickable buttons can optionally be added to the heading.
type Heading = SettingBase & {
  type:SettingType.HEADING,
  buttons?:{label:string, value:string}[],
  onButtonClick?:(value:string) => void,
  indentLevel?:number
}

export default Heading;