const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

// Define os diretórios a serem removidos
const dirsToRemove = [
  "node_modules/.cache",
  ".expo",
  "android/app/build",
  "android/.gradle",
  "android/build",
  "node_modules/expo-modules-core/.cxx",
  "node_modules/expo-modules-core/build",
  "node_modules/expo-modules-autolinking/build",
  "node_modules/expo-modules-autolinking/.cxx",
];

// Define os comandos a serem executados
const commands = [
  "npm cache verify",
  "npm cache clean --force",
  "npx expo-doctor",
  // Não inicie o app automaticamente para permitir correções adicionais
];

console.log("🚀 Iniciando limpeza do projeto...");

try {
  // Remove diretórios
  dirsToRemove.forEach((dir) => {
    const dirPath = path.join(__dirname, "..", dir);
    if (fs.existsSync(dirPath)) {
      console.log(`🗑️  Removendo ${dir}...`);
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  });

  console.log("✅ Diretórios limpos com sucesso!");

  // Executa comandos
  commands.forEach((cmd) => {
    console.log(`🔧 Executando: ${cmd}`);
    execSync(cmd, { stdio: "inherit", encoding: "utf-8" });
  });

  console.log("✅ Cache limpo e projeto reiniciado com sucesso!");
  console.log(
    "📱 Agora você pode executar 'npm start' ou 'npx expo run:android' para iniciar o aplicativo."
  );
} catch (error) {
  console.error("❌ Erro durante o processo de limpeza:", error);
}
