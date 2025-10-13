import ContentButton from '@/components/contentButton/ContentButton';
import DecentBar from '@/components/decentBar/DecentBar';
import { baseUrl } from '@/common/urlUtil';
import Link from '@/components/decentBar/types/Link';
import { APP_CATEGORY_ID } from '@/settings/categories/appSettingsUtil';
import { LLM_CATEGORY_ID } from '@/settings/categories/llmSettingsUtil';
import { LOGGING_CATEGORY_ID } from '@/settings/categories/loggingSettingsUtil';
import { openSettings } from '@/settings/settingsUtil';
import AppSettingCategory from '@/settings/types/AppSettingCategory';
import SettingType from '@/settings/types/SettingType';
import ValidationFailure, { LAST_VALID_VALUE } from '@/settings/types/ValidationFailure';
import styles from './Gallery.module.css' // Import this after the other imports to preserve intended order for CSS overrides.

function _testMinimal() {
  return <>
    <h3>Test: Minimal DecentBar</h3>
    <DecentBar />
    App name should be "Decent Portal Test" from app metadata.
  </>;
}

function _testShortAppName() {
  return <>
    <h3>Test: Displays Short App Name</h3>
    <DecentBar appName="."/>
  </>;
}

function _testLongAppName() {
  return <>
    <h3>Test: Displays Long App Name</h3>
    <DecentBar appName="Such a Lengthy App Name"/>
  </>;
}

function _testLongAppNameWithNoSpaces() {
  return <>
    <h3>Test: Displays Long App Name with No Spaces</h3>
    <DecentBar appName="SuchALengthyAppName"/>
  </>;
}

function _testLinks() {
  const _baseUrl = baseUrl();
  const links = [
    { description: 'WebLLM', url: 'https://webllm.mlc.ai/' },
    { description: 'Github', url: 'https://github.com/erikh2000/decent-portal' },
    { description: 'Fun 404', url: `${_baseUrl}/nonexistent` }
  ];
  return <>
    <h3>Test: Has Clickable Links</h3>
    <DecentBar appName="My App" appLinks={links}/>
  </>;
}

function _testLinkClickHandler() {
  const links = [
    { description: 'test 1', url: 'one' },
    { description: 'test 2', url: 'two' },
    { description: 'test 3', url: 'three' },
  ];
  function _onClickLink(link:Link) {
    window.alert(`Link URL = ${link.url}`);
  }
  return <>
    <h3>Test: Custom Handles Links</h3>
    <DecentBar appName="My App" appLinks={links} onClickLink={_onClickLink}/>
  </>;
}

function _testNoRenderOnDisabledDomain() {
  return <>
    <h3>Test: Does Not Render if Not Matching Domain</h3>
    <DecentBar appName="My App" enabledDomains={[]}/>
    <p>If you don't see a DecentBar just above this line, the test passed.</p>
  </>;
}

function _testContributors() {
  return <>
    <h3>Test: Shows Contributors</h3>
    <DecentBar
      appName="My App"
      contributorText="John Doe, Jane Smith"
    />
  </>;
}

function _testOverrideHomeUrl() {
  return <>
    <h3>Test: Override Home URL</h3>
    <DecentBar
      appName="My App"
      homeUrl="https://decentapps.net/info/tags/blog/"
    />
  </>;
}

export function _testOverrideCss() {
  return <>
  <h3>Test: Override CSS</h3>
    <DecentBar
      appName="My App"
      classNameOverrides={{
        container: styles.customContainer,
        appFacet: styles.customAppFacet,
        appName: styles.customAppName,
        contributorFacet: styles.customContributorFacet,
        favIcon: styles.customFavIcon,
        settingsIcon: styles.customSettingsIcon,
      }}
    />
  </>;
}

function _testAppSettings() {
  const defaultAppSettings:AppSettingCategory = {
    description: `These are some great settings. You're going to love them.`,
    settings: [
      {id:'1a', type:SettingType.BOOLEAN_TOGGLE, label:'Default', value:true},
      {id:'1b', type:SettingType.BOOLEAN_TOGGLE, label:'False value', value:false},
      {id:'1c', type:SettingType.BOOLEAN_TOGGLE, label:'Custom True/False Labels', value:true, trueLabel:'True', falseLabel:'False'},
      {id:'1d', type:SettingType.BOOLEAN_TOGGLE, label:'Should Say Yes', value:true},
      {id:'1e', type:SettingType.BOOLEAN_TOGGLE, label:'Should Say No', value:false},
      {id:'1f', type:SettingType.BOOLEAN_TOGGLE, label:'Must Say Yes', value:true},
      {id:'1g', type:SettingType.BOOLEAN_TOGGLE, label:'Must Say No', value:false},
      {id:'2a', type:SettingType.TEXT, label:'Default', value:'Default Text'},
      {id:'2b', type:SettingType.TEXT, label:'Placeholder', value:'', placeholder:'This is a placeholder'},
      {id:'2c', type:SettingType.TEXT, label:'Should Be Specified', value:'Valid Text'},
      {id:'2d', type:SettingType.TEXT, label:'Trim spaces', value:'Valid Text'},
      {id:'2e', type:SettingType.TEXT, label:'Must contain apple', value:'an apple'},
      {id:'3a', type:SettingType.NUMERIC, label:'Whole numbers 0-100', value:52, minValue:0, maxValue:100},
      {id:'3b', type:SettingType.NUMERIC, label:'Decimals 0-1', value:0.52, minValue:0, maxValue:1, allowDecimals:true},
      {id:'3c', type:SettingType.NUMERIC, label:'Should be even 0-10', value:4, minValue:0, maxValue:10, allowDecimals:false},
      {id:'3d', type:SettingType.NUMERIC, label:'Must have < than 2 decimal places', value:0.5, minValue:0, maxValue:1, allowDecimals:true},
      {id:'5a', type:SettingType.BOOLEAN_TOGGLE, label:'Enable settings below?', value:true},
      {id:'5b', type:SettingType.NUMERIC, label:'Numeric setting', value:5, minValue:0, maxValue:10, allowDecimals:false},
      {id:'5c', type:SettingType.TEXT, label:'Text setting', value:'Some text'},
      {id:'5d', type:SettingType.BOOLEAN_TOGGLE, label:'Boolean setting', value:true},
    ],
    headings: [
      {precedeSettingId:'1a', description:'Boolean Toggle Examples'},
      {precedeSettingId:'2a', description:'Text Examples'},
      {precedeSettingId:'3a', description:'Numeric Examples'},
      {precedeSettingId:'5a', description:'Disablement Handling Examples'},
    ],
    disablementRules: [
      { targetSettingId:'5b', criteriaSettingId:'5a', criteriaValue:false },
      { targetSettingId:'5c', criteriaSettingId:'5a', criteriaValue:false },
      { targetSettingId:'5d', criteriaSettingId:'5a', criteriaValue:false },
      { targetSettingId:'5e', criteriaSettingId:'5a', criteriaValue:false }
    ]
  };
  
  function _onValidateSetting(settingId:string, settingValue:any):ValidationFailure|null {
    switch (settingId) {
      case '1d': return !settingValue ? { failReason:'Say yes!' } : null;
      case '1e': return !!settingValue ? { failReason:'Say no!' } : null;
      case '1f': return !!settingValue ? { failReason:'Yes required.', nextValue:LAST_VALID_VALUE } : null;
      case '1g': return !!settingValue ? { failReason:'No required.', nextValue:LAST_VALID_VALUE } : null;
      case '2c': return settingValue.length ? null : { failReason:'Should be specified.' };
      case '2d': 
        const originalValue = settingValue as string;
        const nextValue = originalValue.trim();
      return nextValue === originalValue ? null : { nextValue };
      
      case '2e': 
      return (settingValue as string).includes('apple') ? null : { failReason:'Must contain "apple".', nextValue:LAST_VALID_VALUE };
      
      case '3c':
      return (settingValue as number) % 2 !== 0 ? { failReason:'Should be even.' } : null;

      case '3d': 
        const roundedValue = Math.round(settingValue * 10) / 10; // Round to 1 decimal place
      return roundedValue !== settingValue ? { failReason:'Must have less than 2 decimal places.', nextValue:roundedValue } : null;

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
    <p>Use gear in DecentBar or...</p>
    <ContentButton text='App Settings' onClick={() => openSettings(APP_CATEGORY_ID)} />
    <ContentButton text='Logging Settings' onClick={() => openSettings(LOGGING_CATEGORY_ID)} />
    <ContentButton text='LLM Settings' onClick={() => openSettings(LLM_CATEGORY_ID)} />
  </>;
}

function DecentBarTests() {
  return <>
    <h2>DecentBar Tests</h2>
    {_testMinimal()}
    {_testShortAppName()}
    {_testLongAppName()}
    {_testLongAppNameWithNoSpaces()}
    {_testLinks()}
    {_testLinkClickHandler()}
    {_testContributors()}
    {_testNoRenderOnDisabledDomain()}
    {_testOverrideHomeUrl()}
    {_testOverrideCss()}
    {_testAppSettings()}
  </>;
}

export default DecentBarTests;