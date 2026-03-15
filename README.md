# Mobile

Aplicativo mobile do projeto Fin-9, construído com Expo, Expo Router e React Native.

## Requisitos

- Node.js instalado
- npm instalado
- Expo Go no celular para testes rápidos
- Conta no Expo e login no CLI para gerar builds com EAS
- Backend do projeto disponível localmente ou em produção

## Instalação

No diretório `mobile`, instale as dependências:

```bash
npm install
```

## Configuração de ambiente

O app usa a variável `EXPO_PUBLIC_API_URL` para acessar a API.

Arquivo: `.env`

```env
EXPO_PUBLIC_API_URL=http://192.168.18.194:3333
```

### Importante para uso local no celular

- Não use `localhost` quando for testar no celular.
- Use o IP da máquina onde o backend está rodando.
- O celular e o computador precisam estar na mesma rede.
- Se o IP da máquina mudar, atualize o `.env`.

Se preferir usar a API publicada, troque a variável para a URL remota.

## Como iniciar localmente

Entre na pasta `mobile` e rode:

```bash
npm run start
```

Isso inicia o servidor do Expo.

### Opção 1: usar com Expo Go

Esse é o fluxo mais simples para desenvolvimento local.

```bash
npx expo start --go
```

Depois:

- abra o app Expo Go no celular
- escaneie o QR code exibido no terminal

Se você iniciou com `npm run start`, pode pressionar `s` no terminal do Expo para alternar o modo até `Expo Go`.

### Opção 2: usar com Development Build

Este projeto já está preparado para usar `expo-dev-client` e build de desenvolvimento via EAS.

Arquivo de configuração: `eas.json`

O perfil `development` está com:

- `developmentClient: true`
- `distribution: internal`

Isso significa que, em alguns casos, o QR code local vai abrir apenas em um app de desenvolvimento instalado no celular, e não no Expo Go.

Para usar esse fluxo:

1. Gere o build de desenvolvimento:

```bash
eas build --profile development --platform android
```

2. Instale o APK ou build gerado no celular.
3. Inicie o projeto localmente:

```bash
npm run start
```

4. Escaneie o QR com o app de desenvolvimento instalado.

Se o QR for lido e nada acontecer, normalmente é porque:

- o projeto está em modo `Development Build` e você tentou abrir no Expo Go
- o app de desenvolvimento não está instalado no celular
- o celular não consegue alcançar a API definida no `.env`

## Como rodar no Android ou iOS localmente

Se tiver o ambiente nativo configurado, você também pode usar:

```bash
npm run android
```

```bash
npm run ios
```

Esses comandos usam `expo run:android` e `expo run:ios`.

## Deploy com Expo EAS

Este projeto usa EAS para gerar builds.

Arquivo de configuração: `eas.json`

Perfis disponíveis:

- `development`: build de desenvolvimento com `expo-dev-client`
- `preview`: build interna para validação
- `production`: build de produção com incremento automático de versão

## Login no Expo

Antes do deploy, faça login:

```bash
npx expo login
```

Se preferir:

```bash
eas login
```

## Build de desenvolvimento

Gera um app para testes locais com dev client:

```bash
eas build --profile development --platform android
```

## Build de preview

Gera uma build interna para compartilhar:

```bash
eas build --profile preview --platform android
```

## Build de produção

Gera a build final de produção:

```bash
eas build --profile production --platform android
```

Se precisar para iOS, troque a plataforma:

```bash
eas build --profile production --platform ios
```

## Publicação e atualização

Se o objetivo for distribuir binários, use `eas build`.

Se o objetivo for publicar atualizações JavaScript e assets sem gerar uma nova build nativa, o fluxo normalmente é feito com `eas update`, desde que o projeto esteja configurado para isso.

Exemplo:

```bash
eas update --branch production --message "Atualizacao do app"
```

## Fluxo recomendado para desenvolvimento

1. Suba o backend localmente.
2. Ajuste `EXPO_PUBLIC_API_URL` com o IP atual da máquina.
3. Entre em `mobile`.
4. Rode `npx expo start --go` para o fluxo mais simples.
5. Se precisar de recursos do dev client, gere e instale um build `development`.

## Solução de problemas

### O QR code é lido, mas o app não abre

Verifique:

- se o Expo está em modo `Expo Go` ou `Development Build`
- se o app correto está instalado no celular
- se o celular está na mesma rede do computador

### O app abre, mas não carrega dados

Verifique:

- se o backend está rodando
- se `EXPO_PUBLIC_API_URL` aponta para o IP correto
- se a porta `3333` está acessível pela rede local

### O app funcionava antes e parou depois do deploy

Isso geralmente acontece porque o fluxo mudou de `Expo Go` para `Development Build`. O deploy não impede o uso local, mas pode mudar a forma como o QR code precisa ser aberto.
