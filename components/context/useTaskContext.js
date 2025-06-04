import { useContext } from "react";
import { TaskContext } from "./TaskProvider";

export default function useTaskContext() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("Tentando usar useTaskContext fora do TaskProvider");
  }
  return context;
}
