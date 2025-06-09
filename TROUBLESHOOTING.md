<!-- filepath: d:\Documentos\Alura\React Native\Fokus\fokus-app\TROUBLESHOOTING.md -->

# Guia de Solução de Problemas - Fokus App

Este guia contém passos para resolver problemas comuns ao executar o aplicativo Fokus em dispositivos Android.

## Erro de TypeConverterProvider

Se você encontrar o erro:

```text
No virtual method getConverters()Lexpo/modules/kotlin/types/TypeConverterProvider; in class Lexpo/modules/kotlin/objects/ObjectDefinitionBuilder;
```

Execute o script de correção específico:

```bash
npm run fix-module-error
```

Este erro ocorre por incompatibilidade de versões entre os módulos Expo instalados e os módulos compilados no APK.

### Detalhes da solução

O problema ocorre quando há incompatibilidade entre:

1. As versões dos módulos `expo-modules-core` e outros módulos Kotlin do Expo
2. Versões ou estruturas de código nativo compilado no APK
3. Caches desatualizados ou corrompidos na aplicação

O script de correção automatiza os seguintes passos:

1. Limpa o cache do NPM
2. Remove os módulos problemáticos para forçar uma reinstalação limpa
3. Reinstala todas as dependências
4. Executa um `prebuild --clean` para reconstruir todas as partes nativas do projeto

Isso geralmente resolve problemas de incompatibilidade de versões em aplicativos Expo.

### Causas comuns

Este erro frequentemente aparece após adicionar novos módulos nativos, como:

1. **expo-web-browser**: Usado para autenticação (como no componente `botaoSpotify`)
2. **expo-auth-session**: Usado para fluxos de autenticação OAuth
3. Atualizações de versão do Expo ou React Native

Em nosso projeto específico, o erro surgiu após a adição do botão de integração com o Spotify, que utiliza o módulo `expo-web-browser` para autenticação OAuth.

## Problemas com o Botão do Spotify e expo-web-browser

Se você estiver enfrentando problemas especificamente relacionados ao botão do Spotify ou à integração com o Spotify API, considere os seguintes passos:

1. Execute o script de correção específico para o botão do Spotify:

```bash
npm run fix-spotify-button
```

2. Verifique se você configurou corretamente as URIs de redirecionamento no Spotify Developer Dashboard para incluir todos os possíveis cenários:

   - Para emuladores Android: `exp://10.0.2.2:8083`
   - Para dispositivos físicos: `exp://SEU_IP_LOCAL:8083`
   - Para Expo Go: `exp://exp.host/@seuusuario/fokus-app`

3. Se ainda encontrar problemas, considere usar a alternativa implementada:

## Problemas com Reprodução de Áudio do YouTube

Se você encontrar o erro:

```
UnrecognizedInputFormatException: None of the available extractors could read the stream
```

Este erro ocorre quando o app tenta reproduzir diretamente URLs do YouTube usando o `expo-av`.

### Causas do problema:

1. O componente Audio do Expo não consegue processar diretamente URLs do YouTube
2. O YouTube não fornece acesso direto ao fluxo de áudio/vídeo através da URL padrão
3. É necessário extrair as URLs reais de mídia usando serviços especializados

### Solução implementada:

Implementamos um sistema de fallback robusto no componente `BotaoMusica` que:

1. **Detecta URLs do YouTube**: O código identifica automaticamente URLs do YouTube e extrai o ID do vídeo.

2. **Utiliza várias estratégias em sequência**:

   - Tenta obter URL alternativa da nossa API própria
   - Verifica uma lista de URLs de fallback predefinidas para vídeos populares
   - Usa uma URL de fallback genérica como última opção

3. **Garante uma experiência contínua**: Mesmo que não seja possível reproduzir o áudio original do YouTube, o usuário ainda terá uma experiência musical adequada.

4. **Implementação técnica**:

```javascript
// Exemplo simplificado da implementação
const getCompatibleAudioUrl = async (musica) => {
  // Extrair URL original
  let audioUrl = musica.url || musica.audio;

  // Verificar se é YouTube
  if (audioUrl.includes("youtube.com") || audioUrl.includes("youtu.be")) {
    // Extrair ID do YouTube
    const youtubeId = extractYouTubeId(audioUrl);

    // Tentar obter da API
    // Verificar URLs de fallback predefinidas
    // Usar URL genérica como última opção
    return fallbackUrl;
  }

  // Se não for YouTube, usar URL original
  return audioUrl;
};
```

### Como funciona a solução de fallback:

Quando um URL do YouTube é detectado, o componente segue estas etapas:

1. **Extração do ID**: Usa expressões regulares para extrair o ID do vídeo do YouTube
2. **Tenta API própria**: Solicita uma URL alternativa da nossa API em `api-musicas.vercel.app`
3. **Verifica lista de fallback**: Para vídeos populares (como o Lofi Girl), usa URLs alternativas predefinidas
4. **Fallback genérico**: Como último recurso, reproduz uma música ambiente genérica

Esta abordagem garante que o usuário sempre terá uma experiência musical, mesmo quando o áudio original do YouTube não pode ser acessado diretamente.

## Alternativa à Integração com Spotify: API de Música Própria

Devido à complexidade da autenticação OAuth do Spotify e para evitar problemas de redirecionamento, implementamos uma solução alternativa mais robusta usando uma API própria hospedada na Vercel.

### Benefícios da API própria

1. **Simplicidade**: Sem necessidade de autenticação OAuth complexa
2. **Confiabilidade**: Sem problemas de redirecionamento ou tokens expirados
3. **Desempenho**: Resposta mais rápida e menor consumo de recursos
4. **Controle total**: As playlists são totalmente controladas por nós

### Como usar

O componente `BotaoMusica` substitui o `botaoSpotify` e se conecta à nossa API em `https://api-musicas.vercel.app/api`.

Se você precisar modificar a URL da API, edite a constante `API_URL` no arquivo:

```
components/botaoMusica/index.jsx
```

### 1. Problemas de autenticação OAuth

O componente `botaoSpotify` utiliza `expo-web-browser` e `expo-auth-session` para autenticação OAuth com o Spotify. Se você encontrar erros como:

- Falha na abertura do navegador para autenticação
- Redirecionamentos não funcionando corretamente
- Erros de incompatibilidade do `expo-web-browser`

Tente as seguintes soluções:

1. **Verifique as versões compatíveis:**

   ```bash
   npm ls expo-web-browser expo-auth-session
   ```

2. **Limpe o cache do Expo:**

   ```bash
   npx expo-doctor
   ```

3. **Reconstrua o código nativo:**
   ```bash
   npm run fix-module-error
   ```

### 2. Erros de URI de redirecionamento

Se o fluxo de autenticação do Spotify falhar com erros relacionados ao URI de redirecionamento:

1. Verifique se a constante `REDIRECT_URI` no componente `botaoSpotify/index.jsx` corresponde exatamente ao URI configurado no Painel do Desenvolvedor do Spotify.

2. Para ambiente de desenvolvimento, use uma configuração baseada na plataforma:

   ```javascript
   const getRedirectUri = () => {
     // Determinar o ambiente de execução
     if (__DEV__) {
       // Ambiente de desenvolvimento
       if (Platform.OS === "android") {
         // Emulador Android geralmente usa 10.0.2.2 como localhost
         return "exp://10.0.2.2:8083";
       } else if (Platform.OS === "ios") {
         // Emulador iOS
         return "exp://localhost:8083";
       } else {
         // Web ou outros
         return "http://localhost:8083";
       }
     } else {
       // Ambiente de produção - usar o URL do Expo
       const projectId =
         Constants.expoConfig?.extra?.projectId ||
         Constants.manifest?.extra?.projectId ||
         "fokus-app";
       return `exp://exp.host/@seuusuario/${projectId}`;
     }
   };

   const REDIRECT_URI = getRedirectUri();
   ```

3. Para versão de produção, use o esquema de URI do seu aplicativo:
   ```javascript
   const REDIRECT_URI = "com.mxsgamejps.fokusApp://redirect";
   ```

### 3. Erro de TypeConverterProvider após adicionar o botão do Spotify

Se o erro `No virtual method getConverters()Lexpo/modules/kotlin/types/TypeConverterProvider;` apareceu após adicionar o componente Spotify, é provavelmente uma incompatibilidade entre o `expo-web-browser` e outros módulos nativos.

Resolução:

1. Execute o script de correção:

   ```bash
   npm run fix-module-error
   ```

2. Se o problema persistir, considere remover temporariamente o botão do Spotify para confirmar se ele é a causa do problema.

### 2. Reconstruir o aplicativo nativo

Se o problema persistir, tente reconstruir o projeto nativo:

```bash
# Limpar a construção atual
cd android
./gradlew clean

# Reconstruir o projeto
./gradlew assembleDebug
```

### 3. Verificar o dispositivo

Certifique-se de que:

- O dispositivo está conectado corretamente (verifique com `adb devices`)
- A depuração USB está ativada no dispositivo
- Você permitiu a instalação de apps de fontes desconhecidas

### 4. Reinstalar o aplicativo

```bash
# Desinstalar a versão atual
adb uninstall com.mxsgamejps.fokusApp

# Instalar a nova versão
cd android
./gradlew installDebug
```

### 5. Verificar versões

Certifique-se de que você está usando versões compatíveis:

- Node.js: recomendado v18 ou superior
- Expo CLI: a versão atual é 0.24.13
- React Native: a versão atual é 0.79.2

### 6. Iniciar com opções específicas

Para depuração mais detalhada, inicie o aplicativo com:

```bash
npx expo start --clear --no-dev --minify
```

### 7. Problemas específicos com o Reanimated

Se você estiver enfrentando problemas relacionados ao react-native-reanimated, tente:

```bash
# Corrigir o Reanimated
cd android
./gradlew clean
cd ..
npx expo prebuild --clean
npx expo run:android
```

## Erro de "Unmatched Route" ou "Page could not be found"

Se você encontrar o erro "Unmatched Route" ou "Page could not be found" ao iniciar o aplicativo, este é um problema relacionado à navegação com o expo-router.

### Causa do problema

O erro pode ocorrer devido a:

1. Conflitos entre rotas definidas no `_layout.jsx` e arquivos reais na estrutura do projeto
2. Problemas com a configuração de redirecionamento no arquivo `index.jsx`
3. Uso incorreto da sintaxe de navegação do expo-router

### Solução

1. **Criar um arquivo `index.jsx` na pasta app/ que use o componente Redirect:**

   ```javascript
   import { Redirect } from "expo-router";
   import { useEffect } from "react";
   import { LogBox } from "react-native";

   export default function Index() {
     // Desabilitar avisos específicos do sistema
     useEffect(() => {
       // Ignorar avisos específicos relacionados a problemas conhecidos
       LogBox.ignoreLogs([
         "Attempted to navigate before mounting the Root Layout component",
         "Failed to download remote update",
         "Unmatched Route",
       ]);
     }, []);

     return <Redirect href="Home" />;
   }
   ```

   Esta abordagem é melhor que usar `router.replace()` dentro de `useEffect` porque o Redirect é executado como parte do ciclo de renderização normal, evitando problemas de timing.

2. **Remover conflitos no arquivo `_layout.jsx`:**

   Se você tem uma rota definida para `index` no arquivo `_layout.jsx`, isso pode causar conflitos com o arquivo `index.jsx`. Considere remover ou comentar essa definição.

3. **Limpar o cache e reconstruir:**

   Execute o seguinte comando para limpar o cache e reconstruir o aplicativo:

   ```bash
   npx expo start --clear
   ```

   Em caso de problemas persistentes, tente o seguinte:

   ```bash
   npx expo-doctor
   ```

   Seguido por:

   ```bash
   npm run fix-module-error
   ```

4. **Verificar estrutura de pastas:**

   Certifique-se de que a estrutura de pastas do seu aplicativo corresponde corretamente à navegação esperada pelo expo-router.

### Informações adicionais

A navegação do expo-router é baseada em arquivos, e cada arquivo na pasta `app/` se torna uma rota automaticamente. O arquivo `_layout.jsx` define o layout compartilhado entre as rotas.

Quando há conflitos ou problemas de configuração, o erro "Unmatched Route" pode aparecer, indicando que o expo-router não conseguiu encontrar uma rota correspondente ao caminho atual.

## Construindo um APK para testes

Para construir um APK para testes externos:

```bash
npm run build-apk
```

O arquivo APK será gerado em `android/app/build/outputs/apk/release/app-release.apk`.

## Erro "Failed to download remote update" ao usar o botão do Spotify

Se você estiver recebendo o erro:

```
Uncaught error: java.io.IOException: Failed to download remote update
```

ao clicar no botão do Spotify e fazer login, isso geralmente ocorre devido a problemas com o redirecionamento e o WebBrowser em aplicativos Expo, especialmente após a compilação Android.

### Solução:

1. **Implementar detecção automática de ambiente:**

   Atualize o componente para detectar automaticamente o ambiente e configurar o URL de redirecionamento corretamente:

   ```javascript
   import { Platform } from "react-native";
   import Constants from "expo-constants";

   // Configuração inteligente de REDIRECT_URI baseada na plataforma
   const getRedirectUri = () => {
     // Determinar o ambiente de execução
     if (__DEV__) {
       // Ambiente de desenvolvimento
       if (Platform.OS === "android") {
         // Emulador Android geralmente usa 10.0.2.2 como localhost
         return "exp://10.0.2.2:8083";
       } else if (Platform.OS === "ios") {
         // Emulador iOS
         return "exp://localhost:8083";
       } else {
         // Web ou outros
         return "http://localhost:8083";
       }
     } else {
       // Ambiente de produção - usar o URL do Expo
       const projectId =
         Constants.expoConfig?.extra?.projectId ||
         Constants.manifest?.extra?.projectId ||
         "fokus-app";
       return `exp://exp.host/@seuusuario/${projectId}`;
     }
   };

   const REDIRECT_URI = getRedirectUri();
   ```

2. **Configure o WebBrowser adequadamente:**

   Melhore a configuração do WebBrowser com opções adicionais:

   ```javascript
   WebBrowser.maybeCompleteAuthSession({
     preferEphemeralSession: true, // Usar sessão efêmera para evitar problemas de cache
   });
   ```

3. **Melhore o tratamento de erros e logs:**

   Implemente logs detalhados e tratamento de erros em toda a função de autenticação:

   ```javascript
   async function authenticate() {
     try {
       setLoading(true);
       setError(null);

       console.log(
         "Iniciando autenticação Spotify com URL de redirecionamento:",
         REDIRECT_URI
       );

       // Verificar se já temos um token salvo
       const savedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
       if (savedToken) {
         console.log("Token existente encontrado, verificando validade...");

         // Verificar se o token ainda é válido
         try {
           const response = await fetch(`${SPOTIFY_API_ENDPOINT}/me`, {
             headers: { Authorization: `Bearer ${savedToken}` },
           });

           if (response.ok) {
             console.log("Token ainda é válido, usando token existente");
             setAccessToken(savedToken);
             await fetchFocusPlaylists(savedToken);
             return;
           } else {
             console.log("Token expirado, removendo e obtendo novo token");
             await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
           }
         } catch (error) {
           console.log("Erro ao verificar token, removendo:", error);
           await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
         }
       }

       // ...resto do código de autenticação...
     } catch (err) {
       console.error("Erro na autenticação:", err);
       setError(`Erro na autenticação: ${err.message}`);
     } finally {
       setLoading(false);
     }
   }
   ```

4. **Configure URIs de redirecionamento no Spotify Developer Dashboard:**

   Certifique-se de que todos os URIs de redirecionamento possíveis estão configurados no seu projeto no [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).

   No Dashboard, adicione todas as variações de URI que você planeja usar:

   - `exp://10.0.2.2:8083`
   - `exp://localhost:8083`
   - `exp://192.168.x.x:8083` (seu IP local)
   - `exp://exp.host/@seuusuario/fokus-app`

## Erro de Sintaxe no componente botaoSpotify

Se você encontrar um erro de sintaxe ao iniciar o aplicativo como:

```
SyntaxError: Missing catch or finally clause.
```

Este erro ocorre porque há um problema na estrutura de try/catch na função `authenticate()` do componente `botaoSpotify/index.jsx`.

### Solução:

1. Verifique se todos os blocos `try` têm seus respectivos blocos `catch` ou `finally`.
2. Corrija a estrutura da função `authenticate()` para usar apenas um bloco `try` principal, em vez de tentar aninhar múltiplos blocos.
3. Execute o seguinte comando para corrigir automaticamente o problema:

```bash
npm run fix-spotify-button
```

A implementação corrigida deve ter a seguinte estrutura:

```javascript
async function authenticate() {
  try {
    setLoading(true);
    setError(null);

    console.log(
      "Iniciando autenticação Spotify com URL de redirecionamento:",
      REDIRECT_URI
    );

    // Verificar se já temos um token salvo
    // ...resto do código...

    // Iniciar fluxo de autenticação com WebBrowser
    const result = await WebBrowser.openAuthSessionAsync(
      authUrl,
      REDIRECT_URI,
      {
        showInRecents: true,
        createTask: false,
        dismissButtonStyle: "cancel",
        toolbarColor: "#1DB954",
      }
    );

    // Processar resultado
    // ...resto do código...
  } catch (err) {
    console.error("Erro na autenticação:", err);
    setError(`Erro na autenticação: ${err.message}`);
  } finally {
    setLoading(false);
  }
}
```

## Erro "Attempted to navigate before mounting the Root Layout component"

Se você encontrar o erro:

```
Attempted to navigate before mounting the Root Layout component
```

Esse erro ocorre quando o sistema de navegação tenta navegar para uma rota antes que o componente de layout raiz (`_layout.jsx`) seja montado completamente.

### Solução:

1. **Use o componente Redirect em vez de router.replace:**

   Em `app/index.jsx`, use o componente Redirect diretamente no retorno da função em vez de chamar `router.replace()` dentro de um `useEffect`:

   ```javascript
   import { Redirect } from "expo-router";
   import { useEffect } from "react";
   import { LogBox } from "react-native";

   export default function Index() {
     // Desabilitar avisos específicos do sistema
     useEffect(() => {
       // Ignorar avisos específicos relacionados a problemas conhecidos
       LogBox.ignoreLogs([
         "Attempted to navigate before mounting the Root Layout component",
         "Failed to download remote update",
         "Unmatched Route",
       ]);
     }, []);

     return <Redirect href="Home" />;
   }
   ```

2. **Adicione tratamento para suprimir avisos:**

   Use `LogBox.ignoreLogs` para suprimir o aviso específico, já que ele não impede o funcionamento do aplicativo:

   ```javascript
   LogBox.ignoreLogs([
     "Attempted to navigate before mounting the Root Layout component",
   ]);
   ```

3. **Garanta que o \_layout.jsx seja simples e rápido de montar:**

   Evite operações pesadas ou assíncronas no componente de layout raiz, para que ele seja montado o mais rápido possível.
