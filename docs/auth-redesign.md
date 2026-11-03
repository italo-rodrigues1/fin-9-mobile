# Login e cadastro — revisão visual

Implementados em 31/10/2026, com base na referência fornecida pelo usuário.

- Cabeçalho verde com gradiente e formas decorativas, logo oficial de `assets/icon.png`, nome consistente com a apresentação e formulário em cartão sobreposto.
- Cores semânticas do tema, tipografia do aplicativo e componentes compartilhados `Button`, `BackButton`, `Input` e wrappers de teclado. Sem novas dependências.
- Variante opcional do `Input` com ícone, rótulo interno, destaque de foco e alternância de visibilidade da senha. A aparência padrão dos outros formulários foi preservada.
- Requisitos de senha atualizados durante a digitação; validações por campo, confirmação de senha e limites alinhados à API. Edição limpa o erro do campo; troca de tela limpa o erro de autenticação compartilhado.
- Somente Google como opção social no login. O botão inicialmente visual recebeu integração posteriormente; veja [autenticação Google](google-auth.md) para configuração e validação. Cadastro segue a composição da referência, sem opções sociais.
- Links de navegação pelo Expo Router, nomes acessíveis nos campos e botões, rolagem e mecanismo de revelação dos campos ao abrir o teclado. Área superior da barra de status permanece verde durante a rolagem.
- Recuperação de senha não foi adicionada: não há um fluxo existente no aplicativo/API para essa ação da referência.

## Validação

- `npm run typecheck`: aprovado.
- `npm test`: 29 de 30 aprovados. Falha preexistente em `tests/theme.test.cjs`, que espera fundo escuro `10 10 10`, enquanto a paleta já modificada antes desta entrega usa `11 18 32`. Paleta e teste foram preservados.
- Bundle Android/Hermes: `npx expo export --platform android --output-dir dist/auth-android` aprovado. A execução inicial no sandbox falhou na geração do arquivo temporário do Hermes; a execução fora do sandbox concluiu normalmente.
- Navegador, tema escuro: login/cadastro em 390 × 844, adaptação a 320 × 667 com rolagem até a ação final, sem overflow horizontal, e composição centralizada em 768 × 1024.
- Conferidos: campos obrigatórios, e-mail inválido, limpeza de erros ao editar, exibição/ocultação de senha, três requisitos da senha, confirmação divergente, navegação entre telas e ativação do link por Enter.
- Na revisão visual inicial, Google foi conferido como botão desabilitado. A implementação funcional posterior e suas verificações estão no [guia de autenticação Google](google-auth.md).
- Capturas locais em `dist/auth-preview/login.jpg` e `dist/auth-preview/register.jpg`.

Conferência visual em aparelho Android/iOS e com teclado nativo permanece pendente.
