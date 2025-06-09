import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  AppState,
} from "react-native";
import { Audio } from "expo-av";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export default function PlayerMusica({
  sound: externalSound,
  setSound: setExternalSound,
  currentMusica: externalCurrentMusica,
  setCurrentMusica: setExternalCurrentMusica,
  playing: externalPlaying,
  setPlaying: setExternalPlaying,
}) {
  // Modifique os estados para usar os externos se fornecidos
  const [musicas, setMusicas] = useState([]);
  const [sound, setSound] = useState(externalSound);
  const [currentMusica, setCurrentMusica] = useState(externalCurrentMusica);
  const [playing, setPlaying] = useState(externalPlaying);
  const [loading, setLoading] = useState(true);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [error, setError] = useState(null);

  const appState = useRef(AppState.currentState);
  const soundRef = useRef(null);

  useEffect(() => {
    setupAudio();
    carregarMusicas();

    // Configurar listener para mudanças de estado do app
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App voltou ao primeiro plano
        // Não reiniciar o áudio, apenas sincronizar o estado
        syncPlaybackState();
      }

      appState.current = nextAppState;
    });

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      subscription.remove();
    };
  }, []);

  // Função para sincronizar estado da reprodução
  async function syncPlaybackState() {
    if (sound) {
      try {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          setPlaying(status.isPlaying);
        }
      } catch (error) {
        console.error("Erro ao sincronizar estado da reprodução:", error);
      }
    }
  }

  async function setupAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      console.log("Áudio configurado com sucesso");
    } catch (e) {
      console.error("Erro ao configurar modo de áudio:", e);
    }
  }

  async function carregarMusicas() {
    setLoading(true);
    setError(null);

    try {
      console.log("Tentando carregar músicas do Firebase...");
      const musicasRef = collection(db, "musicas");
      const snapshot = await getDocs(musicasRef);

      if (snapshot.empty) {
        console.log("Nenhuma música encontrada no Firebase");
        setMusicas([]);
      } else {
        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log(`${lista.length} músicas carregadas do Firebase`);
        setMusicas(lista);
      }
    } catch (e) {
      console.error("Erro ao carregar músicas do Firebase:", e);
      setError(`Não foi possível carregar as músicas: ${e.message}`);
      setMusicas([]);
    } finally {
      setLoading(false);
    }
  }

  // Função para atualizar os estados externos
  const updateExternalState = (newSound, newCurrentMusica, isPlaying) => {
    if (setExternalSound) setExternalSound(newSound);
    if (setExternalCurrentMusica) setExternalCurrentMusica(newCurrentMusica);
    if (setExternalPlaying) setExternalPlaying(isPlaying);
  };

  async function playSound(musica) {
    if (!musica.url) {
      Alert.alert("Erro", "URL da música não disponível");
      return;
    }

    setLoadingAudio(true);

    try {
      // Parar o som atual se estiver tocando
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        soundRef.current = null;
      }

      // Converter o formato de URL para o formato correto do Firebase Storage
      let urlFinal = musica.url;

      // Se a URL estiver no formato armazenado do Firestore
      if (
        musica.url.includes(
          "storage.googleapis.com/api-musicas-3af47.firebasestorage.app"
        )
      ) {
        // Extrair o nome do arquivo
        const urlPartes = musica.url.split("/");
        const nomeArquivo = urlPartes[urlPartes.length - 1];

        // Criar URL no formato direto do Firebase Storage
        urlFinal = `https://firebasestorage.googleapis.com/v0/b/api-musicas-3af47.firebasestorage.app/o/${nomeArquivo}?alt=media`;
      }

      const { sound: novoSound } = await Audio.Sound.createAsync(
        { uri: urlFinal },
        {
          shouldPlay: true,
          staysActiveInBackground: true, // Garantir reprodução em segundo plano
        },
        onPlaybackStatusUpdate
      );

      setSound(novoSound);
      soundRef.current = novoSound;
      setCurrentMusica(musica);
      setPlaying(true);

      updateExternalState(novoSound, musica, true);
    } catch (error) {
      Alert.alert(
        "Erro",
        `Não foi possível reproduzir a música: ${error.message}`
      );
    } finally {
      setLoadingAudio(false);
    }
  }

  function onPlaybackStatusUpdate(status) {
    if (status.isLoaded) {
      if (status.didJustFinish) {
        setPlaying(false);
      } else {
        // Atualizar estado de reprodução
        setPlaying(status.isPlaying);
      }
    } else if (status.error) {
      Alert.alert("Erro de reprodução", status.error);
    }
  }

  async function togglePlayPause() {
    if (!sound || !currentMusica) return;

    try {
      if (playing) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setPlaying(!playing);
      updateExternalState(sound, currentMusica, !playing);
    } catch (error) {
      Alert.alert(
        "Erro",
        `Problema ao controlar a reprodução: ${error.message}`
      );
    }
  }

  // Adicione este useEffect após o primeiro useEffect
  useEffect(() => {
    // Atualizar estado interno quando as props externas mudarem
    if (externalSound !== undefined) setSound(externalSound);
    if (externalCurrentMusica !== undefined)
      setCurrentMusica(externalCurrentMusica);
    if (externalPlaying !== undefined) setPlaying(externalPlaying);
  }, [externalSound, externalCurrentMusica, externalPlaying]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={styles.loadingText}>Carregando músicas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={carregarMusicas}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Música para Foco</Text>

      {musicas.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma música disponível</Text>
      ) : (
        <FlatList
          data={musicas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.musicaItem,
                currentMusica?.id === item.id
                  ? styles.selectedMusicaItem
                  : null,
              ]}
              onPress={() => playSound(item)}
              disabled={loadingAudio}
            >
              <View style={styles.musicaImagePlaceholder}>
                <Text style={styles.musicaImageText}>🎵</Text>
              </View>
              <View style={styles.musicaInfo}>
                <Text style={styles.musicaName}>{item.titulo || "Música"}</Text>
                <Text style={styles.musicaDescription}>
                  {item.artista || "Artista"}
                </Text>
                {item.estilo && (
                  <Text style={styles.musicaEstilo}>{item.estilo}</Text>
                )}
              </View>
              {loadingAudio && currentMusica?.id === item.id && (
                <ActivityIndicator size="small" color="#1DB954" />
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContainer}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={true}
          style={{ flex: 1, height: "100%" }}
        />
      )}

      {currentMusica && (
        <View style={styles.playerContainer}>
          <View style={styles.playerInfo}>
            <Text style={styles.currentMusicaTitle} numberOfLines={1}>
              {currentMusica.titulo || "Música"}
            </Text>
            <Text style={styles.currentMusicaArtist} numberOfLines={1}>
              {currentMusica.artista || "Artista"}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.playButton, playing ? styles.pauseButton : null]}
            onPress={togglePlayPause}
            disabled={loadingAudio}
          >
            {loadingAudio ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.playButtonText}>{playing ? "❚❚" : "▶"}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#021123",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#021123",
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#021123",
    padding: 20,
  },
  errorText: {
    color: "#ff6b6b",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#1DB954",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  emptyText: {
    color: "#98A0A8",
    textAlign: "center",
    marginTop: 40,
  },
  listContainer: {
    paddingBottom: 100, // Espaço para o player na parte inferior
  },
  musicaItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#041832",
    borderWidth: 2,
    borderColor: "#144480",
  },
  selectedMusicaItem: {
    backgroundColor: "#1E5B9F",
    borderLeftWidth: 4,
    borderLeftColor: "#1DB954",
  },
  musicaImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: "#1DB954",
    justifyContent: "center",
    alignItems: "center",
  },
  musicaImageText: {
    fontSize: 24,
  },
  musicaInfo: {
    flex: 1,
  },
  musicaName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  musicaDescription: {
    color: "#98A0A8",
    fontSize: 14,
  },
  musicaEstilo: {
    color: "#7BACF5",
    fontSize: 12,
    marginTop: 4,
    fontStyle: "italic",
  },
  playerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#041832",
    borderWidth: 2,
    borderColor: "#144480",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  playerInfo: {
    flex: 1,
  },
  currentMusicaTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  currentMusicaArtist: {
    color: "#98A0A8",
    fontSize: 14,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1DB954",
    justifyContent: "center",
    alignItems: "center",
  },
  pauseButton: {
    backgroundColor: "#ff7700",
  },
  playButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
