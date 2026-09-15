// run_at: document_start
const SITES_START: Record<string, RegExp> = {
  crusoe: /crusoe.uol.com.br/,
  diariograndeabc: /dgabc.com.br/,
  em: /em\.com\.br/,
  jornaldocomercio: /jornaldocomercio\.com/,
  oglobo: /globo\.com/,
  nexo: /nexojornal\.com\.br/,
};

chrome.storage.local.get('sites', function (result) {
  const enabledSites: SiteStatus = result.sites || {};
  for (const site in SITES_START) {
    if (enabledSites[site] === false) continue;
    if (SITES_START[site].test(document.location.host)) {
      const message: ExecuteScriptMessage = {
        action: 'executeScript',
        type: 'start',
        site: site,
      };
      chrome.runtime.sendMessage(message);
      break;
    }
  }
});
