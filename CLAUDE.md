# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Convenções de commit

**NUNCA** adicione qualquer referência ao Claude / Anthropic em commits. Sem linha `Co-Authored-By: Claude ...`, sem `🤖 Generated with Claude Code`, sem menção ao assistente na mensagem ou no corpo do commit. As mensagens devem conter apenas a descrição da mudança.

## O que é este projeto

Página única estática — um site comemorativo de aniversário de casamento ("Nossa História") para o casal Patrick & Cleide. O número de anos no título da aba e nos textos é **calculado em runtime** a partir de `DATA_INICIO`, não é fixo. O site é servido por três arquivos: `index.html` (estrutura), `assets/estilo.css` (estilos) e `assets/app.js` (comportamentos). O `index.html` ainda é grande (~596 KB) porque as **fotos ficam embutidas como base64** (`data:image/jpeg;base64,...`) diretamente no HTML — não há arquivos de imagem externos no repositório.

Idioma do conteúdo e dos comentários: **PT-BR**.

## Sem build, sem dependências, sem testes

Não existe `package.json`, bundler, lint ou suíte de testes. É HTML/CSS/JS puro servido diretamente. Para visualizar:

- Abrir `index.html` direto no navegador (duplo clique), **ou**
- Servir localmente para evitar restrições de `file://`: `python -m http.server` e acessar `http://localhost:8000`.

## Arquitetura

O site tem três arquivos:

1. **`index.html`**: só a estrutura. No `<head>`, um `<link rel="stylesheet" href="assets/estilo.css">`; antes do `</body>`, um `<script src="assets/app.js"></script>`. No `<body>`: o `<canvas id="fogos">` (overlay das animações) e as seções semânticas em ordem de scroll — `hero` → `intro` (contador) → `timeline` → `gallery` (carrossel) → `quote` → `footer`. As fotos vivem aqui, em base64.
2. **`assets/estilo.css`**: todo o CSS. Paleta definida em variáveis CSS no `:root` (`--wine`, `--gold`, `--cream`, etc.). Estética "editorial/bodas": fontes Cormorant Garamond + Jost via Google Fonts, textura de grão via SVG inline em `body::before`.
3. **`assets/app.js`**: cinco blocos independentes (IIFEs, sem ES modules — para funcionar via `file://`), na ordem — contador de tempo, nº de anos dinâmico (título + textos), `IntersectionObserver` de reveal, carrossel e animações comemorativas. `DATA_INICIO` é declarado no topo.

### Comportamentos JS (em `assets/app.js`)

- **Contador em tempo real** (`DATA_INICIO` no topo): a função `decompor()` quebra o tempo decorrido desde a data de início em anos/meses/dias/horas/minutos/segundos com aritmética de calendário (empresta dias do mês anterior, meses do ano), e `tick()` atualiza os elementos `#c-anos`, `#c-meses`, `#c-dias`, `#c-horas`, `#c-min`, `#c-seg` a cada segundo via `setInterval`. **Atenção:** o mês em `new Date(ano, mes, dia)` é base 0 (janeiro = 0).
- **Nº de anos dinâmico**: calcula `anos = anoAtual - DATA_INICIO.getFullYear()` e injeta o resultado em `document.title` (`"N Anos · Nossa História"`), no rodapé (`#f-ano`) e nos textos por extenso. É a razão de o título/textos não serem hardcoded.
- **Reveal no scroll**: elementos com a classe `.reveal` ganham `.in` ao entrar na viewport (`IntersectionObserver`).
- **Carrossel** (`#track`/`#carousel`): autoplay de 5s, pausa no `mouseenter`, navegação por setas e bolinhas geradas dinamicamente, e swipe por toque no mobile. As bolinhas (`#dots`) são criadas a partir do número de `.slide`.
- **Animações comemorativas** (`TEMAS_POR_DATA`): engine multi-tema sobre o overlay `<canvas id="fogos">`. O mapa `TEMAS_POR_DATA` liga cada data (`"mês-dia"`, **mês base 1** — diferente do contador, que usa base 0) a um tema: `fogos` (Dia dos Namorados, 14/fev e 12/jun), `petalas` (casamento, 17/abr), `coracoes` (primeiro beijo, 24/ago) e `baloes` (aniversários, 13/jun e 27/set). Cada tema é um objeto em `TEMAS` com `cores`, `duracao` e as funções `spawn`/`passo`/`desenha` sobre um array único de partículas; o `frame()` é genérico (só `fogos` usa rastro aditivo via `trilha()`, os demais limpam o quadro). Ao fim, o canvas faz fade e se auto-remove. (Obs.: a trava de `prefers-reduced-motion` foi removida de propósito — por ser um site pessoal, as animações tocam nas datas independentemente da config do sistema.) **Para testar em qualquer dia:** edite a constante `TEMA_TESTE` no topo da IIFE (ex.: `'baloes'`) ou use a querystring `?fx=<tema>` — deixe `TEMA_TESTE = ''` para voltar a respeitar a data real.

## Como personalizar

O código foi escrito para edição manual e marca os pontos editáveis com comentários `<!-- EDITE AQUI -->` e um bloco de instruções no topo do `<head>`. Pontos principais:

- **Nomes / datas / frases**: procure por `EDITE AQUI` no HTML.
- **Data de início do relacionamento**: variável `DATA_INICIO` no topo de `assets/app.js`.
- **Fotos**: o template original previa uma pasta `fotos/` (capa.jpg, foto1.jpg…), mas a versão atual usa imagens **embutidas em base64** no `<img src="data:...">`. Para trocar uma foto, substitua a string base64 correspondente (ou volte ao padrão `src="fotos/xxx.jpg"`).

Ao adicionar/remover slides no carrossel, basta acrescentar `<figure class="slide"><img ...></figure>` dentro de `#track` — as bolinhas e o autoplay se ajustam sozinhos.
