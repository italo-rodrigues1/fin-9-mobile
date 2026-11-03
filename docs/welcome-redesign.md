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
- Conteúdo da área rolável alinhado ao final, mantendo apenas 14 px entre a descrição e o botão em 390 × 844; os cartões preservam o destaque visual e o espaço excedente fica acima da ilustração.
- Ações com `TouchableOpacity`, estilos estáticos e feedback de toque por opacidade, compatíveis com o processamento nativo do NativeWind.
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
- Ajuste de espaço para as ações: botões fixos sem opacidade de entrada animada, conferidos integralmente dentro de viewports de 320 × 480, 360 × 560 e 390 × 844. Essa verificação de layout no navegador não detectou o descarte dos estilos no runtime nativo, corrigido abaixo.
- Composição compactada conferida em 390 × 844 e 360 × 640; nesta última, a página não cria rolagem externa e o botão permanece integralmente visível.

## Botão invisível no Android

O usuário confirmou que tocar na posição do botão abria o cadastro, embora o botão permanecesse invisível. O runtime nativo instalado (`react-native-css-interop` 0.2.2) processa todos os `Pressable`, mesmo sem `className`. Ao resolver uma função em `style`, o processamento de declarações faz uma cópia de suas propriedades com `{ ...declaration }`, resultando em um objeto vazio. Assim, o fundo verde, o tamanho e os espaçamentos do botão eram descartados, enquanto o texto `#0B1210` permanecia sobre o fundo da tela da mesma cor. O evento de toque era preservado.

Ambas as ações agora usam `TouchableOpacity` com estilos estáticos e `activeOpacity`, preservando o desenho e o feedback de toque. O problema e a solução foram reproduzidos executando o resolvedor nativo instalado com React e React Native simulados, sem depender do comportamento diferente do resolvedor web. Há um [relato correspondente no repositório do NativeWind](https://github.com/nativewind/nativewind/issues/1105).

O teste de regressão em `tests/welcome-native.test.cjs` carrega o botão real da tela e passa seus estilos pelo resolvedor nativo instalado. Verifica fundo, altura, contraste e navegação ao cadastro. Restaurar o callback anterior apenas em memória faz esse teste falhar por ausência do fundo verde. TypeScript e bundle Android/Hermes passaram. Na execução da suíte completa, o teste de variáveis do tema falhou por esperar `10 10 10` e receber `11 18 32` da paleta atual; esses arquivos de tema não foram alterados nesta correção.

Conferência visual e das animações em aparelho Android/iOS real ou emulador permanece pendente.
