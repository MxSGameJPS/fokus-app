import { Pressable, StyleSheet, Text, View } from "react-native";
import { IconCheck, IconDelete, IconEdit } from "../Icons";

export default function TaskItem({ completed, text, onToggleCompleted, onPressEdit, onPressDelete }) {

const containerStyle = [style.container];

  if (completed) {
    containerStyle.push(style.completed);
  }

  return (
    <View style={containerStyle}>
      <Pressable onPress={onToggleCompleted}>
        <IconCheck checked={completed} />
      </Pressable>
      <Text style={style.text}>{text}</Text>
      <View style={style.containerIcon}>
        <Pressable onPress={onPressEdit} style={style.iconButton}>
          <IconEdit />
        </Pressable>
        <Pressable onPress={onPressDelete} style={style.iconButton}>
          <IconDelete />
        </Pressable>
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#98A0A8",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical18: 18,
    width: 312,
    height: 64,
  },
  completed: {
    backgroundColor: "#0F725C",    
  },
  containerIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    fontWeight: "600",
    color: "#021123",
  },
  iconButton: {
    padding: 5,
  },
});
