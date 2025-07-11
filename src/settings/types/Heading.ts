// Avoid use of "@" alias in type file imports so that types exported from the library don't include them.
export const HEADING_TYPE = 'HEADING';

// Headings don't hold settings, and aren't (de)serialized to storage. They are used for visually grouping in UI.
// The label value is displayed as informational text. Clickable buttons can optionally be added to the heading.
type Heading = {
  id?:string,
  description?:string,
  precedeSettingId:string|null, // The id of the setting for this heading to precede, or null if it comes after all settings in the category.
  buttons?:{label:string, value:string}[],
  onButtonClick?:(value:string) => void,
}

export function duplicateHeading(heading:Heading):Heading {
  return {
    ...heading, 
    buttons: heading.buttons ? [...heading.buttons] : undefined
  };
}

export default Heading;