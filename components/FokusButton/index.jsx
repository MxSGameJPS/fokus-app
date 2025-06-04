import { Text, Pressable, StyleSheet } from "react-native";

export default function FokusButton({ onPress, title, icon, style}) {
  return (
    <Pressable style={[styles.button, style]} onPress={onPress}>
      {icon}
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#B872FF",
    padding: 8,
    borderRadius: 32,
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  buttonText: {
    color: "#021123",
    fontSize: 18,
    fontWeight: 600,
  },
});
