/**
 * Represents CSS class name overrides for the DecentBar component.
 * @typedef {Object} DecentBarCssOverrides
 * @property {string} [container] - Override for the container class.
 * @property {string} [decentFacet] - Override for the decent facet class.
 * @property {string} [favIcon] - Override for the favicon class.
 * @property {string} [appFacet] - Override for the app facet class.
 * @property {string} [appName] - Override for the app name class.
 * @property {string} [appButtonArea] - Override for the app button area class.
 * @property {string} [appFacetSeparator] - Override for the app facet separator class.
 * @property {string} [contributorFacet] - Override for the contributor facet class.
 * @property {string} [settingsIcon] - Override for the settings icon class.
 */

//These are coupled to the CSS classes in DecentBar.module.css.
type DecentBarCssOverrides = {
  container?: string;
  decentFacet?: string;
  appFacet?: string;
  appName?: string;
  appButtonArea?: string;
  appFacetSeparator?: string;
  contributorFacet?: string;
  favIcon?: string;
  settingsIcon?: string;
};

export default DecentBarCssOverrides;