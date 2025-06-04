import {
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Keyboard,
} from "react-native";
import { IconDeleteA, IconSave } from "../../components/Icons";
import useTaskContext from "../../components/context/useTaskContext";
import { useState } from "react";
import { router } from "expo-router";

export default function AddTask() {
  const { addTask } = useTaskContext();
  const { removeTask } = useTaskContext();
  const [text, setText] = useState();

  const submitTask = () => {
    if (!text) {
      return;
    }
    addTask(text);
    setText("");
    router.navigate("/tasks");
  }

  const submitRemoveTask = () => {
    if (!text) {
      return;
    }
    removeTask(text);
    setText("");
    router.navigate("/tasks");
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={style.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={style.containerTarefas}>
          <View style={style.containerTitle}>
            <Text style={style.text}>Adicionar Tarefa:</Text>
          </View>
          <Text style={style.textTarefa}>O que você pensa em fazer?</Text>
          <TextInput
            style={style.input}
            placeholder="Digite sua tarefa"
            numberOfLines={10}
            multiline={true}
            value={text}
            onChangeText={setText}
          />
          <View style={style.containerButtonB}>
            <Pressable
              style={style.containerButton}
              onPress={submitTask}
            >
              <IconSave />
              <Text>Salvar</Text>
            </Pressable>
            <Pressable style={style.containerButton} onPress={submitRemoveTask}>
              <IconDeleteA />
              <Text>Deletar</Text>
            </Pressable>
          </View>
        </View>
      </TouchableWithoutFeedback>
      <View style={style.footer}>
        <Text style={style.footerText}>Desenvolvido por Saulo Pavanello</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#021123",
    padding: 40,
    gap: 40,
  },
  containerTitle: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "400",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
  },
  containerTarefas: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    width: "100%",
    backgroundColor: "#98A0A8",
    borderRadius: 8,
    gap: 16,
    padding: 16,
  },
  textTarefa: {
    color: "#021123",
    fontSize: 18,
    fontWeight: "600",
  },
  input: {
    width: "100%",
    height: 140,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    textAlignVertical: "top",
  },
  containerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  containerButtonB: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 16,
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
