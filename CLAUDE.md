# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é este projeto

Página única estática — um site comemorativo de aniversário de casamento ("23 Anos · Nossa História") para o casal Patrick & Cleide. Todo o site vive em um único arquivo: `index.html` (~617 KB, mas só ~412 linhas de código real). O tamanho vem das **fotos embutidas como base64** (`data:image/jpeg;base64,...`) diretamente no HTML — não há pasta de assets nem arquivos de imagem externos no repositório.

Idioma do conteúdo e dos comentários: **PT-BR**.

## Sem build, sem dependências, sem testes

Não existe `package.json`, bundler, lint ou suíte de testes. É HTML/CSS/JS puro servido diretamente. Para visualizar:

- Abrir `index.html` direto no navegador (duplo clique), **ou**
- Servir localmente para evitar restrições de `file://`: `python -m http.server` e acessar `http://localhost:8000`.

## Arquitetura de `index.html`

O arquivo tem três blocos, na ordem:

1. **`<style>`** (a partir da linha ~32): todo o CSS. Paleta definida em variáveis CSS no `:root` (`--wine`, `--gold`, `--cream`, etc.). Estética "editorial/bodas": fontes Cormorant Garamond + Jost via Google Fonts, textura de grão via SVG inline em `body::before`.
2. **`<body>`** (a partir da ~240): seções semânticas em ordem de scroll — `hero` → `intro` (contador) → `timeline` → `gallery` (carrossel) → `quote` → `footer`.
3. **`<script>`** (a partir da ~343): três IIFEs independentes — o contador de tempo, o `IntersectionObserver` de reveal, e o carrossel.

### Comportamentos JS

- **Contador em tempo real** (`DATA_INICIO`, linha ~346): a função `decompor()` quebra o tempo decorrido desde a data de início em anos/meses/dias/horas/minutos/segundos com aritmética de calendário (empresta dias do mês anterior, meses do ano), e `tick()` atualiza os elementos `#c-anos`, `#c-meses`, `#c-dias`, `#c-horas`, `#c-min`, `#c-seg` a cada segundo via `setInterval`. **Atenção:** o mês em `new Date(ano, mes, dia)` é base 0 (janeiro = 0).
- **Reveal no scroll**: elementos com a classe `.reveal` ganham `.in` ao entrar na viewport (`IntersectionObserver`).
- **Carrossel** (`#track`/`#carousel`): autoplay de 5s, pausa no `mouseenter`, navegação por setas e bolinhas geradas dinamicamente, e swipe por toque no mobile. As bolinhas (`#dots`) são criadas a partir do número de `.slide`.

## Como personalizar

O código foi escrito para edição manual e marca os pontos editáveis com comentários `<!-- EDITE AQUI -->` e um bloco de instruções no topo do `<head>`. Pontos principais:

- **Nomes / datas / frases**: procure por `EDITE AQUI` no HTML.
- **Data de início do relacionamento**: variável `DATA_INICIO` no `<script>`.
- **Fotos**: o template original previa uma pasta `fotos/` (capa.jpg, foto1.jpg…), mas a versão atual usa imagens **embutidas em base64** no `<img src="data:...">`. Para trocar uma foto, substitua a string base64 correspondente (ou volte ao padrão `src="fotos/xxx.jpg"`).

Ao adicionar/remover slides no carrossel, basta acrescentar `<figure class="slide"><img ...></figure>` dentro de `#track` — as bolinhas e o autoplay se ajustam sozinhos.
