import { useEffect, useState } from 'react';

import styles from './DecentBar.module.css';
import ContentButton from '@/components/contentButton/ContentButton';
import { getBaseUrl, isServingFromEnabledDomain } from './decentBarUtil';
import DecentBarCssOverrides from './types/DecentBarCssOverrides';

// Default domains where the decent bar is rendered. Can be overridden in props.
const DEFAULT_ENABLED_DOMAINS = ['decentapps.net', '127.0.0.1', 'localhost'];

type Props = {
  appName:string,
  appLinks?:Link[],
  contributorText?:string,
  enabledDomains?:string[],
  homeUrl?:string,
  onClickLink?:(link:Link) => void,
  classNameOverrides?:DecentBarCssOverrides
}

export function defaultOnClickLink(link:Link) {
  if (link.url.startsWith('http')) {
    const isSameDomain = link.url.startsWith(getBaseUrl());
    const target = isSameDomain ? '_self' : '_blank';
    window.open(link.url, target);
  } else {
    console.error('Link URL does not start with "http"--navigation canceled.', link.url);
  }
}

function _findFavIconLink() {
  return document.querySelector<HTMLLinkElement>('link[rel~="icon"][sizes="192x192"]') ||
    document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
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

function DecentBar({ 
    appName, 
    appLinks, 
    contributorText, 
    onClickLink = defaultOnClickLink, 
    enabledDomains = DEFAULT_ENABLED_DOMAINS, 
    homeUrl = getBaseUrl(),
    classNameOverrides = {} 
  }: Props) {
  const [favIconUrl, setFavIconUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isServingFromEnabledDomain(enabledDomains)) {
      console.log('DecentBar did not render because the current domain is not in the enabled domains list.'); // This is sometimes what the developer wants.
      return;
    }
    const link = _findFavIconLink();
    if (!link) { console.error('DecentBar did not render because no favicon image was set.'); return; }
    setFavIconUrl(link.href);
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

  return (
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
      </div>
    </div>
  )
}

export default DecentBar;