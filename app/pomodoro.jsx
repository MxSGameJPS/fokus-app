import { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Vibration,
  Platform,
  AppState,
} from "react-native";
import FokusButton from "../components/FokusButton";
import ActionButton from "./../components/ActionButton/index";
import Timer from "./../components/Timer/index";
import { PauseIcon, PlayIcon } from "./../components/Icons/index";
import { Audio } from "expo-av";
import * as Notifications from "expo-notifications";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useNavigation } from "expo-router";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import BotaoMusica from "../components/botaoMusica";

// Nome da tarefa em background
const BACKGROUND_TIMER_TASK = "background-timer-task";

// Definir a tarefa em background
TaskManager.defineTask(BACKGROUND_TIMER_TASK, async () => {
  try {
    // Aqui você pode atualizar a notificação se necessário
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Configuração do NotificationHandler - esta deve ser fora do componente
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function Pomodoro() {
  // Recebe os parâmetros da navegação
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const tempoPersonalizado = params.tempoPersonalizado;
  const nomeTarefa = params.nomeTarefa;
  const autoStart = params.autoStart === "true";

  console.log("Tela de Pomodoro carregada");

  // Tempo personalizado em segundos (ou valor padrão de 25 minutos)
  const focoTime = tempoPersonalizado
    ? parseInt(tempoPersonalizado, 10)
    : 25 * 60;

  // Define os tipos de pomodoro
  const pomodoro = [
    {
      id: "focus",
      initialValue: focoTime,
      image: require("./pomodoro.png"),
      display: "Foco",
    },
    {
      id: "short",
      initialValue: 5 * 60,
      image: require("./curto.png"),
      display: "Pausa Curta",
    },
    {
      id: "long",
      initialValue: 15 * 60,
      image: require("./longo.png"),
      display: "Pausa Longa",
    },
  ];

  // Estados principais
  const [timerType, setTimerType] = useState(pomodoro[0]);
  const [timerSeconds, setTimerSeconds] = useState(focoTime);
  const [timerRunning, setTimerRunning] = useState(false);
  const [pomodoroInitialized, setPomodoroInitialized] = useState(false);
  const [notificationId, setNotificationId] = useState(null);

  // Referências para manter valores entre renderizações
  const startSound = useRef(null);
  const endSound = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  // Referências para detectar mudanças nos parâmetros
  const previousTempoRef = useRef(tempoPersonalizado);
  const previousTarefaRef = useRef(nomeTarefa);

  // Criar canais de notificação para Android no início - evita problemas de inicialização tardia
  useEffect(() => {
    // Pedir permissões para notificações
    async function setupNotifications() {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        console.log("Status das permissões de notificação:", status);

        // Criar canais apenas se tivermos permissão
        if (status === "granted" && Platform.OS === "android") {
          // Canal para notificações normais
          await Notifications.setNotificationChannelAsync("timer", {
            name: "Timer Notifications",
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            sound: true,
          });
          console.log("Canal timer criado");

          // Canal específico para notificações persistentes
          await Notifications.setNotificationChannelAsync("timer-running", {
            name: "Timer Em Execução",
            description:
              "Mostra o estado atual do timer quando o app está em segundo plano",
            importance: Notifications.AndroidImportance.DEFAULT,
            vibrationPattern: [0],
            sound: false,
            enableVibrate: false,
            lockscreenVisibility:
              Notifications.AndroidNotificationVisibility.PUBLIC,
          });
          console.log("Canal timer-running criado");
        }
      } catch (error) {
        console.error("Erro ao configurar notificações:", error);
      }
    }

    setupNotifications();
  }, []);

  // Registrar a tarefa em background ao montar o componente
  useEffect(() => {
    registerBackgroundTask();

    return () => {
      // Tentar desregistrar a tarefa ao desmontar
      unregisterBackgroundTask();
    };
  }, []);

  // Monitorar mudanças no estado do aplicativo (ativo, em background, inativo)
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      console.log("App state changed to:", nextAppState);
      console.log("Previous state was:", appStateRef.current);

      if (
        appStateRef.current === "active" &&
        nextAppState.match(/inactive|background/)
      ) {
        // App está indo para o background
        console.log("App indo para background, timer running:", timerRunning);
        if (timerRunning) {
          // Salvar o tempo atual para cálculo correto ao retornar
          startTimeRef.current = {
            timestamp: Date.now(),
            remainingSeconds: timerSeconds,
          };

          // Criar notificação imediatamente ao ir para background
          createTimerNotification(timerSeconds).catch((error) =>
            console.error("Erro ao mostrar notificação em background:", error)
          );
        }
      } else if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App está voltando para o primeiro plano
        console.log("App voltando para primeiro plano");
        if (timerRunning && startTimeRef.current) {
          // Calcular quanto tempo passou enquanto estava em background
          const elapsedSeconds = Math.floor(
            (Date.now() - startTimeRef.current.timestamp) / 1000
          );
          const newSeconds = Math.max(
            0,
            startTimeRef.current.remainingSeconds - elapsedSeconds
          );

          console.log(
            "Tempo decorrido em background:",
            elapsedSeconds,
            "segundos"
          );
          console.log("Novo tempo do timer:", newSeconds);

          // Atualizar o timer
          setTimerSeconds(newSeconds);

          // Se o timer acabou enquanto estava em background
          if (newSeconds <= 0) {
            tempoAcabou();
            setTimerSeconds(timerType.initialValue);
            clearTimer();
          } else {
            // Remover a notificação ao voltar para o app
            removeTimerNotification();
          }
        } else {
          // Garantir que não há notificações pendentes ao voltar para o app
          removeTimerNotification();
        }
      }

      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [timerRunning, timerSeconds, timerType]);

  // Efeito para reinicializar o componente quando os parâmetros mudam
  useEffect(() => {
    if (
      previousTempoRef.current !== tempoPersonalizado ||
      previousTarefaRef.current !== nomeTarefa
    ) {
      // Atualizar as referências
      previousTempoRef.current = tempoPersonalizado;
      previousTarefaRef.current = nomeTarefa;

      // Limpar o timer atual e a notificação
      clearTimer();
      removeTimerNotification();

      // Reinicializar o estado
      setTimerType(pomodoro[0]);
      setTimerSeconds(focoTime);
      setTimerRunning(false);

      // Resetar a inicialização para garantir que o autoStart funcione
      setPomodoroInitialized(false);

      // Dar um tempo e então definir como inicializado novamente
      setTimeout(() => {
        setPomodoroInitialized(true);
      }, 100);
    }
  }, [tempoPersonalizado, nomeTarefa, focoTime]);

  // Carregar sons e inicializar
  useEffect(() => {
    async function loadSounds() {
      try {
        const { sound: start } = await Audio.Sound.createAsync(
          require("../assets/sounds/play.mp3")
        );
        startSound.current = start;

        const { sound: end } = await Audio.Sound.createAsync(
          require("../assets/sounds/grito.mp3")
        );
        endSound.current = end;

        // Indicar que a inicialização foi concluída
        setPomodoroInitialized(true);
      } catch (error) {
        console.error("Erro ao carregar sons:", error);
        // Mesmo com erro nos sons, permitir que o app continue
        setPomodoroInitialized(true);
      }
    }

    loadSounds();

    // Limpar recursos ao desmontar
    return () => {
      clearTimer();
      removeTimerNotification();
      if (startSound.current) {
        startSound.current.unloadAsync();
      }
      if (endSound.current) {
        endSound.current.unloadAsync();
      }
    };
  }, []);

  // Registrar a tarefa em background
  async function registerBackgroundTask() {
    try {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_TIMER_TASK, {
        minimumInterval: 60, // 1 minuto (em segundos)
        stopOnTerminate: true, // Parar quando o app for fechado completamente
        startOnBoot: false, // Não iniciar automaticamente após reinicialização do dispositivo
      });
      console.log("Tarefa em background registrada com sucesso");
    } catch (err) {
      console.error("Erro ao registrar tarefa em background:", err);
    }
  }

  // Desregistrar a tarefa em background
  async function unregisterBackgroundTask() {
    try {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_TIMER_TASK);
      console.log("Tarefa em background desregistrada");
    } catch (err) {
      console.error("Erro ao desregistrar tarefa em background:", err);
    }
  }

  // Nova função para criar notificação - mais simples e direta
  async function createTimerNotification(seconds) {
    try {
      // Formatar o tempo para exibição MM:SS
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      const timeDisplay = `${minutes < 10 ? "0" + minutes : minutes}:${
        remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds
      }`;

      // Calcular o horário de término
      const endTime = new Date(Date.now() + seconds * 1000);
      const endHours = endTime.getHours();
      const endMinutes = endTime.getMinutes();
      const formattedEndTime = `${endHours}:${
        endMinutes < 10 ? "0" + endMinutes : endMinutes
      }`;

      // Determinar o tipo de timer atual
      const timerTypeDisplay =
        timerType.id === "focus"
          ? "Foco"
          : timerType.id === "short"
          ? "Pausa Curta"
          : "Pausa Longa";

      // Título e corpo da notificação
      let title = `Fokus - ${timerTypeDisplay}: ${timeDisplay}`;
      let body = nomeTarefa
        ? `Trabalhando em: ${nomeTarefa} (término às ${formattedEndTime})`
        : `Timer ativo! Término previsto às ${formattedEndTime}`;

      console.log("Criando notificação simples:", title, body);

      // Primeiro remover qualquer notificação existente
      await removeTimerNotification();

      // Criar uma notificação simples usando scheduleNotificationAsync
      // (que substituiu presentNotificationAsync)
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { type: "timer-running" },
          android: {
            channelId: "timer-running",
            ongoing: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
          },
        },
        trigger: null, // Exibir imediatamente
      });

      console.log("Notificação criada com ID:", id);
      setNotificationId(id);

      return id;
    } catch (error) {
      console.error("Erro ao criar notificação:", error);
    }
  }

  // Atualizar a notificação periodicamente
  async function updateTimerNotification(seconds) {
    try {
      // Se estiver em primeiro plano, não atualizar notificação
      if (appStateRef.current === "active") {
        return;
      }

      console.log("Atualizando notificação com", seconds, "segundos restantes");

      // Criar nova notificação (implicitamente remove a anterior)
      await createTimerNotification(seconds);
    } catch (error) {
      console.error("Erro ao atualizar notificação:", error);
    }
  }

  // Função para remover a notificação do timer
  async function removeTimerNotification() {
    if (notificationId) {
      try {
        console.log("Removendo notificação ID:", notificationId);
        await Notifications.dismissNotificationAsync(notificationId);
        setNotificationId(null);
      } catch (error) {
        console.error("Erro ao remover notificação:", error);
      }
    }
  }

  // Função para reproduzir o som de início
  const iniciar = async () => {
    try {
      if (startSound.current) {
        await startSound.current.replayAsync();
      }
    } catch (error) {
      console.error("Erro ao reproduzir som de início:", error);
    }
  };

  // Função para iniciar o timer
  function startTimer() {
    if (timerRef.current) return; // Se já estiver rodando, não faz nada

    iniciar(); // Chama a função iniciar que reproduz o som de início
    setTimerRunning(true);

    // Salvar o tempo de início para cálculos futuros
    startTimeRef.current = {
      timestamp: Date.now(),
      remainingSeconds: timerSeconds,
    };

    // Remover notificações existentes antes de iniciar o timer
    removeTimerNotification();

    const id = setInterval(() => {
      setTimerSeconds((oldState) => {
        const newState = oldState - 1;

        // Atualizar a notificação apenas se o app estiver em background
        if (appStateRef.current !== "active") {
          // Atualizar a cada 120 segundos ou nos últimos 10 segundos
          if (newState % 120 === 0 || newState <= 10) {
            updateTimerNotification(newState);
          }
        }

        if (newState <= 0) {
          clearTimer();
          tempoAcabou();
          return timerType.initialValue;
        }
        return newState;
      });
    }, 1000);
    timerRef.current = id;
  }

  // Auto-iniciar o timer se vier de uma tarefa
  useEffect(() => {
    if (autoStart && pomodoroInitialized) {
      // Pequeno atraso para garantir que tudo está pronto
      const timer = setTimeout(() => {
        startTimer();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [autoStart, pomodoroInitialized]);

  // Função para quando o tempo acabar
  const tempoAcabou = async () => {
    // Remover a notificação persistente do timer
    removeTimerNotification();

    try {
      if (endSound.current) {
        await endSound.current.replayAsync();
      }
    } catch (error) {
      console.error("Erro ao reproduzir som de término:", error);
    }

    // Adicionar vibração para feedback tátil
    if (Platform.OS === "android") {
      Vibration.vibrate(500);
    } else {
      // Para iOS, usar Haptics para feedback
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.error("Erro com Haptics:", error);
      }
    }

    // Determinar a mensagem com base no tipo de timer e nome da tarefa
    const tipoTimer = timerType.id === "focus" ? "foco" : "pausa";
    let titulo = `Fokus - Tempo de ${tipoTimer} finalizado!`;
    let mensagem = nomeTarefa
      ? `Tarefa "${nomeTarefa}" concluída!`
      : `Seu tempo de ${tipoTimer} terminou!`;

    // Enviar notificação de conclusão usando scheduleNotificationAsync
    try {
      const notifId = await Notifications.scheduleNotificationAsync({
        content: {
          title: titulo,
          body: mensagem,
          data: { type: "timer-finished" },
          sound: true,
          android: {
            channelId: "timer",
          },
        },
        trigger: null, // Exibir imediatamente
      });
      console.log("Notificação de conclusão criada:", notifId);
    } catch (error) {
      console.error("Erro ao criar notificação de conclusão:", error);
    }
  };

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setTimerRunning(false);
      removeTimerNotification();
    }
  };

  const toggleTimerType = (newTimerType) => {
    // Se estiver no mesmo tipo, não faz nada
    if (timerType.id === newTimerType.id) return;

    setTimerType(newTimerType);
    setTimerSeconds(newTimerType.initialValue);

    // Se o timer estiver rodando, atualize a notificação
    if (timerRunning) {
      clearTimer();
      // Se quiser reiniciar automaticamente ao trocar o tipo:
      // setTimeout(() => startTimer(), 100);
    }
  };

  function toggleTimer() {
    if (timerRef.current) {
      clearTimer();
    } else {
      startTimer();
    }
  }

  return (
    <View style={styles.container}>
      {/* Mostrar o nome da tarefa se fornecido */}
      {nomeTarefa && <Text style={styles.taskName}>Tarefa: {nomeTarefa}</Text>}
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
        </View>
        <Timer totalSeconds={timerSeconds} />
        <FokusButton
          title={timerRunning ? "Pausar" : "Começar"}
          icon={timerRunning ? <PauseIcon /> : <PlayIcon />}
          onPress={toggleTimer}
        />
      </View>
      <View style={styles.spotifyContainer}>
        <BotaoMusica />
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
    gap: 20,
    paddingVertical: 20,
  },
  taskName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#144480",
    borderRadius: 10,
    width: "80%",
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
    fontWeight: "400",
  },
  context: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  spotifyContainer: {
    width: "80%",
    marginTop: 10,
    zIndex: 5, // Para garantir que esteja acima de outros elementos
  },
});
