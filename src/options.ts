const SITES = [
  'brpolitico',
  'correio24horas',
  'correiopopular',
  'crusoe',
  'diarioabcpaulista',
  'diarinho',
  'diariodecanoas',
  'diariodaregiao',
  'diariopopular',
  'elpais',
  'em',
  'exame',
  'folhadelondrina',
  'folhadespaulo',
  'galileu',
  'gazetadopovo',
  'gazetaonline',
  'gauchazh',
  'jornalnh',
  'jornaldocomercio',
  'jornalvs',
  'jota',
  'nexo',
  'nsctotal',
  'oestadodespaulo',
  'oglobo',
  'pioneiro',
  'quatrorodas',
  'revistaoeste',
  'seudinheiro',
  'superinteressante',
  'uol',
  'veja',
  'observador',
  'valoreconomico',
];

function siteInput(site: string): HTMLInputElement | null {
  return document.querySelector<HTMLInputElement>('#' + site);
}

function saveOptions(e: Event) {
  function showUpdateSucess() {
    const success = document.querySelector<HTMLElement>('#save-success');
    if (!success) return;
    success.style.display = 'inline-block';
    setTimeout(function () {
      success.style.display = 'none';
    }, 3000);
  }

  e.preventDefault();

  const siteStatus: SiteStatus = {};
  for (const site of SITES) {
    const input = siteInput(site);
    if (input) siteStatus[site] = input.checked;
  }

  chrome.storage.local.set({ sites: siteStatus });
  chrome.runtime.sendMessage('update');

  showUpdateSucess();
}

function restoreOptions() {
  function setCurrentSite(site: string, status: boolean) {
    const input = siteInput(site);
    if (input) input.checked = status;
  }

  chrome.storage.local.get('sites', function (result) {
    const sites: SiteStatus = result.sites || {};
    for (const site in sites) setCurrentSite(site, sites[site]);
  });
}

function changeAll(check: boolean) {
  const selector = 'input[type="checkbox"]';
  const inputs = document.querySelectorAll<HTMLInputElement>(selector);
  for (const input of inputs) {
    input.checked = check;
  }
}

function checkNone() {
  changeAll(false);
}

function checkAll() {
  changeAll(true);
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form')?.addEventListener('submit', saveOptions);
document.querySelector('#all')?.addEventListener('click', checkAll);
document.querySelector('#none')?.addEventListener('click', checkNone);
