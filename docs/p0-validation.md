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
- [x] Quatro testes mobile: dinheiro, datas em três fusos, privacidade e erros da API.
- [x] Backend: 53 testes passaram, incluindo 10 testes financeiros novos; build NestJS passou.
- [x] Exportação web do Expo.
- [x] Bundle Android gerado pelo Expo (compilação JS/Hermes; não representa teste em aparelho nem APK).
- [x] Navegador a 390 × 844 com API fictícia local: boas-vindas, validação de cadastro, login, sessão ao recarregar, menu, ocultação, criação de conta a partir de lançamento, retorno com título/valor preservados, seleção da nova conta e salvamento do lançamento e estado de falha de conexão com ação Tentar novamente.
- [ ] Homologação em aparelho ou emulador Android/iOS; nenhum dispositivo estava conectado ao ambiente.

Os testes financeiros usam um cliente Prisma simulado: verificam os saldos, reversões, mudança de conta/tipo/valor, rollback, centavos, datas e tentativas limitadas de conflitos. Não substituem teste concorrente contra PostgreSQL real. O teste de limite de login existente também foi corrigido para exigir 401 nas primeiras tentativas, em vez de aceitar erros 500.

A fase fica aberta apenas para homologação nativa. Nenhuma funcionalidade do P1 foi iniciada.
