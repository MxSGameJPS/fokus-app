# Guia de Solução de Problemas com Áudio no App Fokus

Este documento contém informações para ajudar a diagnosticar e resolver problemas relacionados à reprodução de áudio no aplicativo Fokus.

## Visão Geral da Nova Implementação (08/06/2025)

O componente `BotaoMusica` foi otimizado para usar exclusivamente URLs da API de músicas hospedada em `https://api-musicas.vercel.app`. A API retorna URLs relativas que são convertidas em URLs absolutas pelo componente.

## Problemas Comuns

### 1. Erro "Formato de áudio não compatível"

**Causa:** O ExoPlayer (player de mídia usado pelo Expo/React Native) não consegue reconhecer o formato do arquivo de áudio. Isso pode ocorrer pelos seguintes motivos:

- O formato do arquivo não é compatível com o ExoPlayer
- Há redirecionamentos ou headers que confundem o player

**Soluções:**

1. **Converter arquivos para MP3**: O formato MP3 é amplamente suportado e tem maior compatibilidade.
2. **Verificar o endpoint da API**: Certifique-se de que a API está retornando o arquivo de áudio diretamente, não uma página HTML.
3. **Hospedar os arquivos em serviços alternativos** caso a API não esteja funcionando:
   - Firebase Storage
   - AWS S3
   - GitHub Releases
   - Cloudinary
   - Serviços de hospedagem dedicados a áudio

### 2. Erro "Sem permissão para acessar o arquivo"

**Causa:** A API retornou um código 403 (Forbidden), indicando que o acesso ao arquivo foi negado.

**Soluções:**

1. Verifique se a API está online e funcionando corretamente
2. Verifique se o arquivo está corretamente hospedado na API
3. Tente usar a lista local de músicas como alternativa

### 3. Erro "Arquivo de áudio não encontrado"

**Causa:** A URL fornecida não apontou para um arquivo válido (erro 404).

**Soluções:**

1. O componente tentará automaticamente URLs alternativas:
   - Tentativa 1: Remove o caminho `/musicas/` e usa o nome do arquivo diretamente
   - Tentativa 2: Tenta acessar o arquivo no caminho `/audio/`
2. Verifique se a API está online acessando `https://api-musicas.vercel.app/musicas`
3. Verifique se o arquivo específico existe no servidor

### 4. "Problema de conexão com a internet"

**Causa:** O dispositivo não tem acesso à internet ou a conexão está instável.

**Soluções:**

- Verifique a conexão com a internet do dispositivo
- Tente usar uma conexão Wi-Fi em vez de dados móveis
- O componente usa a lista local de músicas como fallback em caso de falha na API

## Melhorando a Compatibilidade

Para aumentar a compatibilidade com diferentes arquivos de áudio:

1. **Formatos Recomendados:**

   - MP3 (melhor compatibilidade)
   - AAC
   - M4A
   - OGG (compatibilidade limitada)

2. **Formatos a Evitar:**

   - Arquivos não comprimidos (WAV, AIFF)
   - Formatos proprietários
   - Arquivos muito grandes

3. **Nomes de Arquivos**:

   - Evite caracteres especiais nos nomes dos arquivos
   - Use nomes descritivos mas não muito longos
   - Não use espaços (prefira hífens ou underscores)

## Para Desenvolvedores

Se precisar modificar a lógica de reprodução de áudio:

1. O componente principal está em `components/botaoMusica/index.jsx`
2. A função `getCompatibleAudioUrl` é responsável por preparar URLs para reprodução
3. A função `getFullUrl` converte caminhos relativos em URLs absolutas
4. A função `playMusica` gerencia a reprodução e tratamento de erros
5. As mensagens de log detalhadas ajudam a diagnosticar problemas:
   - **"URL completa construída: ..."** - Mostra a URL final que será usada para acessar o áudio
   - **"Tentando acessar áudio na API: ..."** - Indica uma tentativa de acesso à API
   - **"URL está acessível/inacessível (status: ...)"** - Resultado da verificação de acessibilidade
   - **"Tentando URL alternativa 1/2: ..."** - Mostra tentativas alternativas quando a URL principal falha

Para testes, use arquivos MP3 de pequeno tamanho (<10MB) para verificar a funcionalidade básica antes de testar arquivos maiores ou em formatos diferentes.

## Teste com método HEAD

Antes de publicar novos arquivos na API, teste se eles são acessíveis usando uma requisição HEAD:

```javascript
fetch("https://api-musicas.vercel.app/musicas/seu-arquivo.mp3", {
  method: "HEAD",
})
  .then((response) => console.log("Status:", response.status))
  .catch((error) => console.error("Erro:", error));
```
