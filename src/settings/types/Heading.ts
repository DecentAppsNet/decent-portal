export const HEADING_TYPE = 'HEADING';

// Headings don't hold settings, and aren't (de)serialized to storage. They are used for visually grouping in UI.
// The label value is displayed as informational text. Clickable buttons can optionally be added to the heading.
type Heading = {
  id?:string, // Useful to specify if the heading needs to be referenced specifically.
  description?:string,
  precedeSettingId:string|null, // The id of the setting for this heading to precede, or null if it comes after all settings in the category.
  buttons?:{label:string, value:string}[],
  onButtonClick?:(value:string) => void,
}

export default Heading;