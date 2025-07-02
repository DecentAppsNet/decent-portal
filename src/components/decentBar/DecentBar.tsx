import { useEffect, useRef, useState, JSX } from 'react';

import styles from './DecentBar.module.css';
import ContentButton from '@/components/contentButton/ContentButton';
import { getBaseUrl } from './decentBarUtil';
import DecentBarCssOverrides from './types/DecentBarCssOverrides';
import Link from './types/Link';
import SettingsIcon from './icons/cog.svg';
import SettingsDialog from '@/settings/settingsDialog/SettingsDialog';
import { LoadAppSettingsCallback, SaveAppSettingsCallback, ValidateSettingCallback } from '@/settings/types/AppSettingsCallbacks';
import AppSettingCategory from '@/settings/types/AppSettingCategory';
import ToastPane from '../toasts/ToastPane';
import { init } from './interactions/initialization';

// Default domains where the decent bar is rendered. Can be overridden in props.
const DEFAULT_ENABLED_DOMAINS = ['decentapps.net', '127.0.0.1', 'localhost'];

/**
 * Props for the DecentBar component.
 * @typedef {Object} Props
 * @property {string} appName - The name of the application displayed in the bar.
 * @property {Link[]} [appLinks] - Optional array of links displayed as buttons in the bar.
 * @property {string} [contributorText] - Optional text displayed in the contributor section.
 * @property {string[]} [enabledDomains] - Optional list of domains where the bar is enabled. Defaults to ['decentapps.net', '127.0.0.1', 'localhost'].
 * @property {string} [homeUrl] - Optional URL for the home link. Defaults to the base URL.
 * @property {(link: Link) => void} [onClickLink] - Optional callback for handling link clicks. Defaults to `defaultOnClickLink`.
 * @property {DecentBarCssOverrides} [classNameOverrides] - Optional overrides for CSS class names.
 * @property {AppSettingCategory} [defaultAppSettings] - Optional default application settings.
 * @property {LoadAppSettingsCallback} [onLoadAppSettings] - Optional callback for loading application settings.
 * @property {SaveAppSettingsCallback} [onSaveAppSettings] - Optional callback for saving application settings.
 * @property {ValidateSettingCallback} [onValidateSetting] - Optional callback for validating application settings.
 */
type Props = {
  appName:string,
  appLinks?:Link[],
  contributorText?:string,
  enabledDomains?:string[],
  homeUrl?:string,
  onClickLink?:(link:Link) => void,
  classNameOverrides?:DecentBarCssOverrides,
  defaultAppSettings?:AppSettingCategory,
  onLoadAppSettings?:LoadAppSettingsCallback,
  onSaveAppSettings?:SaveAppSettingsCallback,
  onValidateSetting?:ValidateSettingCallback
}

/**
 * Default callback for handling link clicks.
 * Opens the link in a new tab if it is an external link, or in the same tab if it is on the same domain.
 * Logs an error if the link URL does not start with "http".
 * @param {Link} link - The link object containing the URL and description.
 */
export function defaultOnClickLink(link:Link) {
  if (link.url.startsWith('http')) {
    const isSameDomain = link.url.startsWith(getBaseUrl());
    const target = isSameDomain ? '_self' : '_blank';
    window.open(link.url, target);
  } else {
    console.error('Link URL does not start with "http"--navigation canceled.', link.url);
  }
}

function _appLinksContent(links:Link[], onClickLink:Function) {
  if (!links.length) return <>&nbsp;</>; // Returning something keeps the layout from breaking or needing more complexity to handle empty links.
  const linkButtons = links.map((link, buttonNo) => {
    return (
      <ContentButton key={buttonNo} text={link.description} onClick={() => {onClickLink(link)}}/>
     ); 
  });
  return <>Links:<br />{linkButtons}</>;
}

function _createDefaultAppSettings(appName:string):AppSettingCategory {
  return {
    description: `There are no settings for ${appName}. But this is where you’d find them if they existed!`,
    settings: []
  }
}

/**
 * DecentBar component.
 * Renders a customizable bar with application links, contributor text, and settings.
 * @param {Props} props - The props for the DecentBar component.
 * @returns {JSX.Element | null} The rendered DecentBar component or null if conditions are not met.
 */
function DecentBar({ 
    appName, 
    appLinks, 
    contributorText, 
    onClickLink = defaultOnClickLink, 
    enabledDomains = DEFAULT_ENABLED_DOMAINS, 
    homeUrl = getBaseUrl(),
    classNameOverrides = {},
    defaultAppSettings,
    onLoadAppSettings,
    onSaveAppSettings,
    onValidateSetting
  }: Props): JSX.Element | null {
  const initialAppSettings = useRef<AppSettingCategory>(defaultAppSettings || _createDefaultAppSettings(appName));
  const [favIconUrl, setFavIconUrl] = useState<string | null>(null);
  const [modalDialogName, setModalDialogName] = useState<string | null>(null);

  useEffect(() => {
    init(enabledDomains).then(initResults => {
      if (!initResults.isDecentBarEnabled) {
        console.log('DecentBar did not render because the current domain is not in the enabled domains list.'); // This is sometimes what the developer wants.
        return;
      }
      if (!initResults.favIconUrl) {
        console.error('DecentBar did not render because no favicon image was set.');
        return;
      }
      setFavIconUrl(initResults.favIconUrl);
    });
  }, []);

  if (!favIconUrl) return null; // First render, no favicon is found, or not serving from an enabled domain.

  const appLinksContent = _appLinksContent(appLinks || [], onClickLink);

  const containerClassName = `${styles.container} ${classNameOverrides?.container ?? ''}`;
  const decentFacetClassName = `${styles.decentFacet} ${classNameOverrides?.decentFacet ?? ''}`;
  const favIconClassName = `${styles.favIcon} ${classNameOverrides?.favIcon ?? ''}`;
  const appFacetClassName = `${styles.appFacet} ${classNameOverrides?.appFacet ?? ''}`;
  const appNameClassName = `${styles.appName} ${classNameOverrides?.appName ?? ''}`;
  const appButtonAreaClassName = `${styles.appButtonArea} ${classNameOverrides?.appButtonArea ?? ''}`;
  const appFacetSeparatorClassName = `${styles.appFacetSeparator} ${classNameOverrides?.appFacetSeparator ?? ''}`;
  const contributorFacetClassName = `${styles.contributorFacet} ${classNameOverrides?.contributorFacet ?? ''}`;
  const settingsIconClassName = `${styles.settingsIcon} ${classNameOverrides?.settingsIcon ?? ''}`;

  return (
    <>
      <div className={ containerClassName }>
        <div className={ decentFacetClassName }>
          <a href={homeUrl}>
            <img src={favIconUrl} className={ favIconClassName } draggable="false"/>
          </a>  
        </div>
        <div className={ appFacetClassName }>
          <div className={ appNameClassName }>{appName}</div>
          <div className={ appButtonAreaClassName }>
            {appLinksContent}
          </div>
        </div>
        <div className={ appFacetSeparatorClassName }/>
        <div className={ contributorFacetClassName }>
          {contributorText}
          <img src={SettingsIcon} className={settingsIconClassName} alt="Device Settings" onClick={() => setModalDialogName(SettingsDialog.name)}/>
        </div>
      </div>
      <SettingsDialog 
        isOpen={modalDialogName === SettingsDialog.name} 
        defaultAppSettings={initialAppSettings.current} 
        onClose={() => setModalDialogName(null)} 
        onLoadAppSettings={onLoadAppSettings}
        onSaveAppSettings={onSaveAppSettings}
        onValidateSetting={onValidateSetting}
      />
      <ToastPane />
    </>
  )
}

export default DecentBar;