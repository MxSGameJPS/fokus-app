import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  InteractionManager,
} from "react-native";
import { Audio } from "expo-av";
import { MusicIcon, PauseCircleIcon } from "../Icons";

const API_URL = "https://api-musicas-3af47.web.app/musicas";

export default function BotaoMusica() {
  const [musicas, setMusicas] = useState([]);
  const [currentMusica, setCurrentMusica] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMusicas = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMusicas(data);
    } catch (e) {
      console.error("Failed to fetch music:", e);
      setError(
        e.message.includes("JSON Parse error")
          ? "Erro ao processar os dados das músicas. Verifique o formato da API."
          : `Falha ao carregar músicas: ${e.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  useEffect(() => {
    if (modalVisible && musicas.length === 0 && !loading) {
      fetchMusicas();
    }
  }, [modalVisible, musicas.length, loading]); // Corrigido: Adicionado musicas.length e loading às dependências

  const playSound = async (musica) => {
    if (sound) {
      await sound.unloadAsync();
    }
    setError(null); // Limpa erros anteriores ao tentar tocar uma nova música
    try {
      // Busca a música específica usando o endpoint com ID para obter o URL com token de acesso
      if (musica.id) {
        setLoading(true);
        try {
          const musicaResponse = await fetch(`${API_URL}/${musica.id}`);
          if (!musicaResponse.ok) {
            throw new Error(`HTTP error! status: ${musicaResponse.status}`);
          }
          const musicaAtualizada = await musicaResponse.json();
          if (
            musicaAtualizada &&
            (musicaAtualizada.url || musicaAtualizada.uri)
          ) {
            musica = musicaAtualizada; // Atualiza com os dados mais recentes, incluindo URL com token
          }
        } catch (fetchError) {
          console.error("Erro ao buscar detalhes da música:", fetchError);
          // Continua com os dados que já temos caso a busca específica falhe
        } finally {
          setLoading(false);
        }
      }

      console.log("Loading Sound for:", musica.url || musica.uri);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: musica.url || musica.uri },
        { shouldPlay: true }
      );
      setSound(newSound);
      setCurrentMusica(musica);
      setIsPlaying(true);
      setModalVisible(false);

      newSound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
          await newSound.unloadAsync();
          setSound(null);
          setCurrentMusica(null);
          console.log("Playback finished!");
        } else if (status.error) {
          console.error("Playback Error:", status.error);
          setError(
            `Erro ao tocar ${musica.titulo || musica.title || musica.name}: ${
              status.error
            }. Verifique o formato do áudio e a URL.`
          );
          setIsPlaying(false);
          await newSound.unloadAsync();
          setSound(null);
          setCurrentMusica(null);
        }
      });
    } catch (e) {
      console.error("Error loading or playing sound:", e);
      setError(
        `Erro ao carregar a música ${
          musica.titulo || musica.title || musica.name
        }. Verifique a URL e o formato do arquivo. Detalhes: ${e.message}`
      );
      setIsPlaying(false);
      setSound(null);
      setCurrentMusica(null);
    }
  };

  const handleButtonPress = async () => {
    if (currentMusica) {
      if (isPlaying && sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else if (!isPlaying && sound) {
        await sound.playAsync();
        setIsPlaying(true);
      } else {
        // Caso currentMusica exista mas o som não (ex: após erro)
        playSound(currentMusica);
      }
    } else {
      if (musicas.length === 0 && !loading) {
        await fetchMusicas(); // Garante que as músicas sejam buscadas se a lista estiver vazia
      }
      setModalVisible(true);
    }
  };

  const playNextSong = async () => {
    if (musicas.length === 0) return;

    let currentIndex = -1;
    if (currentMusica) {
      currentIndex = musicas.findIndex(
        (m) =>
          (m.id && m.id === currentMusica.id) ||
          (m.url && m.url === currentMusica.url)
      );
    }

    const nextIndex = (currentIndex + 1) % musicas.length;
    const nextMusica = musicas[nextIndex];

    if (nextMusica) {
      await playSound(nextMusica);
    }
  };

  const renderMusicaItem = ({ item }) => (
    <TouchableOpacity style={styles.musicaItem} onPress={() => playSound(item)}>
      {/* Adicionando uma imagem placeholder se não houver imagem na API */}
      <View style={styles.musicaImagePlaceholder}>
        <MusicIcon color="#fff" size={30} />
      </View>
      <View style={styles.musicaInfo}>
        <Text style={styles.musicaName}>
          {item.titulo || item.title || item.name || "Música Desconhecida"}
        </Text>
        <Text style={styles.musicaDescription}>
          {item.artista || item.artist || "Artista Desconhecido"}
        </Text>
        {item.estilo && <Text style={styles.musicaEstilo}>{item.estilo}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {" "}
      <TouchableOpacity
        style={styles.musicaButton}
        onPress={handleButtonPress}
        activeOpacity={0.7}
      >
        {currentMusica ? (
          isPlaying ? (
            <PauseCircleIcon />
          ) : (
            <MusicIcon />
          )
        ) : (
          <MusicIcon />
        )}
        <Text style={styles.buttonText}>
          {currentMusica
            ? isPlaying
              ? `Pausar: ${
                  currentMusica.titulo ||
                  currentMusica.title ||
                  currentMusica.name
                }`
              : `Continuar: ${
                  currentMusica.titulo ||
                  currentMusica.title ||
                  currentMusica.name
                }`
            : "Tocar Música"}
        </Text>
      </TouchableOpacity>
      {currentMusica && (
        <TouchableOpacity
          style={styles.nextButton}
          onPress={playNextSong}
          activeOpacity={0.7}
        >
          <Text style={styles.nextButtonText}>Próxima música</Text>
        </TouchableOpacity>
      )}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Músicas para Foco</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#1DB954" />
                <Text style={styles.loadingText}>Carregando músicas...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <Text style={styles.errorHelpText}>
                  {error.includes("formato")
                    ? "Dica: Alguns formatos de áudio podem não ser compatíveis com o player. Tente converter o arquivo para MP3."
                    : error.includes("permissão")
                    ? "Dica: Os arquivos do Google Drive precisam ter permissão de acesso público."
                    : "Dica: Verifique se o arquivo existe e está acessível publicamente."}
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={fetchMusicas}
                >
                  <Text style={styles.retryText}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={musicas}
                keyExtractor={(item) =>
                  item.id?.toString() || Math.random().toString()
                }
                renderItem={renderMusicaItem}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    Nenhuma música encontrada
                  </Text>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  musicaButton: {
    backgroundColor: "#1DB954", // Mantendo a cor verde
    padding: 12,
    borderRadius: 32,
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    width: "100%",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  nextButton: {
    backgroundColor: "#144480", // Cor azul para diferenciar
    padding: 8,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    width: "100%",
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#021123",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#144480",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#144480",
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 16,
  },
  errorContainer: {
    padding: 24,
    alignItems: "center",
  },
  errorText: {
    color: "#ff6b6b",
    textAlign: "center",
    marginBottom: 8,
  },
  errorHelpText: {
    color: "#98A0A8",
    textAlign: "center",
    fontSize: 12,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: "#98A0A8",
    textAlign: "center",
    padding: 20,
  },
  retryButton: {
    backgroundColor: "#144480",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "bold",
  },
  listContainer: {
    padding: 16,
  },
  musicaItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#144480",
  },
  musicaImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 12,
  },
  musicaImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: "#1DB954",
    justifyContent: "center",
    alignItems: "center",
  },
  musicaInfo: {
    flex: 1,
  },
  musicaName: {
    color: "#fff",
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
});
