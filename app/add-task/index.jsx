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
  ScrollView,
  SafeAreaView,
} from "react-native";
import { IconDeleteA, IconSave } from "../../components/Icons";
import useTaskContext from "../../components/context/useTaskContext";
import { useState } from "react";
import { router } from "expo-router";

export default function AddTask() {
  const { addTask } = useTaskContext();
  const { removeTask } = useTaskContext();
  const [text, setText] = useState("");
  const [dias, setDias] = useState("");
  const [tempoFoco, setTempoFoco] = useState("");

  const submitTask = () => {
    if (!text) {
      return;
    }
    addTask(text, dias, tempoFoco);
    setText("");
    setDias("");
    setTempoFoco("");
    router.navigate("/tasks");
  };

  const submitRemoveTask = () => {
    if (!text) {
      return;
    }
    removeTask(text);
    setText("");
    setDias("");
    setTempoFoco("");
    router.navigate("/tasks");
  };

  return (
    <SafeAreaView style={style.safeContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={style.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 20}
      >
        <ScrollView
          contentContainerStyle={style.scrollContainer}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
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
              <View>
                <Text style={style.textTarefa}>
                  Quais dias da semana você quer se dedicar a esta tarefa?
                </Text>
              </View>
              <TextInput
                style={style.inputDias}
                placeholder="Digite os dias da semana"
                numberOfLines={10}
                multiline={true}
                value={dias}
                onChangeText={setDias}
              />
              <View>
                <Text style={style.textTarefa}>
                  Quanto tempo vamos focar nesta tarefa?
                </Text>
              </View>
              <TextInput
                style={style.inputDias}
                placeholder="Digite o tempo de foco"
                numberOfLines={10}
                multiline={true}
                value={tempoFoco}
                onChangeText={setTempoFoco}
              />
              <View style={style.containerButtonB}>                
                <Pressable style={style.containerButton} onPress={submitTask}>
                  <IconSave />
                  <Text style={style.buttonText}>Salvar</Text>
                </Pressable>
                <Pressable
                  style={style.containerButton}
                  onPress={submitRemoveTask}
                >
                  <IconDeleteA />
                  <Text style={style.buttonText}>Deletar</Text>
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
        <View style={style.footer}>
          <Text style={style.footerText}>Desenvolvido por Saulo Pavanello</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const style = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#021123",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
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
    gap: 8,
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
  inputDias: {
    width: "100%",
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
  buttonText: {
    color: "#021123",
    fontSize: 14,
    fontWeight: "600",
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
