# Capitulando — app Android

React Native + Expo (SDK 57) + expo-router. Só a interface, por enquanto: os dados vêm de exemplos locais
(`src/data/mock.ts`). A referência de design é o protótipo em `docs/prototipo/Prototipo.html`.

## Rodar (Windows)

```powershell
cd C:\Users\johnn\Documents\capitulando-app\capitulando-app
git pull
npm install
npx expo start -c
```

Escaneie o QR code com o **Expo Go**.

## Ver no navegador (mais rápido para revisar o design)

```powershell
npx expo install react-dom react-native-web @expo/metro-runtime   # uma vez só
npm run web
```

Abre em `http://localhost:8081`. Cada arquivo salvo recarrega sozinho. No Chrome, aperte F12 e ative o
modo celular (Ctrl+Shift+M) para ver no tamanho de um telefone.

## Estrutura

```
app/                 telas (cada arquivo é uma rota)
  (tabs)/            abas: Início, Descobrir, Juntos, Perfil
  livro/[id].tsx     página do livro
  estante/[status]   estante (lendo, lido, quero-ler, abandonei)
  pessoa/[id]        perfil de outra pessoa
  lista/[id]         lista de livros
  caixa, config, onboarding
  registrar, progresso, detalhes, salvo, status, busca,
  editar-perfil, entrada, filtrar, filtrar-diario, ordenar   folhas que sobem de baixo
src/theme            cores, fontes, raios (tokens do protótipo)
src/components       componentes reutilizáveis
src/data/types.ts    modelos de dados
src/data/mock.ts     dados de exemplo
src/data/api.ts      <- PONTO DE INTEGRAÇÃO COM O BACKEND
src/data/juntos/     dados e funções da Fase 3 (reexportados por api.ts)
src/data/store.tsx   estado das leituras do usuário
```

## Para quem vai conectar o backend (capitulando.com)

As telas **não** importam `mock.ts` diretamente: elas usam apenas as funções de `src/data/api.ts`
(`getMe`, `getHome`, `getBookDetails`, `searchBooks`, `getProfile`, `saveProgress`, `setShelfStatus`,
`saveReadingDetails`...). Para integrar, troque o corpo de cada função por uma chamada HTTP e converta a
resposta para os tipos de `src/data/types.ts`. Autenticação e token podem ficar em um novo `src/data/http.ts`.

## Fases

1. **Leitura pessoal** (feito): Início, Registrar, Anotar páginas, Mais detalhes, Salvo, Status, Busca,
   Livro, Estante, Perfil (Sobre, Estantes, Clubes, Projetos, Diário, Estatísticas).
2. **Social e conta** (feito): Descobrir (Seguindo, Para você, Explorar), Onboarding (6 passos),
   perfil de outra pessoa, Editar perfil, Configurações, Caixa (avisos, mensagens, conversa), Lista,
   entrada do diário, filtros da estante e do diário, ordenação.
3. **Juntos** (feito): aba Juntos (desafios, clubes, projetos, leituras coletivas), sala do desafio, check-in,
   convidar, criar desafio, pódio, página e sala do clube, capítulo, presença, página do projeto, criar clube,
   criar projeto, Estúdio de cards (conteúdo, exportar).
4. **Pagamentos e condutor** (feito): checkout (apoio a projeto e cadeira de clube, cartão ou Pix),
   Meu apoio (rastreio e atualizações), painel do clube (membros, pagamentos, sessões, enquetes),
   painel do projeto (arrecadação, recompensas, envios), nova enquete, avisar o clube / postar
   atualização, trocar status do livro. Dados em `src/data/juntos/pagamentos.ts`.

## Gerar APK / AAB (EAS Build)

```powershell
npm install -g eas-cli
eas login
npm run build:apk   # APK para instalar direto no celular
npm run build:aab   # AAB para a Google Play
```
