# Formato da API de Músicas

## Formato Atual

A API de músicas atualmente retorna URLs relativas no seguinte formato:

```json
{
  "id": 1,
  "titulo": "Nome da música",
  "artista": "Nome do artista",
  "estilo": "Estilo musical",
  "url": "/musicas/nome-do-arquivo.mp3"
}
```

## Implementação

O componente de música foi modificado para lidar exclusivamente com este formato, convertendo as URLs relativas em URLs absolutas:

1. Quando o componente recebe um URL relativo (começando com `/musicas/`), ele converte para uma URL completa adicionando o domínio base da API.

2. A função `getFullUrl` é responsável por esta conversão:

   ```javascript
   const getFullUrl = (relativePath) => {
     if (!relativePath) return null;

     // Se já é uma URL completa, retornar como está
     if (
       relativePath.startsWith("http://") ||
       relativePath.startsWith("https://")
     ) {
       return relativePath;
     }

     // Remover barra inicial se existir para evitar duplicação
     const path = relativePath.startsWith("/")
       ? relativePath.substring(1)
       : relativePath;

     // Construir URL completo
     const url = `${API_URL}/${path}`;

     console.log("URL completa construída:", url);

     // Codificar a URL para lidar com caracteres especiais
     return encodeURI(url);
   };
   ```

3. A flag `processada` foi adicionada para evitar processamento desnecessário de URLs já tratadas.

## Otimização (08/06/2025)

O componente foi atualizado para focar exclusivamente no uso da API:

1. **Remoção de serviços externos:**

   - Removido o processamento de URLs do YouTube
   - Removido o processamento de URLs do Google Drive
   - Simplificado o código para focar apenas na API própria

2. **Verificação de URLs:**

   - Adicionado método HEAD para verificar acessibilidade das URLs antes da reprodução
   - Implementado sistema de log detalhado para diagnóstico de problemas

3. **URLs alternativas:**
   - Mantida lógica de tentativas alternativas específicas para URLs da API
   - Adicionadas estratégias de fallback específicas para o formato da API

## Benefícios

1. **Desempenho melhorado**: A aplicação agora utiliza diretamente as URLs fornecidas pela API, minimizando a necessidade de processamento extra.

2. **Código mais limpo**: A lógica para tratamento de diferentes formatos foi simplificada.

3. **Manutenção simplificada**: Facilita futuras alterações, já que o formato da API está bem documentado e o código está pronto para lidar com ele.

4. **Independência de serviços externos**: Elimina a dependência de YouTube ou Google Drive para o funcionamento da reprodução de música.

## Fallback

Em caso de falha na API, o componente utiliza uma lista local de músicas que segue o mesmo formato da API, garantindo a consistência no tratamento das URLs.
