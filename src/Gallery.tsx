import DecentBar from './components/decentBar/DecentBar';
import Link from './components/decentBar/types/Link';
import { getBaseUrl } from './components/decentBar/decentBarUtil';
import style from './Gallery.module.css'
import SettingType from './settings/types/SettingType';
import SettingCategory from './settings/types/SettingCategory';
import Setting from './settings/types/Setting';
import ValidationFailure, { LAST_VALID_VALUE } from './components/settingsDialog/types/ValidationFailure';
import BooleanToggleSetting from './settings/types/BooleanToggleSetting';
import TextSetting from './settings/types/TextSetting';
import NumericSetting from './settings/types/NumericSetting';

function testMinimal() {
  return <>
    <h3>Test: Minimal DecentBar</h3>
    <DecentBar appName="My App"/>
  </>;
}

function testShortAppName() {
  return <>
    <h3>Test: Displays Short App Name</h3>
    <DecentBar appName="."/>
  </>;
}

function testLongAppName() {
  return <>
    <h3>Test: Displays Long App Name</h3>
    <DecentBar appName="Such a Lengthy App Name"/>
  </>;
}

function testLongAppNameWithNoSpaces() {
  return <>
    <h3>Test: Displays Long App Name with No Spaces</h3>
    <DecentBar appName="SuchALengthyAppName"/>
  </>;
}

function testLinks() {
  const baseUrl = getBaseUrl();
  const links = [
    { description: 'WebLLM', url: 'https://webllm.mlc.ai/' },
    { description: 'Github', url: 'https://github.com/erikh2000/decent-portal' },
    { description: 'Fun 404', url: `${baseUrl}/nonexistent` }
  ];
  return <>
    <h3>Test: Has Clickable Links</h3>
    <DecentBar appName="My App" appLinks={links}/>
  </>;
}

function testLinkClickHandler() {
  const links = [
    { description: 'test 1', url: 'one' },
    { description: 'test 2', url: 'two' },
    { description: 'test 3', url: 'three' },
  ];
  function _onClickLink(link: Link) {
    window.alert(`Link URL = ${link.url}`);
  }
  return <>
    <h3>Test: Custom Handles Links</h3>
    <DecentBar appName="My App" appLinks={links} onClickLink={_onClickLink}/>
  </>;
}

function testNoRenderOnDisabledDomain() {
  return <>
    <h3>Test: Does Not Render if Not Matching Domain</h3>
    <DecentBar appName="My App" enabledDomains={[]}/>
    <p>If you don't see a DecentBar just above this line, the test passed.</p>
  </>;
}

function testContributors() {
  return <>
    <h3>Test: Shows Contributors</h3>
    <DecentBar
      appName="My App"
      contributorText="John Doe, Jane Smith"
    />
  </>;
}

function testOverrideHomeUrl() {
  return <>
    <h3>Test: Override Home URL</h3>
    <DecentBar
      appName="My App"
      homeUrl="https://decentapps.net/info/tags/blog/"
    />
  </>;
}

function testOverrideCss() {
  return <>
  <h3>Test: Override CSS</h3>
    <DecentBar
      appName="My App"
      classNameOverrides={{
        container: style.customContainer,
        appFacet: style.customAppFacet,
        appName: style.customAppName,
        contributorFacet: style.customContributorFacet,
        favIcon: style.customFavIcon,
        settingsIcon: style.customSettingsIcon,
      }}
    />
  </>;
}

function testAppSettings() {
  const defaultAppSettings:SettingCategory = {
    name: 'This App',
    description: `These are some great settings. You're going to love them.`,
    settings: [
      {id:'1', type:SettingType.HEADING, label:'Boolean Toggle Examples'},
        {id:'1a', type:SettingType.BOOLEAN_TOGGLE, label:'Default', value:true},
        {id:'1b', type:SettingType.BOOLEAN_TOGGLE, label:'False value', value:false},
        {id:'1c', type:SettingType.BOOLEAN_TOGGLE, label:'Custom True/False Labels', value:true, trueLabel:'True', falseLabel:'False'},
        {id:'1d', type:SettingType.BOOLEAN_TOGGLE, label:'Should Say Yes', value:true},
        {id:'1e', type:SettingType.BOOLEAN_TOGGLE, label:'Should Say No', value:false},
        {id:'1f', type:SettingType.BOOLEAN_TOGGLE, label:'Must Say Yes', value:true},
        {id:'1g', type:SettingType.BOOLEAN_TOGGLE, label:'Must Say No', value:false},
      {id:'2', type:SettingType.HEADING, label:'Text Examples'},
        {id:'2a', type:SettingType.TEXT, label:'Default', value:'Default Text'},
        {id:'2b', type:SettingType.TEXT, label:'Placeholder', value:'', placeholder:'This is a placeholder'},
        {id:'2c', type:SettingType.TEXT, label:'Should Be Specified', value:'Valid Text'},
        {id:'2d', type:SettingType.TEXT, label:'Trim spaces', value:'Valid Text'},
        {id:'2e', type:SettingType.TEXT, label:'Must contain apple', value:'an apple'},
      {id:'3', type:SettingType.HEADING, label:'Numeric Examples'},
        {id:'3a', type:SettingType.NUMERIC, label:'Whole numbers 0-100', value:52, minValue:0, maxValue:100},
        {id:'3b', type:SettingType.NUMERIC, label:'Decimals 0-1', value:0.52, minValue:0, maxValue:1, allowDecimals:true},
        {id:'3c', type:SettingType.NUMERIC, label:'Should be even 0-10', value:4, minValue:0, maxValue:10, allowDecimals:false},
        {id:'3d', type:SettingType.NUMERIC, label:'Must have < than 2 decimal places', value:0.52, minValue:0, maxValue:1, allowDecimals:true},
      {id:'4', type:SettingType.HEADING, label:'Heading Examples'},
        {id:'4a', type:SettingType.HEADING, label:'Heading with Buttons', indentLevel:1, buttons: [
          { label: 'Button 1', value: 'button1' },
          { label: 'Button 2', value: 'button2' }
        ], onButtonClick: (value) => {
          window.alert(`Heading button clicked: ${value}`);
        }},
        {id:'4b', type:SettingType.HEADING, indentLevel:1, label:'Heading with lengthy label that should wrap to multiple lines if necessary.'}
    ]
  };
  
  function _onValidateSetting(setting:Setting):ValidationFailure|null {
    switch (setting.id) {
      case '1d': return !(setting as BooleanToggleSetting).value ? { failReason:'Say yes!' } : null;
      case '1e': return (setting as BooleanToggleSetting).value ? { failReason:'Say no!' } : null;
      case '1f': return !(setting as BooleanToggleSetting).value ? { failReason:'Yes required.', nextValue:LAST_VALID_VALUE } : null;
      case '1g': return (setting as BooleanToggleSetting).value ? { failReason:'No required.', nextValue:LAST_VALID_VALUE } : null;
      case '2c': return (setting as TextSetting).value.length ? null : { failReason:'Should be specified.' };
      case '2d': 
        const originalValue = (setting as TextSetting).value;
        const nextValue = originalValue.trim();
      return nextValue === originalValue ? null : { nextValue };
      
      case '2e': 
      return (setting as TextSetting).value.includes('apple') ? null : { failReason:'Must contain "apple".', nextValue:LAST_VALID_VALUE };
      
      case '3c':
      return (setting as NumericSetting).value % 2 !== 0 ? { failReason:'Should be even.' } : null;

      case '3d': 
        const numericSetting = setting as NumericSetting;
        // Round to 1 decimal place
        const roundedValue = Math.round(numericSetting.value * 10) / 10;
      return roundedValue !== numericSetting.value ? { failReason:'Must have less than 2 decimal places.', nextValue:roundedValue } : null;

      default: return null;
    }
  }

  return <>
    <h3>Test: Settings Dialog</h3>
    <DecentBar
      appName="My App"
      defaultAppSettings={defaultAppSettings}
      onValidateSetting={_onValidateSetting}
    />
  </>;
}

function Gallery() {
  return (
    <div className={style.container}>
      <h1>Decent Portal Test App</h1>

      <h2>DecentBar Tests</h2>
      { testMinimal() }
      { testShortAppName() }
      { testLongAppName() }
      { testLongAppNameWithNoSpaces() }
      { testLinks() }
      { testLinkClickHandler() }
      { testContributors() }
      { testNoRenderOnDisabledDomain() }
      { testOverrideHomeUrl() }
      { testOverrideCss() }
      { testAppSettings() }
    </div>
  );
}

export default Gallery;
