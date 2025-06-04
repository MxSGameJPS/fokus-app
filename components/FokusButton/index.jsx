import { Text, Pressable, StyleSheet } from "react-native";




export default function FokusButton({ onPress, title, icon, style, outline }) {

  const buttonStyle = outline ? [styles.button, styles.outlineButton, style] : [styles.button, style];
  
  return (
    <Pressable style={buttonStyle} onPress={onPress}>
      {icon}
      <Text style={outline ? styles.outlineButtonText : styles.buttonText}>{title}</Text>
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
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#B872FF",
    gap: 12,    
  },
  outlineButtonText: {
    color: "#B872FF",
    fontSize: 18,
    fontWeight: 600,
    paddingHorizontal: 18,
  },
  buttonText: {
    color: "#021123",
    fontSize: 18,
    fontWeight: 600,
  },
});
