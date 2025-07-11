/* v8 ignore start */
export function isServingFromEnabledDomain(enabledDomains:string[]):boolean {
  const currentDomain = window.location.hostname.toLowerCase();
  return enabledDomains.some(domain => currentDomain === domain.toLowerCase() || currentDomain.endsWith(`.${domain.toLowerCase()}`));
}

export function getBaseUrl():string {
  const url = new URL(window.location.href);
  return `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}`;
}
/* v8 ignore end */