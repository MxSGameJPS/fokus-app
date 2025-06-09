const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Iniciando correção do erro de TypeConverterProvider...");

try {
  // Passo 1: Limpar o cache completamente
  console.log("🧹 Limpando cache...");
  execSync("npm cache clean --force", { stdio: "inherit" });

  // Passo 2: Remover módulos problemáticos
  const modulesToRemove = [
    "node_modules/expo-modules-core",
    "node_modules/expo-web-browser", // Adicionado expo-web-browser
    ".expo",
    "android/app/build",
    "android/.gradle",
  ];

  modulesToRemove.forEach((mod) => {
    const modPath = path.join(__dirname, "..", mod);
    if (fs.existsSync(modPath)) {
      console.log(`🗑️ Removendo ${mod}...`);
      fs.rmSync(modPath, { recursive: true, force: true });
    }
  });

  // Passo 3: Reinstalar dependências específicas
  console.log("📦 Reinstalando dependências...");
  execSync("npm install", { stdio: "inherit" });

  // Passo 4: Limpar e recriar a build nativa
  console.log("🔨 Recriando build nativa...");
  execSync("npx expo prebuild --clean", { stdio: "inherit" });

  // Passo 5: Verificar dispositivos Android conectados
  console.log("\n📱 Verificando dispositivos Android conectados...");
  try {
    const devices = execSync("adb devices", { encoding: "utf-8" });
    console.log(devices);
  } catch (_) {
    console.log(
      "⚠️ Não foi possível verificar dispositivos. Certifique-se de que o ADB está instalado."
    );
  }

  console.log(
    "✅ Correção concluída! Agora tente executar o aplicativo novamente:"
  );
  console.log("   npx expo run:android");
} catch (error) {
  console.error("❌ Erro durante o processo de correção:", error);
  console.log("\n🔍 Tente executar manualmente os seguintes comandos:");
  console.log("1. npm cache clean --force");
  console.log("2. rmdir /s /q node_modules\\expo-modules-core");
  console.log("3. rmdir /s /q node_modules\\expo-web-browser"); // Adicionado expo-web-browser
  console.log("4. rmdir /s /q .expo");
  console.log("5. rmdir /s /q android\\app\\build");
  console.log("6. npm install");
  console.log("7. npx expo prebuild --clean");
  console.log("8. npx expo run:android");
}
