import { StyleSheet, Text, View, Image, Pressable } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Image style={styles.image} source={require("./pomodoro.png")} />
      <View style={styles.actions}>
        <View>
          <Pressable>
            <Text>Foco</Text>
          </Pressable>
          <Pressable>
            <Text>Pausa Curta</Text>
          </Pressable>
          <Pressable>
            <Text>Pausa Longa</Text>
          </Pressable>
        </View>
        <Text style={styles.time}>25:00</Text>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Começar</Text>
        </Pressable>
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Desenvolvido por Saulo Pavanello</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#021123",
    gap: 40,
  },
  image: {
    width: 300,
    height: 300,
  },
  actions: {
    padding: 24,
    backgroundColor: "#14448080",
    width: "80%",
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#144480",
    gap: 32,
  },
  time: {
    fontSize: 54,
    color: "#fff",
    textAlign: "center",
    fontWeight: 600,
  },
  button: {
    backgroundColor: "#B872FF",
    padding: 8,
    borderRadius: 32,
    alignItems: "center",
  },
  buttonText: {
    color: "#021123",
    fontSize: 18,
    fontWeight: 600,
  },
  footer: {
    width: "80%",
  },
  footerText: {
    color: "#98A0A8",
    textAlign: "center",
    fontSize: 13,
    fontWeight: 400,
  },
});
