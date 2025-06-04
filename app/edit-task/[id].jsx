import { useLocalSearchParams, router } from "expo-router";
import { Text, TextInput, View, StyleSheet, Pressable } from "react-native";
import { useState, useEffect } from "react";
import useTaskContext from "../../components/context/useTaskContext";

export default function EditTask() {
  const { id } = useLocalSearchParams()
  const { tasks, updateTask } = useTaskContext()

  const numericId = parseInt(id, 10);

    const task = tasks.find(t => t.id === numericId);
  const [taskText, setTaskText] = useState('');

  useEffect(() => {
    if (task) {
      setTaskText(task.task)
    }
  }, [task])

  const handleSave = () => {
    if (!taskText) return
    updateTask(numericId, taskText)
    router.navigate('/tasks')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar tarefa:</Text>
      <TextInput
        style={styles.input}
        value={taskText}
        onChangeText={setTaskText}
        multiline
      />
      <Pressable style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Salvar</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#021123',
    padding: 24,
    justifyContent: 'center',
    gap: 16
  },
  title: {
    color: '#fff',
    fontSize: 24,
    textAlign: 'center'
  },
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    minHeight: 100
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center'
  }
})