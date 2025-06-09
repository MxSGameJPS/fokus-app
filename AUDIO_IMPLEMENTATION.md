# Implementação de Reprodução de Áudio Robusta no Fokus App

## Visão Geral

Este documento descreve as melhorias implementadas no componente `BotaoMusica` para resolver os problemas de reprodução de áudio no aplicativo Fokus, especialmente os erros relacionados a URLs do YouTube, URLs do Google Drive e URLs inacessíveis.

## Problemas Corrigidos

1. **UnrecognizedInputFormatException ao reproduzir áudios do YouTube**

   - O Expo AV não consegue processar diretamente links do YouTube
   - Necessidade de extrair informações e usar URLs alternativas

2. **InvalidResponseCodeException (Erro 404) ao tentar reproduzir áudios**

   - Algumas URLs retornam erro 404 (não encontrado)
   - Necessidade de verificar previamente as URLs e ter alternativas

3. **Problemas com URLs do Google Drive**

   - URLs do Google Drive exigem tratamento especial
   - Necessidade de converter URLs de compartilhamento para formato direto

4. **Problemas de sintaxe e formatação no código JavaScript**

   - Necessidade de melhorar a estrutura e legibilidade do código

5. **Funcionalidade de navegação entre músicas**
   - Adição de controles para mudar de música durante a reprodução
   - Implementação de reprodução automática da próxima música

## Nova Estrutura da API de Música

A API foi atualizada para suportar músicas hospedadas no Google Drive. Agora, a estrutura de cada música é:

```json
{
  "id": 1,
  "titulo": "Só Pagodes e Sambas Top 2025 🎤 Ferrugem, Dilsinho, Thiaguinho, Ludmilla, Iza e Mais",
  "artista": "Só Pagodes e Sambas",
  "estilo": "Pagode / Samba",
  "url": "https://drive.google.com/uc?export=download&id=114-Krg4cbbDTzRVJw4WSO74dwlvjV1yM"
}
```

## Implementação da Solução

### 1. Extração de ID do YouTube

Implementamos uma função robusta para extrair IDs de vídeos do YouTube a partir de diferentes formatos de URL:

```javascript
const extractYouTubeId = (url) => {
  if (!url) return null;

  // Padrões para URLs do YouTube
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/user\/.+\/\w{11}|youtube\.com\/.+\/\w{11})([^&\n?#]+)/,
    /^([^&\n?#]+)$/, // Se já for apenas o ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};
```

### 2. Sistema de Fallback em Camadas

Criamos um sistema de fallback em camadas para garantir que sempre haja uma alternativa válida:

1. **URLs de fallback específicas para IDs conhecidos**

   - Mapeamento direto de IDs populares para áudios alternativos

2. **Consulta à API própria**

   - Solicitação de URL alternativa à nossa API

3. **Fallback para áudios genéricos**
   - Lista de áudios genéricos caso todas as outras opções falhem

### 3. Verificação Prévia de URLs

Implementamos verificação prévia de URLs para evitar tentativas de reprodução de URLs inacessíveis:

```javascript
try {
  const response = await fetch(audioUrl, {
    method: "HEAD",
    timeout: 3000,
  });

  if (!response.ok) {
    console.warn(`URL retornou status ${response.status}, usando fallback`);
    // Usar fallback
  }
} catch (urlError) {
  // Tratar erro e usar fallback
}
```

### 4. Sistema de Tentativas Múltiplas

Criamos um sistema que tenta reproduzir o áudio com múltiplas URLs alternativas até que uma funcione:

```javascript
let reproduzido = false;
let tentativaAtual = 0;

while (!reproduzido && tentativaAtual < fallbackUrls.length) {
  try {
    // Tentar reproduzir com a URL atual
    // Se funcionar, setar reproduzido = true
  } catch (error) {
    // Incrementar tentativa e tentar próxima URL
    tentativaAtual++;
  }
}
```

### 5. Tratamento de Erros Específicos

Implementamos tratamento específico para diferentes tipos de erros:

```javascript
if (errorMessage.includes("404") || errorMessage.includes("not found")) {
  // Tratar erro 404
} else if (errorMessage.includes("UnrecognizedInputFormatException")) {
  // Tratar erro de formato
} else if (errorMessage.includes("network")) {
  // Tratar erro de rede
}
```

### 6. Suporte a URLs do Google Drive

Adicionamos suporte especial para URLs do Google Drive, que requerem tratamento diferenciado:

```javascript
// Verificar se é uma URL do Google Drive e converter para URL direta
if (audioUrl.includes("drive.google.com")) {
  // Se já estiver no formato adequado (uc?export=download&id=), manter
  if (audioUrl.includes("uc?export=download&id=")) {
    // Formato correto, não precisa modificar
  }
  // Se estiver no formato padrão de compartilhamento, converter
  else if (audioUrl.includes("/file/d/")) {
    // Extrair o ID do arquivo do formato padrão
    const fileIdMatch = audioUrl.match(/\/file\/d\/([^\/]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      audioUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    }
  }
}
```

Para URLs do Google Drive, pulamos a verificação prévia com método HEAD, pois pode resultar em redirecionamentos ou respostas que não indicam corretamente se o arquivo está acessível:

```javascript
// Pular verificação para URLs do Google Drive
if (!urlAtual.includes("drive.google.com")) {
  try {
    const response = await fetch(urlAtual, {
      method: "HEAD",
      timeout: 2000,
    });

    if (!response.ok) {
      // Tentar próxima URL
    }
  } catch (urlError) {
    // Tentar mesmo assim
  }
} else {
  console.log("URL do Google Drive detectada, pulando verificação HEAD");
}
```

## Como Hospedar Arquivos de Áudio no Google Drive

1. Faça upload do arquivo de áudio para o Google Drive
2. Clique com o botão direito no arquivo e selecione "Compartilhar"
3. Escolha "Qualquer pessoa com o link pode visualizar"
4. Copie o link e utilize um dos dois formatos suportados:
   - Formato direto: `https://drive.google.com/uc?export=download&id=SEU_ID_AQUI`
   - Formato de compartilhamento: `https://drive.google.com/file/d/SEU_ID_AQUI/view`

O componente converterá automaticamente o formato de compartilhamento para o formato direto.

## Considerações sobre Performance

- O Google Drive pode limitar downloads frequentes ou de grande volume
- Para aplicações em produção, considere:
  - Implementar cache do lado do cliente
  - Hospedar os arquivos em um CDN próprio
  - Utilizar serviços especializados em streaming de áudio

````

## Resultados

As melhorias implementadas resultaram em:

1. Reprodução mais robusta de áudio, com menor taxa de falhas
2. Melhor experiência do usuário com mensagens de erro mais claras
3. Transição suave entre diferentes fontes de áudio quando necessário
4. Eliminação da dependência de APIs externas complexas (Spotify)
5. Interface de usuário melhorada com controle de reprodução
6. Navegação fácil entre músicas com o botão "Próxima música"
7. Experiência contínua com reprodução automática da próxima música

## Navegação Entre Músicas

### Funcionalidades Implementadas

1. **Botão de Próxima Música**
   - Um botão dedicado que permite ao usuário avançar para a próxima música na lista
   - O botão só aparece quando uma música está atualmente carregada
   - Visual integrado com o design geral do aplicativo

2. **Reprodução Automática da Próxima Música**
   - Quando uma música termina, o sistema avança automaticamente para a próxima
   - Se estiver na última música da lista, retorna para a primeira
   - Implementação através da função `onPlaybackStatusUpdate` e detecção do evento `didJustFinish`

3. **Algoritmo de Seleção da Próxima Música**
   ```javascript
   const playNextSong = () => {
     if (!currentMusica || musicas.length === 0) return;

     // Encontrar o índice da música atual
     const currentIndex = musicas.findIndex(
       (m) => m.id === currentMusica.id
     );

     // Se não encontrou a música atual ou é a última, voltar para a primeira
     const nextIndex = currentIndex === -1 || currentIndex === musicas.length - 1
       ? 0
       : currentIndex + 1;

     // Tocar a próxima música
     playMusica(musicas[nextIndex]);
   };
````

### Melhorias na Interface do Usuário

1. **Estilo do Botão de Próxima Música**

   ```javascript
   nextButton: {
     backgroundColor: "#144480", // Cor azul para diferenciar
     padding: 8,
     borderRadius: 32,
     alignItems: "center",
     justifyContent: "center",
     marginTop: 8,
     width: "100%",
   },
   nextButtonText: {
     color: "#FFFFFF",
     fontSize: 14,
     fontWeight: "600",
   },
   ```

2. **Carregamento Antecipado das Músicas**
   - As músicas são carregadas assim que o componente é montado
   - Isso proporciona uma experiência mais fluida ao avançar entre músicas
   - Implementado através de um `useEffect` que chama `fetchMusicas()` na montagem do componente

## Recomendações Futuras

1. Expandir a biblioteca de áudios alternativos para mais variedade
2. Implementar cache local de áudios frequentemente usados
3. Considerar o uso de bibliotecas específicas para extração de áudio do YouTube, caso permitido pelos Termos de Serviço
4. Adicionar controles mais avançados de navegação de músicas:
   - Botão de música anterior
   - Controle de volume
   - Indicador de progresso da música
   - Lista de reprodução visível e personalizada

```

```
