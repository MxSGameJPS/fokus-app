/**
 * Script para corrigir problemas específicos do botão do Spotify e expo-web-browser
 * Este script atualiza a configuração do botão do Spotify para funcionar corretamente
 * em ambientes de desenvolvimento e produção.
 */

const fs = require("fs");
const path = require("path");
const execSync = require("child_process").execSync;

// Cores para o console
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",
  fg: {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
  },
  bg: {
    black: "\x1b[40m",
    red: "\x1b[41m",
    green: "\x1b[42m",
    yellow: "\x1b[43m",
    blue: "\x1b[44m",
    magenta: "\x1b[45m",
    cyan: "\x1b[46m",
    white: "\x1b[47m",
  },
};

// Funções de Log com cores
function logInfo(message) {
  console.log(
    `${colors.fg.blue}${colors.bright}[INFO]${colors.reset} ${message}`
  );
}

function logSuccess(message) {
  console.log(
    `${colors.fg.green}${colors.bright}[SUCESSO]${colors.reset} ${message}`
  );
}

function logWarning(message) {
  console.log(
    `${colors.fg.yellow}${colors.bright}[AVISO]${colors.reset} ${message}`
  );
}

function logError(message) {
  console.log(
    `${colors.fg.red}${colors.bright}[ERRO]${colors.reset} ${message}`
  );
}

// Função para obter o IP local
function getLocalIP() {
  const { networkInterfaces } = require("os");
  const nets = networkInterfaces();

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Pular interfaces não IPv4 e interfaces de loopback
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "192.168.1.x"; // Valor padrão se não encontrar
}

// Caminho para o componente botaoSpotify
const spotifyButtonPath = path.join(
  __dirname,
  "..",
  "components",
  "botaoSpotify",
  "index.jsx"
);

async function fixSpotifyButton() {
  try {
    logInfo("Iniciando correção do botão do Spotify...");

    // Verificar se o arquivo existe
    if (!fs.existsSync(spotifyButtonPath)) {
      logError(`Arquivo não encontrado: ${spotifyButtonPath}`);
      return false;
    }

    // Ler o conteúdo atual do arquivo
    let content = fs.readFileSync(spotifyButtonPath, "utf8");

    // Obter o IP local
    const localIP = getLocalIP();

    // Atualizar a constante REDIRECT_URI
    const redirectUriPattern = /const REDIRECT_URI = "([^"]+)";/;
    const newRedirectUriCode = `// Usando múltiplos esquemas de redirecionamento para aumentar a compatibilidade
const REDIRECT_URI = "exp://10.0.2.2:8083"; // Para emuladores Android
// Se precisar de mais esquemas:
// const REDIRECT_URI_LOCAL = "exp://${localIP}:8083"; // Para dispositivos físicos na mesma rede
// const REDIRECT_URI_EXPO_GO = "exp://exp.host/@seuusuario/fokus-app"; // Para Expo Go`;

    // Substituir o código de REDIRECT_URI
    if (redirectUriPattern.test(content)) {
      content = content.replace(redirectUriPattern, () => newRedirectUriCode);
      logSuccess("REDIRECT_URI atualizado com sucesso");
    } else {
      logWarning(
        "Não foi possível encontrar REDIRECT_URI no arquivo. Verifique manualmente."
      );
    }

    // Atualizar a inicialização do WebBrowser
    const webBrowserPattern = /WebBrowser\.maybeCompleteAuthSession\(\);/;
    const newWebBrowserCode = `WebBrowser.maybeCompleteAuthSession({
  preferEphemeralSession: true // Usar sessão efêmera para evitar problemas de cache
});`;

    // Substituir o código de inicialização do WebBrowser
    if (webBrowserPattern.test(content)) {
      content = content.replace(webBrowserPattern, newWebBrowserCode);
      logSuccess("Configuração do WebBrowser atualizada com sucesso");
    } else {
      logWarning(
        "Não foi possível encontrar a inicialização do WebBrowser no arquivo. Verifique manualmente."
      );
    }

    // Salvar as alterações
    fs.writeFileSync(spotifyButtonPath, content, "utf8");
    logSuccess("Arquivo atualizado com sucesso!");

    // Atualizar as dependências relacionadas
    logInfo("Reinstalando módulos relacionados...");
    execSync("npm install --save expo-web-browser@latest", {
      stdio: "inherit",
    });

    logSuccess("Correções aplicadas com sucesso!");
    logInfo(
      "IMPORTANTE: Você precisa configurar as URIs de redirecionamento no Spotify Developer Dashboard:"
    );
    logInfo(`- exp://10.0.2.2:8083`);
    logInfo(`- exp://${localIP}:8083`);

    return true;
  } catch (error) {
    logError(`Erro ao corrigir o botão do Spotify: ${error.message}`);
    return false;
  }
}

// Executar o script
fixSpotifyButton().then((success) => {
  if (success) {
    logSuccess("Script de correção concluído com sucesso!");
  } else {
    logError("Script de correção falhou. Verifique os erros acima.");
  }
});
