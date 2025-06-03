import { Pressable, Text, StyleSheet } from "react-native";

export default function ActionButton({ active, onPress, display }) {
  return (
    <Pressable
      style={
        active ? styles.contextTextAtivo : styles.contextText
      }
      onPress={onPress}
    >
      <Text style={styles.contextText}>{display}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  contextText: {
    color: "#fff",
    fontSize: 12,
    padding: 8,
  },
  contextTextAtivo: {
    backgroundColor: "#B872FF",
    borderRadius: 8,
  },
});
