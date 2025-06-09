import { Redirect } from "expo-router";
import { useEffect } from "react";
import { LogBox } from "react-native";

// Usando Redirect diretamente no retorno em vez de useEffect + router.replace
// Isso garante que a navegação ocorra como parte do ciclo de renderização normal
export default function Index() {
  // Desabilitar avisos específicos do sistema
  useEffect(() => {
    // Ignorar avisos específicos relacionados a problemas conhecidos
    LogBox.ignoreLogs([
      "Attempted to navigate before mounting the Root Layout component",
      "Failed to download remote update",
      "Unmatched Route",
    ]);
  }, []);

  return <Redirect href="Home" />;
}
