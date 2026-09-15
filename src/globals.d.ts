// Every script under src/ is loaded standalone by the browser, so shared types
// are declared globally instead of imported.

interface JQueryChain {
  attr(name: string, value: string): JQueryChain;
  hide(): JQueryChain;
  show(): JQueryChain;
  remove(): JQueryChain;
  removeClass(names?: string): JQueryChain;
}

// Globals the injected scripts read from or write to on the news pages.
interface Window {
  jQuery?: (selector: string) => JQueryChain;
  hasPaywall?: boolean;
  id_acesso_noticia?: number;
  omtrClickUOL?: () => void;
  __ISOMORPHIC_DATA__?: string;
  usuarioAssinante?: () => boolean;
  usuarioPremium?: () => boolean;
  usuarioPj?: () => boolean;
  usuario?: {
    id?: number | string;
    nome?: string;
    email?: string;
    assinante?: boolean;
    premium?: boolean;
    pj?: boolean;
  };
  paywallCustomEvent?: (state: string) => void;
  carregar_xml_materia?: (ds_matia_path: string) => void;
}

/** Maps a site id to whether the user left it enabled in the options page. */
type SiteStatus = Record<string, boolean>;

interface ExecuteScriptMessage {
  action: 'executeScript';
  type: 'start' | 'idle';
  site: string;
}
