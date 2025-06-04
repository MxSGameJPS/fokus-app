const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Caminho para o arquivo temporário de Reanimated
const reanimatedPath = path.join(
  __dirname,
  "../node_modules/react-native-reanimated"
);
const reanimatedBackupPath = path.join(
  __dirname,
  "../node_modules/react-native-reanimated-backup"
);

try {
  console.log("🚀 Iniciando processo de build APK...");

  // Verificar se o módulo reanimated existe
  if (fs.existsSync(reanimatedPath)) {
    console.log(
      "📦 Renomeando temporariamente o pacote react-native-reanimated..."
    );

    // Renomear a pasta para evitar compilação nativa
    if (fs.existsSync(reanimatedBackupPath)) {
      fs.rmSync(reanimatedBackupPath, { recursive: true, force: true });
    }

    fs.renameSync(reanimatedPath, reanimatedBackupPath);

    console.log("✅ Pacote renomeado com sucesso!");
  }

  console.log("🔨 Executando build de APK com Gradle...");

  // Executar comando de build APK
  execSync("cd android && .\\gradlew.bat assembleRelease", {
    stdio: "inherit",
    encoding: "utf-8",
  });

  console.log("✅ Build de APK concluído com sucesso!");
  console.log(
    "📱 APK disponível em: android/app/build/outputs/apk/release/app-release.apk"
  );
} catch (error) {
  console.error("❌ Erro durante o processo de build:", error);
} finally {
  // Restaurar a pasta do reanimated
  if (fs.existsSync(reanimatedBackupPath)) {
    console.log("🔄 Restaurando o pacote react-native-reanimated...");

    if (fs.existsSync(reanimatedPath)) {
      fs.rmSync(reanimatedPath, { recursive: true, force: true });
    }

    fs.renameSync(reanimatedBackupPath, reanimatedPath);

    console.log("✅ Pacote restaurado com sucesso!");
  }
}
