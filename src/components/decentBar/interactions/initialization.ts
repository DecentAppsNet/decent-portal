import { applyLoggingSettings } from "@/localLogging/logUtil";
import { getLoggingSettings } from "@/settings/categories/loggingSettingsUtil";
import { isServingFromEnabledDomain } from "../decentBarUtil";

function _findFavIconLink() {
  return document.querySelector<HTMLLinkElement>('link[rel~="icon"][sizes="192x192"]') ||
    document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
}

export type InitResults = {
  favIconUrl:string|null,
  isDecentBarEnabled:boolean
}

export async function init(enabledDomains:string[]) {
  try {
    const loggingSettings = await getLoggingSettings();
    await applyLoggingSettings(loggingSettings);
  } catch(e) {
    console.error('Error applying logging settings:', e);
  }

  let favIconUrl = null;
  const isDecentBarEnabled = isServingFromEnabledDomain(enabledDomains);
  const link = _findFavIconLink();
  favIconUrl = link ? link.href : null;
  return { isDecentBarEnabled, favIconUrl };
}