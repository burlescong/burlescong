<p align="center">
  <a href="https://burles.co">
    <img width="533" src="cover.png">
  </a>
</p>

[![Gitter](https://img.shields.io/gitter/room/nwjs/nw.js.svg)](https://gitter.im/rodorgas/burlesco)
[![GitHub release](https://img.shields.io/github/release/burlesco/burlesco.svg)](https://github.com/burlesco/burlesco/releases/latest/)
[![Build Status](https://travis-ci.org/burlesco/burlesco.svg?branch=master)](https://travis-ci.org/burlesco/burlesco)


Extensão e userscript para navegadores que remove o paywall poroso de diversos sites de notícia. Funciona no Opera, Firefox e Chrome (e em qualquer navegador compatível com WebExtension).

Para instalar no seu navegador e para mais informações sobre o projeto, visite https://burles.co

# Desenvolvimento

## Extensão

O código-fonte da extensão está escrito em TypeScript, na pasta `src/`:

- `manifest.json`: descreve a extensão para os navegadores e define as permissões;
- `background.ts`: bloqueia/manipula pedidos responsáveis pelo paywall;
- `content*.ts`: injeta scripts para impedir a ativação do paywall ou revertê-lo;
- `options.ts`: a página que liga e desliga cada site;
- `globals.d.ts`: tipos compartilhados entre os scripts.

Instale as dependências com `npm install` antes de começar. O TypeScript é compilado para JavaScript na hora de empacotar, e é esse JavaScript que os navegadores carregam.

Há um Makefile para auxiliar no desenvolvimento:

- `make lint`: valida os JSONs, checa os tipos com `tsc` e roda o [`eslint`](https://github.com/eslint/eslint);
- `make pre-build`: compila o TypeScript e monta `dist/chromium/src` e `dist/firefox/src`, prontos para serem carregados como extensão sem empacotar;
- `make`: executa todas as etapas incluindo o lint e gera extensões empacotadas para cada navegador.

## Userscript

O código-fonte do userscript está em um repositório próprio [aqui](https://github.com/burlesco/userscript). Ele funciona bloqueando pedidos responsáveis pelo paywall e injetando scripts para impedir sua ativação.

Esse userscript funciona apenas com o Tampermonkey, porque é o único com suporte a API @webRequest.

----

Se você tiver alguma dúvida ou ideia para burlar um site novo, abra uma issue ou nos [encontre no Gitter](https://gitter.im/rodorgas/burlesco).

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
