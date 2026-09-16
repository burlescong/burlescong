![](cover.png)

[![Email](https://img.shields.io/badge/Email-linneu.dm%40gmail.com-D14836?logo=gmail&logoColor=white)](mailto:linneu.dm@gmail.com)
![GitHub Release](https://img.shields.io/github/v/release/burlescong/burlescong?display_name=tag)
![CI](https://github.com/burlescong/burlescong/actions/workflows/ci.yml/badge.svg?branch=master)

Extensão e userscript para navegadores que remove o paywall poroso de diversos sites de notícia. Funciona no Opera, Firefox e Chrome (e em qualquer navegador compatível com WebExtension).

Para instalar no seu navegador e para mais informações sobre o projeto, visite [https://burles.co](https://burles.co)

# Desenvolvimento

## Extensão

O código-fonte da extensão está escrito em TypeScript, na pasta `src/`:

- `manifest.json`: descreve a extensão para os navegadores e define as permissões;
- `background.ts`: bloqueia/manipula pedidos responsáveis pelo paywall;
- `content*.ts`: injeta scripts para impedir a ativação do paywall ou revertê-lo;
- `options.ts`: a página que liga e desliga cada site;
- `globals.d.ts`: tipos compartilhados entre os scripts.

Instale as dependências com `npm install` antes de começar. O TypeScript é compilado para JavaScript na hora de empacotar, e é esse JavaScript que os navegadores carregam.

Há scripts npm para o desenvolvimento:

- `npm run lint`: valida os JSONs, checa os tipos com `tsc` e roda o `[eslint](https://github.com/eslint/eslint)`;
- `npm run pre-build`: compila o TypeScript e monta `dist/chromium/src` e `dist/firefox/src`, prontos para serem carregados como extensão sem empacotar;
- `npm run build`: empacota a extensão para cada navegador (zip, CRX e XPI).

Para assinar o XPI do Firefox, copie `.env.example` para `.env` e preencha `mozilla_api_key` / `mozilla_api_secret` (API keys do [AMO](https://addons.mozilla.org/developers/addon/api/key/)).

### Release (GitHub Actions)

Releases são publicadas ao enviar uma tag `vX.Y` (ex.: `v15.1`) no `master` de [burlescong/burlescong](https://github.com/burlescong/burlescong). Configure estes secrets no repositório (Settings → Secrets and variables → Actions):

- `CRX_PRIVATE_KEY` — conteúdo do `burlesco-pkcs8-key.pem` (se as quebras de linha sumirem, use `\n` literais; o workflow grava o arquivo com `printf '%b'`);
- `mozilla_api_key` / `mozilla_api_secret` — assinatura do XPI no AMO;
- `UPDATE_TOKEN` — Personal Access Token com permissão de push em [burlescong/burlesco-update](https://github.com/linnburlescongeudm/burlesco-update) (o `GITHUB_TOKEN` padrão não alcança outro repo).

O workflow `Release` empacota a extensão, cria a GitHub Release e atualiza os feeds em `burlesco-update` (`https://burlescong.github.io/burlesco-update/`). O workflow `CI` roda `npm run lint` em pushes/PRs para `master`.

## Userscript

**DESCONTINUADO**

A menos que você nos forneça um bom motivo para continuar com ele, poderemos trabalhar juntos.

---

Se você tiver alguma dúvida ou ideia para burlar um site novo, abra uma issue ou nos [contate por email](mailto:linneu.dm@gmail.com).

# Publicações suportadas

O Burlesco funciona com os seguintes sites de notícia:

- BRPOLÍTICO
- Correio 24 Horas
- Correio Popular
- Crusoé
- Diarinho
- Diário Popular
- Diário da Região
- Diário de Canoas
- Diário do Grande ABC
- EL PAÍS Brasil
- Estado de Minas
- Exame
- Folha de Londrina
- Folha de S.Paulo
- Gazeta Online
- Gazeta do Povo
- GaúchaZH
- JOTA
- Jornal NH
- Jornal do Comércio
- Jornal Pioneiro
- Jornal VS
- NSC Total
- O Estado de S. Paulo
- O Globo
- Observador
- Quatro Rodas
- Revista Oeste
- Seu Dinheiro
- Superinteressante
- UOL
- Valor Econômico
- Veja
- Época
