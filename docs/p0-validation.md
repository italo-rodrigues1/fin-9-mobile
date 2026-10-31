# P0 — Interface e confiabilidade

Implementado em 31/10/2026. O checklist completo está no project.md da pasta que reúne os serviços.

## Entregas

- [x] Interface com raios de 8 px, hierarquia de texto e tema claro consistente.
- [x] Navegação Início, Transações, Contas e Mais; Categorias e Perfil acessíveis em Mais.
- [x] Novo registro com menu identificado, substituindo o botão +.
- [x] Boas-vindas antes do login e acesso direto ao Dashboard para sessão válida.
- [x] Pilha de navegação preserva rascunho ao cadastrar uma conta durante um lançamento.
- [x] Privacidade dos saldos e transações, inclusive rótulos de acessibilidade.
- [x] Estados de carregamento, falha, vazio e ação Tentar novamente.
- [x] Erros de formulário junto aos campos e senha alinhada à API.
- [x] Feedback de operações e bloqueio de envio simultâneo nos formulários financeiros.
- [x] Datas financeiras mantêm o dia informado em diferentes fusos.
- [x] Backend: operações atômicas, isolamento serializável, até três tentativas em conflitos e resumos com Decimal.

## Validação

- [x] TypeScript: npm run typecheck.
- [x] Treze testes mobile: dinheiro, datas, privacidade, erros da API, consultas duplicadas, expiração, atualização forçada, invalidação após movimentações e isolamento de sessão.
- [x] Backend: 56 testes passaram, incluindo 10 testes financeiros novos; build NestJS passou.
- [x] Exportação web do Expo.
- [x] Bundle Android gerado pelo Expo (compilação JS/Hermes; não representa teste em aparelho nem APK).
- [x] Navegador a 390 × 844 com API fictícia local: boas-vindas, validação de cadastro, login, sessão ao recarregar, menu, ocultação, criação de conta a partir de lançamento, retorno com título/valor preservados, seleção da nova conta e salvamento do lançamento e estado de falha de conexão com ação Tentar novamente.
- [ ] Homologação em aparelho ou emulador Android/iOS; nenhum dispositivo estava conectado ao ambiente.

Os testes financeiros usam um cliente Prisma simulado: verificam os saldos, reversões, mudança de conta/tipo/valor, rollback, centavos, datas e tentativas limitadas de conflitos. Não substituem teste concorrente contra PostgreSQL real. O teste de limite de login existente também foi corrigido para exigir 401 nas primeiras tentativas, em vez de aceitar erros 500.

A fase fica aberta apenas para homologação nativa. Nenhuma funcionalidade do P1 foi iniciada.

## Correção após teste Android — 31/10/2026

- [x] Ajustar limite geral para 120 requisições/minuto por rota, mantendo login/cadastro em 5 tentativas/minuto.
- [x] Corrigir classificação do HTTP 429 para Too Many Requests no filtro de exceções.
- [x] Compartilhar consultas simultâneas e reutilizar leituras por 10 segundos no aplicativo.
- [x] Invalidar leituras após gravações e logout; atualização manual força nova consulta.
- [x] Remover consulta de resumo ainda sem uso e painéis de erro repetidos no Dashboard.
- [x] Validar limites com controladores reais e repositórios simulados: 120 leituras de contas permitidas, a seguinte retorna 429 com Retry-After; 15 consultas mensais permitidas; sexta tentativa de login bloqueada.
- [x] Testes: 56 no backend e 13 no mobile; TypeScript, lint dos arquivos de backend alterados e build NestJS.
- [ ] Revalidar navegação Android após instalar/recarregar a versão corrigida.

## Ajustes de perfil, carregamento e navegação — 31/10/2026

- [x] Perfil e Categorias em rotas da pilha principal; abrir Perfil pelo avatar ou pelo menu Mais.
- [x] Saída da conta disponível no Perfil e diretamente em Mais.
- [x] Confirmação dentro do app, sem depender de window.confirm/Alert nativo; cancelamento e confirmação dupla mantidos.
- [x] Novo registro na posição central da barra inferior, com painel de nova receita, despesa e conta; removido o botão flutuante das telas.
- [x] Todos os carregamentos por skeleton: hidratação, transição, listas, campos e botões. Animação respeita reduzir movimento.
- [x] Controles nativos de puxar para atualizar removidos para evitar seus spinners. Os botões Atualizar adicionados nesta revisão foram retirados no ajuste final abaixo.
- [x] Rotas carregadas de forma síncrona para evitar o placeholder de bundling do Expo Router; fallback de navegação com skeleton.
- [x] TypeScript e 16 testes mobile passaram, incluindo cancelamento de confirmação, toques repetidos e confirmação em duas etapas.
- [x] Navegador com dados fictícios: login com skeleton, acesso ao Perfil por dois caminhos, cancelar logout, confirmar logout até boas-vindas, logout por Mais e novo registro central abrindo receita.
- [x] Bundles finais de Android e web gerados com a configuração normal da aplicação.
- [ ] Revalidar no aparelho Android após reiniciar Metro com npx expo start -c e recarregar o aplicativo.

## Ajustes finais antes do P1 — 31/10/2026

- [x] Remover todos os botões Atualizar, seus handlers e o componente RefreshButton.
- [x] Manter carregamento automático existente e Tentar novamente apenas em estados de erro.
- [x] Remover o título duplicado de Transações: a lista usa ScreenHeader e seu cabeçalho nativo fica oculto; criação e edição mantêm os cabeçalhos da pilha.
- [x] Verificação final: TypeScript, 16 testes mobile e revisão do diff passaram; sem referências ao componente ou aos botões Atualizar no código da aplicação.
