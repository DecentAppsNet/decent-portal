import { baseUrl } from "@/common/urlUtil";

/* v8 ignore start */
export function isServingFromEnabledDomain(enabledDomains:string[]):boolean {
  const currentDomain = window.location.hostname.toLowerCase();
  return enabledDomains.some(domain => currentDomain === domain.toLowerCase() || currentDomain.endsWith(`.${domain.toLowerCase()}`));
}

export function getBaseUrl():string {
  return baseUrl(window.location.href);
}
/* v8 ignore end */