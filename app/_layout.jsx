import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { TaskProvider } from "../components/context/TaskProvider";

export default function Layout() {
  return (
    <TaskProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Drawer
          screenOptions={{
            headerStyle: {
              backgroundColor: "#021123",
            },
            headerTintColor: "#FFFFFF",
            drawerStyle: {
              backgroundColor: "#021123",
            },
            drawerLabelStyle: {
              color: "#FFFFFF",
            },
          }}
        >
          <Drawer.Screen
            name="Home"
            options={{
              title: "Home",
              headerShown: false,
              drawerItemStyle: { display: "none" },
            }}
          />
          <Drawer.Screen
            name="pomodoro"
            options={{
              title: "",
              drawerLabel: "Timer",
            }}
          />
          <Drawer.Screen
            name="tasks/index"
            options={{
              title: "",
              drawerLabel: "Tarefas",
            }}
          />
          <Drawer.Screen
            name="add-task/index"
            options={{
              title: "",
              drawerLabel: "Adicionar Tarefa",
            }}
          />
        </Drawer>
      </GestureHandlerRootView>
    </TaskProvider>
  );
}
