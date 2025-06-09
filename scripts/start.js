#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("🚀 Fokus App - Inicialização Rápida");
console.log("------------------------------------");
console.log("Selecione uma opção:");
console.log("1. Iniciar o aplicativo com cache limpo");
console.log("2. Executar no Android (emulador ou dispositivo)");
console.log("3. Reinstalar completamente o aplicativo");
console.log("4. Construir APK para compartilhar");
console.log("5. Sair");

rl.question("Escolha uma opção (1-5): ", (option) => {
  try {
    switch (option) {
      case "1":
        console.log("\n🧹 Limpando cache e iniciando...");
        execSync("npx expo start --clear", {
          stdio: "inherit",
          encoding: "utf-8",
        });
        break;

      case "2":
        console.log("\n📱 Executando no Android...");
        execSync("npx expo run:android", {
          stdio: "inherit",
          encoding: "utf-8",
        });
        break;

      case "3":
        console.log("\n🔄 Reinstalando completamente o aplicativo...");
        execSync("node ./scripts/reset-project.js", {
          stdio: "inherit",
          encoding: "utf-8",
        });
        break;

      case "4":
        console.log("\n📦 Construindo APK para compartilhar...");
        execSync("npm run build-apk", {
          stdio: "inherit",
          encoding: "utf-8",
        });
        break;

      case "5":
        console.log("\n👋 Saindo...");
        break;

      default:
        console.log("\n❌ Opção inválida. Tente novamente.");
        break;
    }
  } catch (error) {
    console.error("\n❌ Erro ao executar o comando:", error.message);
  } finally {
    rl.close();
  }
});
