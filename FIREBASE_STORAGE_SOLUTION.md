// RESUMO DA SOLUÇÃO PARA O ERRO 403 DO FIREBASE STORAGE

O erro 403 (Forbidden) ao acessar arquivos do Firebase Storage pode ocorrer por diversos motivos:

1. **Formato de URL incorreto:**

   - O formato correto para acessar arquivos públicos do Firebase Storage é:

   ```
   https://firebasestorage.googleapis.com/v0/b/BUCKET_NAME/o/FILE_PATH?alt=media
   ```

   - A parte `FILE_PATH` deve ser codificada corretamente para URI (usando encodeURIComponent)
   - O parâmetro `alt=media` é essencial para obter o conteúdo do arquivo diretamente

   - **Formato alternativo do Google Cloud Storage:**

   ```
   https://storage.googleapis.com/BUCKET_NAME/FILE_PATH
   ```

2. **Regras de Segurança do Firebase:**

   - Verifique se as regras de segurança do Firebase Storage permitem acesso público aos arquivos
   - As regras devem estar configuradas para permitir leitura pública:

   ```
   service firebase.storage {
     match /b/{bucket}/o {
       match /{allPaths=**} {
         allow read;
         allow write: if request.auth != null;
       }
     }
   }
   ```

3. **Bucket errado:**

   - Confirme o nome correto do bucket no console do Firebase
   - Verifique se está usando o formato correto do nome do bucket (com ou sem `.appspot.com`)

4. **Nome de arquivo incorreto:**

   - Certifique-se de que o caminho relativo está sendo tratado corretamente
   - Verifique se a codificação de caracteres especiais no nome do arquivo está sendo feita corretamente

5. **Cabeçalhos HTTP:**

   - Adicione cabeçalhos apropriados nas requisições, como `Accept: audio/mp3,audio/*;q=0.9,*/*;q=0.8`

6. **Problemas de Thread no React Native:**

   - Use o InteractionManager para garantir que operações de áudio ocorram na thread principal
   - Garanta que a criação e reprodução de áudio ocorram no contexto da thread principal

7. **Verificação de Formatos de URL:**

   - Implemente verificação de formato de URL e tentativas alternativas
   - Tente diferentes formatos de URL se o primeiro falhar

8. **Tratamento de Erros Aprimorado:**
   - Exiba mensagens de erro específicas para cada tipo de problema (403, 404, etc)
   - Adicione logs detalhados para depuração

## Implementação da Solução

A solução implementada resolve o problema de forma robusta através das seguintes estratégias:

### 1. Múltiplos formatos de URL

Implementamos um sistema que tenta dois formatos diferentes de URL para o Firebase Storage:

```javascript
// Primeiro formato: Cloud Storage direto
const url = `https://storage.googleapis.com/api-musicas-3af47.appspot.com/musicas/${encodedFileName}`;

// Formato alternativo (fallback): Firebase Storage com parâmetro alt=media
const alternativeUrl = `https://firebasestorage.googleapis.com/v0/b/api-musicas-3af47.appspot.com/o/musicas%2F${encodedFileName}?alt=media`;
```

### 2. Mecanismo de fallback automático

Se a reprodução falhar com erro 403 no primeiro formato, tentamos automaticamente o segundo formato:

```javascript
try {
  // Tentar com o primeiro formato de URL
  await reproduzirAudio(audioUrl, musica);
} catch (primaryError) {
  // Se falhar com erro 403, tentar o URL alternativo
  if (
    primaryError.message.includes("403") ||
    primaryError.message.includes("forbidden")
  ) {
    console.log(
      "Primeira URL falhou com erro 403, tentando formato alternativo..."
    );

    // Extrair o nome do arquivo e tentar com outro formato
    const fileName = audioUrl.split("/").pop().split("?")[0];
    const encodedFileName = encodeURIComponent(fileName);

    // Tentar o formato alternativo do Firebase Storage
    const alternativeUrl = `https://firebasestorage.googleapis.com/v0/b/api-musicas-3af47.appspot.com/o/musicas%2F${encodedFileName}?alt=media`;
    console.log("Tentando URL alternativa:", alternativeUrl);

    await reproduzirAudio(alternativeUrl, musica);
  }
}
```

### 3. Tratamento correto de threads no React Native

Extraímos a função de reprodução para garantir que todas as operações de áudio ocorram na thread principal:

```javascript
const reproduzirAudio = async (audioUrl, musica) => {
  return new Promise((resolve, reject) => {
    InteractionManager.runAfterInteractions(() => {
      try {
        // Criar e reproduzir o som na thread principal
        Audio.Sound.createAsync(...)
          .then(...)
          .catch(...);
      } catch (innerError) {
        reject(innerError);
      }
    });
  });
};
```

Esta implementação corrige todos esses problemas e fornece um player de áudio robusto para reproduzir arquivos do Firebase Storage no React Native com Expo Audio.
