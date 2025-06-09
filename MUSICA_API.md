## Alternativa à Integração com Spotify: API de Música Própria

Se você continuar encontrando problemas com a autenticação e integração do Spotify após todas as soluções acima, implementamos uma alternativa mais robusta usando uma API própria hospedada na Vercel.

### Como funciona a solução alternativa:

Esta solução substitui o componente `botaoSpotify` por um novo componente `botaoMusica` que se conecta a uma API própria em vez do Spotify. Isso elimina todos os problemas relacionados à autenticação OAuth e URLs de redirecionamento.

### Benefícios:

1. **Simplificação**: Sem necessidade de autenticação OAuth complexa
2. **Confiabilidade**: Sem problemas de redirecionamento
3. **Controle total**: As músicas são completamente controladas por você
4. **Desempenho**: Resposta mais rápida e menos problemas de rede
5. **Compatibilidade**: Suporte para URLs do Google Drive para facilitar o compartilhamento de arquivos

### Como implementar:

1. **Use a API de músicas existente**:

   A API já está hospedada e acessível em: https://api-musicas.vercel.app/musicas

   Estrutura dos dados:

   ```json
   [
     {
       "id": 1,
       "titulo": "lofi hip hop radio – beats to relax/study to",
       "artista": "Lofi Girl",
       "estilo": "Lo-fi",
       "url": "https://exemplo.com/audio-alternativo.mp3"
     },
     {
       "id": 2,
       "titulo": "Piano Instrumental para Estudo",
       "artista": "Piano Relaxante",
       "estilo": "Instrumental",
       "url": "https://exemplo.com/audio-alternativo2.mp3"
     }
   ]
   ```

2. **Substitua o componente botaoSpotify pelo botaoMusica na página pomodoro.jsx**:

   ```javascript
   // Substitua a importação
   // import SpotifyTopTracksButton from "../components/botaoSpotify";
   import BotaoMusica from "../components/botaoMusica";

   // E a utilização
   <View style={styles.spotifyContainer}>
     <BotaoMusica />
   </View>;
   ```

3. **Configuração no componente botaoMusica**:

   A URL da API já está configurada no componente `botaoMusica/index.jsx`:

   ```javascript
   // URL da API criada e hospedada na Vercel
   const API_URL = "https://api-musicas.vercel.app";
   ```

### Reprodução de URLs do YouTube:

O componente implementa uma solução para lidar com URLs do YouTube:

1. **Detecção automática**: O código identifica links do YouTube e aplica tratamento especial
2. **Endpoint de áudio alternativo**: A API pode fornecer URLs alternativas para streaming
3. **Tratamento de erros**: Feedback claro quando uma música não pode ser reproduzida

### Solução de problemas específicos:

Se você encontrar o erro "Falha ao carregar músicas (404)", verifique:

1. Se a URL da API está correta em `botaoMusica/index.jsx`
2. Se o endpoint `/musicas` está disponível na sua API
3. Se a API está retornando corretamente os dados no formato JSON

O componente `botaoMusica` foi projetado para ser flexível em relação à estrutura dos dados, aceitando diferentes nomes de propriedades:

- Para o título: `titulo`, `title` ou `name`
- Para o artista: `artista` ou `artist`
- Para o estilo: `estilo` (novo campo adicionado)
- Para o URL do áudio: `url`, `audio`, `audioUrl` ou `src`
