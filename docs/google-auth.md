# Ativar o login com Google

Implementação adicionada em 31/10/2026 para Android, iOS e Expo/web. O Google fornece um ID token; o app envia somente esse token para `POST /auth/google`. A API valida a identidade e devolve a sessão JWT do fin-9. No celular, apenas o JWT do fin-9 é persistido no SecureStore. Não há Firebase nem Client Secret neste fluxo.

## 1. Configurar o Google Cloud

Use um único projeto do Google Cloud para os clientes abaixo:

1. Configure a tela de consentimento OAuth com o nome fin-9 e os dados de suporte. Durante a fase de testes, adicione as contas que vão homologar o login à lista de usuários de teste.
2. Crie um cliente OAuth do tipo **Aplicativo da Web**. Esse é o Client ID usado pelo app e pelo backend para a audiência dos tokens, inclusive no Android/iOS.
3. Para Expo/web, cadastre as **origens JavaScript autorizadas**: por exemplo, `http://localhost:8083` no desenvolvimento e a origem HTTPS publicada. A porta deve corresponder ao servidor em execução. A versão web usa o botão oficial do Google em modo popup; não exige uma rota de redirecionamento da API.
4. Crie um cliente OAuth do tipo **Android**, com pacote `com.fin9.mobile` e o SHA-1 do certificado que assina a build instalada. Cadastre também os certificados necessários para desenvolvimento, EAS e Google Play conforme os ambientes utilizados. O Android Client ID não vai no `.env`: pacote e assinatura são conferidos pelo SDK.
5. Para iOS, crie um cliente OAuth do tipo **iOS**, com Bundle ID `com.fin9.mobile`. Copie seu Client ID iOS. O `app.config.ts` deriva dele o URL scheme de retorno, `com.googleusercontent.apps.<id>`, pelo plugin da biblioteca.

## 2. Preencher os ambientes

Copie `.env.example` para um arquivo de ambiente próprio ou acrescente estes valores ao `.env` existente, preservando `EXPO_PUBLIC_API_URL`:

```dotenv
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<client-id-web>.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<client-id-ios>.apps.googleusercontent.com
```

O cliente iOS só é necessário se essa plataforma for utilizada. Esses valores são identificadores públicos; não coloque Client Secret em variáveis `EXPO_PUBLIC_*`.

No ambiente do backend:

```dotenv
GOOGLE_WEB_CLIENT_ID=<o-mesmo-client-id-web-do-app>.apps.googleusercontent.com
```

Veja também [a configuração do backend](../../fin-9-backend/docs/google-auth.md). A migration `20261101030000_google_auth` já foi aplicada no banco local durante esta implementação. No ambiente de publicação, execute `npx prisma migrate deploy` e `npx prisma generate` antes de iniciar a API atualizada. A migration preserva senhas existentes e permite contas novas sem senha.

Reinicie o Expo depois de alterar o ambiente. Variáveis `EXPO_PUBLIC_*` são incorporadas ao bundle: configure-as também no ambiente/perfil EAS usado para gerar a build.

## 3. Gerar uma nova build nativa

O login nativo usa `@react-native-google-signin/google-signin`, instalado no projeto. Ele exige uma nova development build ou build de distribuição; não funciona no Expo Go nem é adicionado por uma atualização apenas de JavaScript.

```bash
eas build --profile development --platform android
```

Para iOS, configure o Client ID iOS antes de gerar a build:

```bash
eas build --profile development --platform ios
```

Instale a build e inicie o Metro com `npx expo start --dev-client`. Em projetos nativos locais já gerados, sincronize o plugin por prebuild antes de recompilar. Android funciona sem arquivos Firebase `google-services.json`; a associação usa o cliente OAuth Android e o Web Client ID.

### Erro `RNGoogleSignin could not be found` no Android

Esse erro indica que o APK instalado não contém o módulo nativo do Google. Ele acontece no Expo Go ou ao usar uma development build gerada antes da instalação da biblioteca. Instalar o pacote npm e recarregar o JavaScript não atualiza o código nativo desse APK.

No diretório `fin-9-mobile`, gere uma nova build:

```bash
npx eas-cli build --profile development --platform android
```

Instale o **APK recém-gerado** no dispositivo e abra o aplicativo fin-9 instalado. Depois, inicie o Metro:

```bash
npx expo start --dev-client --clear
```

O perfil `preview` também pode gerar um APK completo para testes sem Metro. Em ambiente Android Studio local, a alternativa é recompilar por `npx expo run:android`; diretórios nativos existentes precisam incorporar a nova dependência.

O app verifica a presença de `RNGoogleSignin` antes de importar o SDK. Se o binário estiver desatualizado, exibe uma orientação para instalar a nova build, sem acionar a falha fatal do carregador do Metro.

As variáveis `GOOGLE_WEB_CLIENT_ID` e `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` continuam recebendo o Client ID do tipo **Aplicativo da Web**, inclusive ao testar Android. O cliente Android deve existir no Google Cloud com pacote e SHA-1 corretos, mas seu ID não substitui o Web Client ID nessas variáveis.

## Comportamento das contas

- O botão faz login ou cria a conta no primeiro acesso. Novas contas recebem as categorias padrão na mesma transação.
- Uma conta existente com Gmail ou Workspace verificado pode ser vinculada ao Google correspondente. Seus dados financeiros, nome, e-mail e senha anteriores são preservados.
- O vínculo persistido usa `sub`, o identificador estável do Google. Outro Google não substitui esse vínculo.
- Endereços de outro provedor já cadastrados no fin-9 não são vinculados automaticamente só porque aparecem verificados no Google. Nesse caso, continue usando o método de acesso existente.
- Cancelar o seletor volta ao formulário, sem erro. Enquanto a autenticação está em andamento, os envios concorrentes ficam bloqueados.
- Sair remove o JWT do fin-9 e limpa a seleção local do Google, sem sair da conta Google do dispositivo. Uma falha na limpeza do SDK não mantém a sessão do fin-9.
- Sem Client IDs válidos, o login por e-mail continua disponível e o botão Google informa que o recurso está indisponível. Nenhum token ou perfil fictício é utilizado como autenticação.

## Validação realizada

- TypeScript do mobile e build TypeScript do backend aprovados.
- 149 testes Jest do backend aprovados: assinatura/audiência/validade delegadas ao verificador oficial, DTO, limite de tentativas, sessão, vínculo de contas e ocultação dos tokens nos logs.
- 6 cenários de persistência no PostgreSQL local aprovados: criação, repetição, preservação de dados, bloqueio de vínculos inseguros e logins/vínculos simultâneos. Comando: `npm run test:google`, no backend.
- 32 testes do mobile aprovados, incluindo sessão, cancelamento, falhas, bloqueio concorrente, configuração, nonce web, descarte de callbacks de telas anteriores e prevenção da importação fatal do SDK quando o módulo nativo está ausente. Comando: `node --test tests/google-native.test.cjs tests/google-auth.test.cjs tests/google-identity-web.test.cjs`.
- Autolinking Android conferido: a dependência é descoberta como `RNGoogleSigninPackage` para inclusão na próxima build. O Expo Go precisa ser substituído por uma development build para esse recurso.
- ESLint dos arquivos de backend afetados aprovado.
- Bundles Android/Hermes e web aprovados: `npx expo export --platform android --platform web --output-dir dist/google-auth`.
- Navegador a 390 × 844: botão acessível, mensagem clara sem Client IDs, formulário por e-mail preservado e nenhum erro no console.
- A suíte geral mobile mantém a falha preexistente em `tests/theme.test.cjs`: o teste espera fundo escuro `10 10 10`, enquanto a paleta existente usa `11 18 32`.

Como os Client IDs ainda não foram criados, o consentimento real do Google e o retorno do SDK em aparelho Android/iOS continuam pendentes. Após configurar, confira primeiro acesso, novo acesso à mesma conta, conta local existente, cancelamento, logout/troca de conta e persistência após fechar o app.

## Referências oficiais

- [Autenticação Google com Expo](https://docs.expo.dev/guides/google-authentication/).
- [Configuração Expo da biblioteca nativa](https://react-native-google-signin.github.io/docs/setting-up/expo).
- [API nativa de login](https://react-native-google-signin.github.io/docs/original).
- [Botão e callback JavaScript do Google](https://developers.google.com/identity/gsi/web/reference/js-reference).
- [Validação de ID tokens no servidor](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token).

Foi usada a API gratuita Original da biblioteca nativa. Seu SDK Android legado ainda funciona, mas está descontinuado; a migração para Credential Manager deve ser considerada quando a alternativa escolhida estiver validada com a versão React Native do projeto.
