# Animações festivas por data comemorativa

> **Status: implementado** (branch `feat/fogos-datas-especiais`). A engine substituiu a
> IIFE de fogos em `index.html`. Verificado em navegador real (Chrome via DevTools
> Protocol, captura em tempo real): os 4 temas renderizam e o gate por data dispara os
> fogos na carga padrão de 12/jun.

## Contexto

Hoje o site dispara **um único efeito** — fogos de artifício dourado/vinho — em qualquer
data da lista `DATAS_ESPECIAIS` (IIFE em `index.html`, ~linhas 490–622). A ideia é que
**cada tema** tenha uma animação própria, mantendo a estética editorial/bodas
("elegante e sóbrio"). Os fogos ficam só para o Dia dos Namorados; casamento, primeiro
beijo e aniversários ganham animações diferentes.

Mapa final acordado:

| Data(s)            | Tema              | Animação                         |
|--------------------|-------------------|----------------------------------|
| `2-14`, `6-12`     | Dia dos Namorados | **Fogos** (mantém)               |
| `4-17`             | Casamento         | **Chuva de pétalas douradas**    |
| `8-24`             | Primeiro beijo    | **Corações subindo**             |
| `6-13`, `9-27`     | Aniversários      | **Balões subindo** (iguais)      |

Tudo num único arquivo estático (`index.html`), sem build/deps. Animações em `<canvas>`
overlay já existente (`#fogos`), via `requestAnimationFrame`.

> **Decisão durante a implementação:** a trava de `prefers-reduced-motion` foi **removida**.
> Por ser um site pessoal do casal, as animações devem tocar nas datas independentemente da
> config de "reduzir movimento" do sistema (que no Windows chegava a bloquear tudo).

## Abordagem

Refatorar a IIFE dos fogos (`index.html` ~490–622) para uma **engine de celebração
parametrizada por tema**, reaproveitando todo o andaime que já existe:

- `canvas #fogos`, `resize()`/`dpr` — mantém;
- helpers `rand(a,b)` e `cor()` — reaproveitar, `cor()` passa a receber a paleta do tema
  ativo;
- loop `frame(t)` com `inicio`, cadência de spawn, `parouEm` + fade + `canvas.remove()` —
  generalizar para iterar sobre um array único de partículas.

### Mapa data → tema (substitui `DATAS_ESPECIAIS`)

```js
const TEMAS_POR_DATA = {
  '2-14':'fogos', '6-12':'fogos',
  '4-17':'petalas',
  '8-24':'coracoes',
  '6-13':'baloes', '9-27':'baloes',
};
const chaveHoje = (hoje.getMonth()+1) + '-' + hoje.getDate(); // mês base 1
// temaId resolvido no bloco de override abaixo
```

### Override de teste (editável manualmente) + querystring

Dois jeitos de forçar um tema, ignorando a data (ambos ainda respeitam reduced-motion):

1. **Constante editável** no topo da IIFE, bem marcada com `EDITE AQUI`, para trocar numa
   linha só e ver a animação em qualquer dia:

   ```js
   // EDITE AQUI p/ testar: '' usa a data real; ou force um tema:
   // 'fogos' | 'petalas' | 'coracoes' | 'baloes'
   const TEMA_TESTE = '';
   ```

2. **Querystring** `?fx=<tema>` (atalho sem editar arquivo), útil para pré-visualizar
   rápido no navegador.

Resolução (a constante tem prioridade sobre a querystring, e ambas sobre a data):

```js
const fx = new URLSearchParams(location.search).get('fx');
let temaId = TEMA_TESTE || fx || TEMAS_POR_DATA[chaveHoje];
if (!TEMAS[temaId]) return; // sem teste, sem ?fx= e fora das datas → nada acontece
```

Deixar `TEMA_TESTE = ''` antes de finalizar/commitar para o site voltar a respeitar a
data real.

### Estrutura dos temas

Um objeto `TEMAS` onde cada tema define paleta, duração da janela de spawn e três
funções sobre um array compartilhado `parts`. O `frame()` fica genérico:

```js
const TEMAS = {
  fogos:    { cores:[...], duracao:4500, spawn(t){...}, passo(p,dt){...}, desenha(p){...} },
  petalas:  { ... },
  coracoes: { ... },
  baloes:   { ... },
};
```

- **`spawn(t)`** — empurra novas partículas em `parts` conforme a cadência (enquanto
  `t < duracao`).
- **`passo(p)`** — atualiza física da partícula; retorna `false` quando deve ser removida
  (saiu da tela ou `vida<=0`).
- **`desenha(p)`** — desenha no `ctx` (com `dpr` já aplicado).

Loop: spawn → para cada `p`: `passo` + `desenha`, removendo as mortas → quando passou a
duração e `parts` vazio, faz fade (`canvas.style.opacity='0'`) e `canvas.remove()`.

### Mecânica de cada animação (elegante/sóbrio)

1. **Fogos** (`fogos`) — reaproveita a lógica atual (`foguetes`/`faiscas`, sobe + explode
   em anel, gravidade, rastro `destination-out`). Paleta vinho/rosa/dourado:
   `['#9c3a4d','#C9A876','#E7D4C4','#D9B26A','#5A1A29']`. Sem rastro nas outras animações.

2. **Pétalas** (`petalas`) — spawn contínuo no topo (`y=-10`, `x` aleatório), queda lenta
   `vy≈0.6–1.4·dpr`, balanço lateral `x += sin(t·freq+fase)·amp`, rotação própria.
   Desenho: elipse rotacionada (`ctx.ellipse`) cor dourado/blush/creme, alpha ~0.85.
   Janela ~6 s; remove quando `y > H+20`.

3. **Corações** (`coracoes`) — spawn esparso no rodapé (`y=H+10`), sobem devagar
   `vy≈-0.8…-1.6·dpr`, leve deriva lateral via `sin`, fade conforme sobem (`vida`).
   Desenho: coração via dois arcos + ponta (path pequeno), paleta vinho/rosa/blush.
   Íntimo: poucas partículas simultâneas. Janela ~6 s.

4. **Balões** (`baloes`) — spawn na base (`y=H+30`), sobem `vy≈-0.9…-1.8·dpr`, balanço
   lateral suave, leve rotação. Desenho: elipse (corpo) + triângulo (bico) + cordão (linha
   curta) + ponto claro de brilho. Paleta sóbria dourado/vinho/creme. Janela ~5–6 s;
   remove ao sair pelo topo.

Todas: cap de partículas (limitar `parts.length` em `MAX`), formas simples, `dpr` clamp a 2
(já existe), cleanup ao fim. Cada tema encerra em ~12–13 s (as **pétalas** foram ajustadas
para `duracao: 5000` e queda `vy ≈ 1.8–3.8·dpr`, senão demoravam >15 s em telas altas).

## Arquivos a alterar

- **`index.html`**
  - `<script>` IIFE dos fogos (~490–622): refatoração descrita acima (mapa de temas,
    `TEMAS`, override `?fx=`, loop genérico).
  - Comentário do CSS `#fogos` (~67) e do `<canvas>` (~248): trocar "fogos de artifício"
    por "overlay das animações comemorativas" (o id `#fogos` e seu CSS de overlay genérico
    permanecem — sem churn de estilo).
- **`CLAUDE.md`** — atualizar o bullet "Fogos de artifício" na seção *Comportamentos JS*
  para descrever a engine multi-tema, o mapa data→tema e o override de preview.

## Verificação (feita)

- **Sintaxe** do `<script>` validada (sem erros de parse).
- **Lógica de cada tema** em harness Node (canvas/DOM mockados, animação rodada quadro a
  quadro): os 4 temas desenham partículas, sem exceções, e o canvas se auto-remove ao fim
  (sem vazamento). Pétalas ajustadas após o teste acusar encerramento >15 s.
- **Navegador real** (Chrome via DevTools Protocol, captura em **tempo real** — o headless
  com `--screenshot` não compõe canvas desenhado durante o load, então foi preciso rodar
  via CDP): confirmadas **pétalas** (`?fx=petalas`), **fogos** (`?fx=fogos`) e o **gate por
  data** (carga padrão em 12/jun dispara os fogos).
- **Sem regressão**: contador, nº de anos, reveal e carrossel intactos (refatoração isolada
  na última IIFE).

### Como pré-visualizar manualmente

Servir local (`python -m http.server` → `http://localhost:8000`) ou abrir o arquivo direto.
Forçar um tema em qualquer dia, de dois modos:

- editar `TEMA_TESTE` (linha ~494) para `'fogos'`/`'petalas'`/`'coracoes'`/`'baloes'`; **ou**
- usar a URL: `/?fx=fogos` · `/?fx=petalas` · `/?fx=coracoes` · `/?fx=baloes`

A animação roda **uma vez (~12 s) e some sozinha** — recarregue (`Ctrl+Shift+R`) para repetir.
Deixar `TEMA_TESTE = ''` ao final.
