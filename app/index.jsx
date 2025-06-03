import { useRef, useState } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import FokusButton from "../components/FokusButton";
import ActionButton from "./../components/ActionButton/index";
import Timer from "./../components/Timer/index";
import { PauseIcon, PlayIcon } from './../components/Icons/index';

const pomodoro = [
  {
    id: "focus",
    initialValue: 25 * 60, // 25 minutes in seconds
    image: require("./pomodoro.png"),
    display: "Foco",
  },
  {
    id: "short",
    initialValue: 5 * 60, // 5 minutes in seconds
    image: require("./curto.png"),
    display: "Pausa Curta",
  },
  {
    id: "long",
    initialValue: 15 * 60, // 15 minutes in seconds
    image: require("./longo.png"),
    display: "Pausa Longa",
  },
];

export default function Index() {
  const [timerType, setTimerType] = useState(pomodoro[0]);
  const [timerSeconds, setTimerSeconds] = useState(pomodoro[0].initialValue);
  const [timerRunning, setTimerRunning] = useState(false);

  const timerRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setTimerRunning(false);
    }
  };

  const toggleTimerType = (newTimerType) => {
    setTimerType(newTimerType);
    setTimerSeconds(newTimerType.initialValue);
    clearTimer();
  };

  function toggleTimer() {
    if (timerRef.current) {
      clearTimer();
      return;
    }

    setTimerRunning(true);
    const id = setInterval(() => {
      setTimerSeconds(oldState => {
        if (oldState <= 0) {
          clearTimer();
          return timerType.initialValue; 
        }
        return oldState - 1;
      });
    }, 1000);
    timerRef.current = id;
  }

  return (
    <View style={styles.container}>
      <Image style={styles.image} source={timerType.image} />
      <View style={styles.actions}>
        <View style={styles.context}>
          {pomodoro.map((p) => (
            <ActionButton
              key={p.id}
              active={timerType.id === p.id}
              onPress={() => toggleTimerType(p)}
              display={p.display}
            />
          ))}
          ;
        </View>
        <Timer totalSeconds={timerSeconds} />
        <FokusButton
          title={timerRunning ? "Pausar" : "Começar"}
          icon={timerRunning ? <PauseIcon /> : <PlayIcon />}
          onPress={toggleTimer}
        />
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>Desenvolvido por Saulo Pavanello</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#021123",
    gap: 40,
  },
  image: {
    width: 300,
    height: 300,
  },
  actions: {
    padding: 24,
    backgroundColor: "#14448080",
    width: "80%",
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#144480",
    gap: 32,
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
  context: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
});
