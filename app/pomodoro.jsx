import { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Vibration,
  Platform,
} from "react-native";
import FokusButton from "../components/FokusButton";
import ActionButton from "./../components/ActionButton/index";
import Timer from "./../components/Timer/index";
import { PauseIcon, PlayIcon } from "./../components/Icons/index";
// TODO: Migrar para expo-audio quando estiver mais estável
// Atualmente mantendo expo-av apesar do aviso de depreciação no SDK 54
import { Audio } from "expo-av";
import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";

// Alterar a configuração do NotificationHandler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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

export default function Pomodoro() {
  const [timerType, setTimerType] = useState(pomodoro[0]);
  const [timerSeconds, setTimerSeconds] = useState(pomodoro[0].initialValue);
  const [timerRunning, setTimerRunning] = useState(false);
  const startSound = useRef(null);
  const endSound = useRef(null);

  const timerRef = useRef(null);
  useEffect(() => {
    async function loadSounds() {
      const { sound: start } = await Audio.Sound.createAsync(
        require("../assets/sounds/play.mp3")
      );
      startSound.current = start;

      const { sound: end } = await Audio.Sound.createAsync(
        require("../assets/sounds/grito.mp3")
      );
      endSound.current = end;
    }

    loadSounds();

    // Limpar recursos ao desmontar
    return () => {
      if (startSound.current) {
        startSound.current.unloadAsync();
      }
      if (endSound.current) {
        endSound.current.unloadAsync();
      }
    };
  }, []);
  // Pedir permissões para notificações
  useEffect(() => {
    async function requestPermissions() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Permissão para notificações não concedida!");
      }
    }

    requestPermissions();

    // Criar canal de notificação para Android
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("timer", {
        name: "Timer Notifications",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        sound: true,
      });
    }
  }, []);
  // Função para reproduzir o som de início
  const iniciar = async () => {
    // Tocar som de início
    try {
      if (startSound.current) {
        await startSound.current.replayAsync();
      }
    } catch (error) {
      console.error("Erro ao reproduzir som de início:", error);
    }
  }; // Função para quando o tempo acabar
  const tempoAcabou = async () => {
    // Tocar som de término
    try {
      if (endSound.current) {
        await endSound.current.replayAsync();
      }
    } catch (error) {
      console.error("Erro ao reproduzir som de término:", error);
    } // Adicionar vibração para feedback tátil
    if (Platform.OS === "android") {
      Vibration.vibrate(500);
    } else {
      // Para iOS, usar Haptics para feedback
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (_) {
        console.log("Haptics não suportado");
      }
    } // Enviar notificação
    await Notifications.presentNotificationAsync({
      title: "Fokus App",
      body: `Seu tempo de ${
        timerType.id === "focus" ? "foco" : "pausa"
      } terminou!`,
      sound: true,
      android: {
        channelId: "timer",
      },
    });
  };

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

    iniciar(); // Chama a função iniciar que reproduz o som de início
    setTimerRunning(true);

    const id = setInterval(() => {
      setTimerSeconds((oldState) => {
        if (oldState <= 1) {
          // Mudado para 1 para garantir que o timer acabe corretamente
          clearTimer();
          tempoAcabou(); // Chama a função quando o tempo acabar
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
