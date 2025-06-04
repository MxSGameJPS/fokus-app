import { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const TaskContext = createContext();

const TASKS_STORAGE_KEY = "fokus-tasks";

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const getData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
        const loadingData = jsonValue != null ? JSON.parse(jsonValue) : [];
        setTasks(loadingData);
        setIsLoaded(true);
      } catch (e) {
        // error reading value
      }
    };
    getData();
  }, []);

  useEffect(() => {
    const storeData = async (value) => {
      try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(TASKS_STORAGE_KEY, jsonValue);
      } catch (e) {
        // saving error
      }
    };
    if (isLoaded) {
      storeData(tasks);
    }
  }, [tasks]);

  function addTask(task) {
    setTasks((oldState) => {
      return [
        ...oldState,
        {
          task,
          id: oldState.length + 1,
        },
      ];
    });
  }

  function toggleTaskCompletion(Id) {
    setTasks((oldState) => {
      return oldState.map((task) => {
        if (task.id === Id) {
          task.completed = !task.completed;
        }
        return task;
      });
    });
  }

  function removeTask(Id) {
    setTasks((oldState) => oldState.filter((task) => task.id !== Id));
  }

  const updateTask = (id, newText) => {
  setTasks(oldState =>
    oldState.map(t => {
      if (t.id === id) {
        return { ...t, task: newText }
      }
      return t
    })
  )
}

  return (
    <TaskContext.Provider
      value={{ tasks, addTask, removeTask, toggleTaskCompletion, updateTask }}
    >
      {children}
    </TaskContext.Provider>
  );
}
