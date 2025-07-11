import { useState } from 'react';

import DecentBar from './components/decentBar/DecentBar';
import Link from './components/decentBar/types/Link';
import { getBaseUrl } from './components/decentBar/decentBarUtil';
import style from './Gallery.module.css'
import SettingType from './settings/types/SettingType';
import Setting from './settings/types/Setting';
import ValidationFailure, { LAST_VALID_VALUE } from './settings/types/ValidationFailure';
import BooleanToggleSetting from './settings/types/BooleanToggleSetting';
import TextSetting from './settings/types/TextSetting';
import NumericSetting from './settings/types/NumericSetting';
import AppSettingCategory from './settings/types/AppSettingCategory';
import ModelDeviceProblem from './models/types/ModelDeviceProblem';
import ModelDeviceProblemType from './models/types/ModelDeviceProblemType';
import ModelDeviceProblemDialog from './models/ModelDeviceProblemsDialog';
import ContentButton from './components/contentButton/ContentButton';
import { predictModelDeviceProblems } from './models/modelUtil';

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
        const roundedValue = Math.round(numericSetting.value * 10) / 10; // Round to 1 decimal place
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

function _testModelDeviceProblems(modalDialogName:string|null, setModalDialogName:Function) {
  const DIALOG_NAME = ModelDeviceProblemDialog.name;
  const problems:ModelDeviceProblem[] = [
    {type:ModelDeviceProblemType.BAD_LOAD_SUCCESS_HISTORY, description:`The model didn't load before.`},
    {type:ModelDeviceProblemType.BAD_PERFORMANCE_HISTORY, description:`The model performed poorly before.`},
    {type:ModelDeviceProblemType.INSUFFICIENT_STORAGE, description:`You might not have enough storage for this bad boy.`},
    {type:ModelDeviceProblemType.INSUFFICIENT_VRAM, description:`Got enough VRAM? I don't think so, buddy.`},
    {type:ModelDeviceProblemType.DEVELOPER_MODE, description:`We aren't actually loading a model. This is just a UI test!`}
  ];
  return <>
    <h3>Test: Model Device Problems Dialog</h3>
    <ModelDeviceProblemDialog 
      modelId={'Fake Model'}
      isOpen={modalDialogName === DIALOG_NAME}
      problems={problems}
      onConfirm={() => setModalDialogName(null)}
      onCancel={() => setModalDialogName(null)}
    />
    <ContentButton onClick={() => setModalDialogName(DIALOG_NAME)} text='Open' />
  </>;
}

function _testModelDeviceProblemsDevMode(modalDialogName:string|null, setModalDialogName:Function) {
  const DIALOG_NAME = `${ModelDeviceProblemDialog.name}2`;
  const problems:ModelDeviceProblem[] = [
    {type:ModelDeviceProblemType.DEVELOPER_MODE, description:`We aren't actually loading a model. This is just a UI test!`}
  ];
  return <>
    <h3>Test: Model Device Problems Dialog - Developer Mode</h3>
    <ModelDeviceProblemDialog 
      modelId={'Fake Model'}
      isOpen={modalDialogName === DIALOG_NAME}
      problems={problems}
      onConfirm={() => setModalDialogName(null)}
      onCancel={() => setModalDialogName(null)}
    />
    <ContentButton onClick={() => setModalDialogName(DIALOG_NAME)} text='Open' />
  </>;
}

function _testModelDeviceProblemsRealData(modalDialogName:string|null, 
    modelDeviceProblems:ModelDeviceProblem[]|null, setModelDeviceProblems:Function, setModalDialogName:Function) {
  const DIALOG_NAME = `${ModelDeviceProblemDialog.name}3`;
  const MODEL_ID = "Llama-3-70B-Instruct-q3f16_1-MLC"; // A larger model more likely to have problems.
  if (!modelDeviceProblems) modelDeviceProblems = [];
  return <>
    <h3>Test: Model Device Problems Dialog - Real Device Data</h3>
    <ModelDeviceProblemDialog 
      isOpen={modalDialogName === DIALOG_NAME}
      modelId={MODEL_ID}
      problems={modelDeviceProblems}
      onConfirm={() => setModalDialogName(null)}
      onCancel={() => setModalDialogName(null)}
    />
    <ContentButton onClick={async () => {
      const nextProblems = await predictModelDeviceProblems(MODEL_ID);
      setModelDeviceProblems(nextProblems);
      if (nextProblems) { 
        setModalDialogName(DIALOG_NAME);
      } else {
        alert(`No problems found for loading ${MODEL_ID} on this device.`);
      }
    }} text='Check for Problems' />
  </>;
}

function Gallery() {
  const [modalDialogName, setModalDialogName] = useState<string|null>(null);
  const [modelDeviceProblems, setModelDeviceProblems] = useState<ModelDeviceProblem[]|null>(null);

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

      <h2>Model Device Problems Tests</h2>
      { _testModelDeviceProblems(modalDialogName, setModalDialogName) }
      { _testModelDeviceProblemsDevMode(modalDialogName, setModalDialogName) }
      { _testModelDeviceProblemsRealData(modalDialogName, modelDeviceProblems, setModelDeviceProblems, setModalDialogName) }
    </div>
  );
}

export default Gallery;
