import DecentBar from './components/decentBar/DecentBar';
import Link from './components/decentBar/types/Link';
import { getBaseUrl } from './components/decentBar/decentBarUtil';
import style from './Gallery.module.css'
import SettingType from './settings/types/SettingType';
import TextSetting from './settings/types/TextSetting';
import BooleanToggleSetting from './settings/types/BooleanToggleSetting';
import SettingCategory from './settings/types/SettingCategory';
import NumericSetting from './settings/types/NumericSetting';
import Heading from './settings/types/Heading';

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
  const textSetting:TextSetting = {
    id: 'app-text-setting',
    type: SettingType.TEXT,
    label: 'App Text Setting',
    value: 'Default Text',
    placeholder: 'This is a text setting for the app.',
  }
  const booleanToggleSetting:BooleanToggleSetting = {
    id: 'app-boolean-toggle-setting',
    type: SettingType.BOOLEAN_TOGGLE,
    label: 'App Boolean Toggle Setting',
    value: true,
    trueLabel: 'Enabled',
    falseLabel: 'Disabled'
  }
  const numericSetting:NumericSetting = {
    id: 'app-numeric-setting',
    type: SettingType.NUMERIC,
    label: 'App Numeric Setting',
    value: 52,
    min: 0,
    max: 100
  }
  const heading:Heading = {
    id: 'app-heading',
    type: SettingType.HEADING,
    label: 'Special Settings',
    buttons: [
      { label: 'Button 1', value: 'button1' },
      { label: 'Button 2', value: 'button2' }
    ],
    onButtonClick: (value) => {
      window.alert(`Button clicked: ${value}`);
    }
  }
  const defaultAppSettings:SettingCategory = {
    name: 'This App',
    description: `These are some great settings. You're going to love them.`,
    settings: [textSetting,booleanToggleSetting,heading,numericSetting]
  };
  return <>
    <h3>Test: Settings Dialog</h3>
    <DecentBar
      appName="My App"
      defaultAppSettings={defaultAppSettings}
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
