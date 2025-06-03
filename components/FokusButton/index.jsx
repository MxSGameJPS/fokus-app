import { Text, Pressable, StyleSheet } from "react-native";

export default function FokusButton() {
  return (
    <Pressable style={styles.button}>
      <Text style={styles.buttonText}>Começar</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
});
