# Tela de início — revisão visual

Implementada em 31/10/2026, inspirada nas referências visuais fornecidas pelo usuário.

## Experiência

- Fundo grafite com iluminação verde, tipografia expressiva e chamada “Seu dinheiro. Suas escolhas. Seu próximo nível.”.
- Cartões ilustrativos de saldo e metas, sobrepostos, com gradientes e sombras. Valores são exemplos decorativos, sem consulta à API.
- Logo oficial de `assets/icon.png` no cabeçalho e no cartão frontal; composição sem a caixa flutuante “Mais clareza. Mais liberdade.”.
- Entrada em sequência da ilustração e texto; flutuação e rotação suaves dos cartões. Ações permanecem visíveis desde a abertura, independentemente da animação.
- “Começar agora” abre o cadastro; “Entrar” abre o login. A proteção de sessão e os redirecionamentos existentes continuam nas rotas atuais.
- Layout centralizado com largura máxima e ilustração adaptada à largura e altura disponíveis. Cabeçalho e ações ficam fora da rolagem, respeitando a área segura; apenas a ilustração e o texto rolam em telas pequenas ou com fontes ampliadas. Recorte de filhos do ScrollView desativado para preservar os elementos transformados no Android.
- Nome “Fin-9.” com inicial maiúscula no cabeçalho e nos cartões ilustrativos.
- Preferência de movimento reduzido respeitada, animações interrompidas ao perder foco ou entrar em segundo plano, barra de status clara apenas enquanto a tela está ativa.
- Ilustração oculta dos leitores de tela; fontes decorativas não ampliam dentro dos cartões de tamanho fixo. Conteúdo e ações mantêm suporte à ampliação de fonte.

Implementação com componentes e animações do React Native, Feather e gradientes nativos disponíveis no RN 0.88 instalado; sem novas dependências.

## Validação

- TypeScript: `npm run typecheck` concluído sem erros.
- 22 testes mobile existentes aprovados com `npm test`.
- Navegador: composição a 390 × 844, adaptação a 320 × 667 sem overflow horizontal do conteúdo e centralização a 768 × 1024.
- Navegador: cadastro, retorno à apresentação e acesso ao login confirmados pelos botões.
- Navegador com preferência de movimento reduzido ativa: ilustração e conteúdo visíveis em posição estática.
- Bundle Android/Hermes: `npx expo export --platform android --output-dir dist/welcome-android` concluído. A primeira tentativa no sandbox falhou por permissão de escrita do compilador em arquivo temporário; a execução fora do sandbox concluiu normalmente.
- Revisão do ciclo das animações e acessibilidade dos componentes.
- Correção do botão abaixo da área visível no Android: ações fixas sem opacidade animada, conferidas integralmente visíveis em viewports de 320 × 480, 360 × 560 e 390 × 844. TypeScript e bundle Android/Hermes aprovados após a correção.

Conferência visual e das animações em aparelho Android/iOS real ou emulador permanece pendente.
