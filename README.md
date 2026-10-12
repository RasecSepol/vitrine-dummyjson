# Vitrine DummyJSON

🔗 **Aplicação no ar:** https://SEU-USUARIO.github.io/vitrine-dummyjson/
📦 **Repositório:** https://github.com/SEU-USUARIO/vitrine-dummyjson

[![CI](https://github.com/SEU-USUARIO/vitrine-dummyjson/actions/workflows/ci.yml/badge.svg)](https://github.com/SEU-USUARIO/vitrine-dummyjson/actions/workflows/ci.yml)
[![Deploy](https://github.com/SEU-USUARIO/vitrine-dummyjson/actions/workflows/deploy.yml/badge.svg)](https://github.com/SEU-USUARIO/vitrine-dummyjson/actions/workflows/deploy.yml)

Aplicação web em **React + TypeScript** que consome a API pública [DummyJSON](https://dummyjson.com).

## Tema escolhido: catálogo e compras (`/products`)

**Área pública**
- Catálogo com busca textual (com debounce), filtro por categoria, ordenação e paginação. Os filtros ficam na URL (`?q=phone&categoria=smartphones&pagina=2`), então dá para compartilhar o link ou usar o botão "voltar".
- Página de detalhes (`/produtos/:id`) com galeria de imagens, preço com desconto, avaliações e seletor de quantidade.
- Carrinho de compras persistido no navegador, com quantidade editável e total calculado.

**Área administrativa (protegida por login)**
- Login via `POST /auth/login` (conta de teste pública: `emilys` / `emilyspass`).
- Painel com tabela paginada de produtos, cadastro (`POST /products/add`), edição (`PUT /products/:id`) e exclusão (`DELETE /products/:id`) usando modais.
- Finalizar a compra do carrinho (`POST /carts/add`) também é uma ação restrita: o visitante é levado ao login e depois volta para o carrinho.

> A DummyJSON **simula** as operações de escrita: ela responde como se tivesse salvo, mas não persiste nada. Por isso o painel guarda as alterações em estado local e mostra um aviso.

## Como executar localmente

Pré-requisitos: **Node.js 20+** (o projeto usa 22, veja `.nvmrc`) e **Yarn 1** (`npm i -g yarn` ou `corepack enable`).

```bash
yarn install            # instala as dependências
yarn dev                # http://localhost:5173/vitrine-dummyjson/
```

| Script | O que faz |
| --- | --- |
| `yarn dev` | Servidor de desenvolvimento do Vite |
| `yarn build` | Checagem de tipos + build de produção + gera `dist/404.html` |
| `yarn preview` | Serve o build em http://localhost:4173/vitrine-dummyjson/ |
| `yarn lint` | ESLint |
| `yarn typecheck` | `tsc -b` |
| `yarn test` | Testes unitários e de componentes (Vitest + RTL) |
| `yarn test:watch` | Vitest em modo watch |
| `yarn test:e2e` | Testes ponta a ponta (Playwright, headless). Na primeira vez rode `yarn playwright install chromium` |

## Estrutura

```
src/
├── components/   # componentes reutilizáveis (ProductCard, ProductForm, ProtectedRoute, PageHeader...)
├── contexts/     # Context API: AuthContext/AuthProvider e CartContext/CartProvider
├── hooks/        # custom hooks: useAuth, useCart, useFetch, useDebounce
├── layouts/      # MainLayout (cabeçalho + navegação + <Outlet />)
├── pages/        # páginas ligadas às rotas
├── routes/       # declaração das rotas (React Router)
├── schemas/      # schemas Zod + tipos inferidos (z.infer)
├── services/     # Axios centralizado (api.ts) e funções de acesso à API
├── test/         # setup do Vitest, wrappers de contexto e fixtures
└── utils/        # formatação de preço
e2e/              # testes Playwright
.github/workflows # CI (testes) e CD (deploy no GitHub Pages)
```

## Checklist dos 10 requisitos técnicos

### 1. Estrutura de componentes e tipagem com TypeScript ✅
- Projeto criado com `create-vite` no template **react-ts**, com `strict: true` no `tsconfig`.
- Componentes funcionais pequenos e desacoplados, cada um com uma `interface ...Props` explícita. A regra `@typescript-eslint/no-explicit-any` está como **erro** e não há `any` no código.
- Composição com `children`: `PageHeader` recebe as ações da página como `children`, `ErrorState` aceita conteúdo extra, e `AuthProvider`/`CartProvider`/`AppProviders` envolvem a árvore.
- Estilos: componentes do Mantine + **CSS Modules** (`MainLayout.module.css`, `ProductCard.module.css`) para o estado ativo do menu, a animação dos cards etc.

### 2. Estado reativo, imutabilidade e ciclo de vida ✅
- `useState` em todas as páginas (filtros, modais, quantidade, envio do formulário).
- Atualizações imutáveis com spread, `map` e `filter`: `CartProvider` (`{ ...item, quantity }`, `[...current, novo]`) e o estado `changes` do `AdminPage` (`{ ...current, updated: { ...current.updated, [id]: produto } }`). Há um teste garantindo que o array e o objeto anteriores não são alterados.
- `useEffect` com dependências exatas e **cleanup**:
  - `useFetch`: cancela a requisição anterior com `AbortController` (`return () => controller.abort()`).
  - `useDebounce`: `clearTimeout` do timer pendente.
  - `AuthProvider`: timer que encerra a sessão quando o token expira (`clearTimeout`) e ouvintes de `storage` (sincroniza abas) e `auth:unauthorized` (resposta 401), removidos no cleanup.

### 3. Estado global com Context API e Custom Hooks ✅
- `AuthContext` (sessão, usuário, `login`, `logout`) e `CartContext` (itens, totais e ações), com os valores memorizados via `useMemo`/`useCallback`.
- Hooks `useAuth()` e `useCart()` lançam um erro explicativo quando usados fora do Provider (`useAuth deve ser usado dentro de um <AuthProvider>.`). Os dois casos são testados.

### 4. Roteamento e layouts com React Router ✅
- Rotas declarativas com `<Routes>`/`<Route>` em `src/routes/AppRoutes.tsx`, incluindo rota coringa 404.
- `MainLayout` com cabeçalho/navegação persistentes e páginas filhas renderizadas via `<Outlet />`. No celular a navegação vai para um `Drawer` com menu hambúrguer.
- `<NavLink>` com classe `active` (CSS Module) indicando a rota atual.
- `useNavigate()` após login/logout, no botão "Voltar", no checkout e no menu do usuário.
- Rota dinâmica `/produtos/:id` lida com `useParams()`. Também usamos `useSearchParams()` para os filtros e `useLocation()` para lembrar a página de origem no login.

### 5. Interface gráfica e formulários com Mantine UI ✅
- `<MantineProvider>` com tema próprio (`src/theme.ts`), modo claro/escuro (`ThemeToggle`) e `<Notifications />`.
- Layout responsivo com `AppShell`, `Container`, `SimpleGrid` (1 a 4 colunas), `Grid` e props `visibleFrom`/`hiddenFrom`.
- Formulários com `@mantine/form` (`LoginPage` e `ProductForm`), listagem em cards com `Pagination` e tabela administrativa (`Table`) paginada.
- Feedback de carregamento com `LoadingOverlay` e estado de envio (`loading`) nos botões.

### 6. Fluxo de autenticação JWT e rotas protegidas ✅
- `LoginPage` chama `POST /auth/login` (via `authService.loginRequest`) com `expiresInMins: 60`.
- O token e os dados do usuário são salvos no `localStorage` (`vitrine:session`), validados com Zod ao reabrir o app e sincronizados no `AuthContext`.
- `ProtectedRoute` (rota "guarda" com `<Outlet />`) redireciona visitantes para `/login`, guardando a URL de origem para voltar depois do login.
- A sessão expira automaticamente (timer), cai se a API responder 401 e é sincronizada entre abas.

### 7. Consumo de API REST, interceptors e validação com Zod ✅
- Axios centralizado em `src/services/api.ts` com `baseURL: 'https://dummyjson.com'` e timeout.
- **Interceptor de requisição:** injeta `Authorization: Bearer <token>` quando há sessão.
- **Interceptor de resposta:** traduz falhas (sem conexão, timeout, 4xx, 5xx) em mensagens amigáveis exibidas com `notifications.show`, e dispara `auth:unauthorized` em respostas 401. Chamadas que mostram o erro na própria tela usam `{ silent: true }`.
- Estados de carregamento/sucesso/erro tratados explicitamente pelo hook `useFetch` (união discriminada `status: 'loading' | 'success' | 'error'`), com botão "Tentar novamente".
- Schemas Zod com `z.object` em `src/schemas/`, tipos inferidos com `z.infer`, respostas validadas com `.safeParse()` (`parseResponse`) e formulários validados com `zodResolver(schema)` do `mantine-form-zod-resolver`.

### 8. Testes automatizados com Vitest e RTL ✅
38 testes em 10 arquivos (`yarn test`):
- Hooks: `useCart` (imutabilidade, persistência, erro fora do Provider), `useAuth` (login/logout, sessão expirada, 401, cleanup dos ouvintes), `useDebounce` (com fake timers).
- Componentes/páginas: `LoginPage` (erros do Zod, redirecionamento, erro da API), `ProtectedRoute`, `ProductCard`, `ProductsPage` (busca com debounce, lista vazia, erro + tentar novamente), `CartPage` (totais, remoção, checkout exige login).
- Serviços e schemas: interceptor injeta o Bearer, evento 401, mensagens de erro e validação dos schemas.
- Consultas acessíveis (`getByRole`, `getByText`, `getByLabelText`), interações com `@testing-library/user-event` e wrappers com os contextos reais em memória (`TestProviders` com `MemoryRouter`). As chamadas de rede são isoladas com `vi.mock`.

### 9. Testes ponta a ponta com Playwright ✅
7 cenários em navegador real (Chromium headless), rodando contra o **build de produção** com o mesmo `base` do GitHub Pages:
- `auth.spec.ts`: acesso direto a `/admin` → redireciona para login → autentica → painel → recarrega mantendo a sessão → logout. Também testa credenciais inválidas.
- `catalog.spec.ts`: busca "iphone" → abre detalhes → adiciona 2 unidades → confere o carrinho; filtro por categoria + paginação; deep link e reload em rotas internas e página 404.
- `admin.spec.ts`: validação do formulário, cadastro de produto, edição e exclusão.
- Apenas localizadores semânticos (`getByRole`, `getByLabel`, `getByText`).

### 10. Pipeline de CI/CD e deploy em produção ✅
- `.github/workflows/ci.yml`, a cada push e pull request: checkout → Node 22 → `yarn install --frozen-lockfile` → lint → typecheck → Vitest; e um job separado que instala o Chromium e roda o Playwright, publicando o relatório como artefato.
- `.github/workflows/deploy.yml`, a cada push na `main`: testes unitários → `yarn build` → upload do `dist/` → `actions/deploy-pages`.
- `vite.config.ts` com `base: '/vitrine-dummyjson/'`, e o `BrowserRouter` usa `import.meta.env.BASE_URL` como `basename`.
- Fallback de SPA: `scripts/spa-fallback.mjs` copia `dist/index.html` para `dist/404.html` no build. Assim links diretos e recarregamentos (ex.: `/vitrine-dummyjson/produtos/5`) funcionam no GitHub Pages; o Playwright verifica isso.
- Branch `main` protegida: Pull Request obrigatório e checks do CI precisam passar antes do merge (configurado em *Settings → Branches*).

## Uso de Inteligência Artificial

O projeto foi desenvolvido com apoio do **Claude Code** (assistente de programação da Anthropic), usado para:
- propor a arquitetura de pastas, a estrutura dos contextos e o hook `useFetch`;
- escrever as primeiras versões dos schemas Zod a partir das respostas reais da DummyJSON;
- sugerir cenários de teste de borda (sessão expirada, 401, JSON corrompido no `localStorage`, busca + categoria combinadas) e montar os testes Vitest/Playwright;
- configurar os workflows do GitHub Actions e o fallback `404.html`.

Todo o código foi revisado, executado e testado localmente antes de entrar no repositório. Algumas decisões que vieram da revisão:
- A DummyJSON devolve o mesmo `id` para todo produto criado; o painel gera um id local único para não duplicar chaves.
- A busca textual da API não aceita filtro de categoria junto; nesse caso o serviço busca a categoria inteira e filtra/pagina no cliente.
- O logout era interrompido pelo `ProtectedRoute`, que redirecionava para `/login`; o teste E2E pegou o problema, resolvido colocando o logout na mesma transição da navegação.
