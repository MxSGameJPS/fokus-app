import { FlatList, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import TaskItem from "../../components/TaskItem";
import FokusButton from "./../../components/FokusButton";
import { IconAdd } from "./../../components/Icons";
import { router } from "expo-router";
import useTaskContext from "./../../components/context/useTaskContext";

export default function Tasks() {
  const { tasks, removeTask, toggleTaskCompletion } = useTaskContext();

  return (
    <View style={style.container}>
      <View style={style.containerTarefas}>
        {/* {tasks.map((task) => {
          return <TaskItem completed={task.completed} text={task.task} key={task.id} />;
        })} */}
        <FlatList
          data={tasks}
          renderItem={({ item }) => (
            <TaskItem
              completed={item.completed}
              text={item.task}
              onToggleCompleted={() => toggleTaskCompletion(item.id)}
              onPressEdit={() => router.navigate(`/edit-task/${item.id}`)}
              onPressDelete={() => removeTask(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListHeaderComponent={
            <Text style={style.text}>Lista de Tarefas:</Text>
          }
          ListFooterComponent={
            <View style={style.containerButton}>
              <FokusButton
                icon={<IconAdd />}
                title="Adicionar nova Tarefa"
                outline
                onPress={() => router.navigate("./add-task")}
              />
            </View>
          }
        />
      </View>

      <View style={style.footer}>
        <Text style={style.footerText}>Desenvolvido por Saulo Pavanello</Text>
      </View>
    </View>
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
  text: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "400",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    marginBottom: 16,
  },
  containerTarefas: {
    gap: 8,
  },
  containerButton: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    marginTop: 16,
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
