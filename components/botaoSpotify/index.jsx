import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { MusicIcon, PauseCircleIcon } from "../Icons";
import * as WebBrowser from "expo-web-browser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// Registrar o WebBrowser para autenticação com opções específicas
WebBrowser.maybeCompleteAuthSession({
  preferEphemeralSession: true, // Usar sessão efêmera para evitar problemas de cache
});

// Constantes
const CLIENT_ID = "88da5d41ee2d4156a63d5ff218694802";

// Configuração inteligente de REDIRECT_URI baseada na plataforma
const getRedirectUri = () => {
  // Determinar o ambiente de execução
  if (__DEV__) {
    // Ambiente de desenvolvimento
    if (Platform.OS === "android") {
      // Emulador Android geralmente usa 10.0.2.2 como localhost
      return "exp://10.0.2.2:8083";
    } else if (Platform.OS === "ios") {
      // Emulador iOS
      return "exp://localhost:8083";
    } else {
      // Web ou outros
      return "http://localhost:8083";
    }
  } else {
    // Ambiente de produção - usar o URL do Expo
    const projectId =
      Constants.expoConfig?.extra?.projectId ||
      Constants.manifest?.extra?.projectId ||
      "fokus-app";
    return `exp://exp.host/@seuusuario/${projectId}`;
  }
};

const REDIRECT_URI = getRedirectUri();
const SPOTIFY_AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const SPOTIFY_API_ENDPOINT = "https://api.spotify.com/v1";
const TOKEN_STORAGE_KEY = "@fokus:spotify_token";

export default function SpotifyTopTracksButton() {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  // Verificar token ao iniciar o componente
  useEffect(() => {
    const checkToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
        if (savedToken) {
          setAccessToken(savedToken);
          console.log("Token do Spotify recuperado com sucesso");

          // Opcional: verificar se o token ainda é válido
          const response = await fetch(`${SPOTIFY_API_ENDPOINT}/me`, {
            headers: { Authorization: `Bearer ${savedToken}` },
          });

          if (!response.ok) {
            console.log("Token expirado, removendo");
            await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
            setAccessToken(null);
          }
        }
      } catch (error) {
        console.error("Erro ao verificar token do Spotify:", error);
      }
    };

    checkToken();
  }, []);
  // Autenticar com o Spotify
  async function authenticate() {
    try {
      setLoading(true);
      setError(null);

      console.log(
        "Iniciando autenticação Spotify com URL de redirecionamento:",
        REDIRECT_URI
      );

      // Verificar se já temos um token salvo
      const savedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (savedToken) {
        console.log("Token existente encontrado, verificando validade...");

        // Verificar se o token ainda é válido
        try {
          const response = await fetch(`${SPOTIFY_API_ENDPOINT}/me`, {
            headers: { Authorization: `Bearer ${savedToken}` },
          });

          if (response.ok) {
            console.log("Token ainda é válido, usando token existente");
            setAccessToken(savedToken);
            await fetchFocusPlaylists(savedToken);
            return;
          } else {
            console.log("Token expirado, removendo e obtendo novo token");
            await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
          }
        } catch (error) {
          console.log("Erro ao verificar token, removendo:", error);
          await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      }

      // Gerar URL de autenticação
      const queryParams = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: "token",
        redirect_uri: REDIRECT_URI,
        scope:
          "user-read-private user-read-email playlist-read-private user-modify-playback-state",
        show_dialog: true,
      });

      const authUrl = `${SPOTIFY_AUTH_ENDPOINT}?${queryParams.toString()}`;
      console.log("URL de autenticação:", authUrl);

      // Iniciar fluxo de autenticação com WebBrowser
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        REDIRECT_URI,
        {
          showInRecents: true,
          createTask: false,
          dismissButtonStyle: "cancel",
          toolbarColor: "#1DB954",
        }
      );

      console.log("Resultado WebBrowser:", result.type);

      if (result.type === "success") {
        // Extrair o token de acesso da URL de redirecionamento
        const { url } = result;
        console.log("URL de retorno:", url);

        // Verificar se há erros na URL
        if (url.includes("error=")) {
          const errorMsg = url.split("error=")[1].split("&")[0];
          throw new Error(
            `Erro de autenticação Spotify: ${decodeURIComponent(errorMsg)}`
          );
        }

        // Verificar se há um token na URL
        if (!url.includes("access_token=")) {
          throw new Error("Token de acesso não encontrado na URL de retorno");
        }

        // Extrair token da URL
        const accessToken = url.split("#access_token=")[1].split("&")[0];
        console.log("Token obtido com sucesso");

        // Salvar o token para uso futuro
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
        setAccessToken(accessToken);

        // Buscar playlists de foco
        await fetchFocusPlaylists(accessToken);
      } else if (result.type === "dismiss") {
        console.log("Autenticação cancelada pelo usuário");
        setError("Autenticação cancelada pelo usuário");
      } else {
        console.log("Autenticação falhou:", result);
        setError("A autenticação falhou. Tente novamente.");
      }
    } catch (err) {
      console.error("Erro na autenticação:", err);
      setError(`Erro na autenticação: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }
  // Buscar playlists de foco
  async function fetchFocusPlaylists(token) {
    try {
      console.log(
        "Buscando playlists de foco com token:",
        token.substring(0, 10) + "..."
      );

      // Primeiro, buscar categoria de foco
      console.log("Buscando categoria 'focus'...");
      const categoryResponse = await fetch(
        `${SPOTIFY_API_ENDPOINT}/browse/categories/focus`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!categoryResponse.ok) {
        console.log("Resposta da categoria não ok:", categoryResponse.status);

        if (categoryResponse.status === 401) {
          console.log("Token expirado (401), removendo token");
          // Token expirado, tentar renovar
          await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
          setAccessToken(null);
          throw new Error("Sessão expirada. Por favor, faça login novamente.");
        }

        if (categoryResponse.status === 404) {
          console.log(
            "Categoria 'focus' não encontrada, tentando 'focus_music'"
          );
          // Tentar categoria alternativa se 'focus' não existir
          const altCategoryResponse = await fetch(
            `${SPOTIFY_API_ENDPOINT}/browse/categories/focus_music`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (!altCategoryResponse.ok) {
            throw new Error("Categorias de foco não encontradas");
          }
        } else {
          throw new Error(
            `Erro ao buscar categoria: ${categoryResponse.status}`
          );
        }
      }

      // Buscar playlists da categoria
      console.log("Buscando playlists da categoria...");
      const playlistsResponse = await fetch(
        `${SPOTIFY_API_ENDPOINT}/browse/categories/focus/playlists?limit=10`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!playlistsResponse.ok) {
        console.log("Resposta das playlists não ok:", playlistsResponse.status);

        // Se category=focus não funcionar, tentar focus_music
        if (playlistsResponse.status === 404) {
          console.log(
            "Tentando playlists da categoria alternativa 'focus_music'"
          );
          const altPlaylistsResponse = await fetch(
            `${SPOTIFY_API_ENDPOINT}/browse/categories/focus_music/playlists?limit=10`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (!altPlaylistsResponse.ok) {
            // Se tudo falhar, tentar featured playlists
            console.log("Tentando playlists em destaque como alternativa");
            const featuredResponse = await fetch(
              `${SPOTIFY_API_ENDPOINT}/browse/featured-playlists?limit=10`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (!featuredResponse.ok) {
              throw new Error("Não foi possível carregar nenhuma playlist");
            }

            const featuredData = await featuredResponse.json();
            setPlaylists(featuredData.playlists?.items || []);
            setModalVisible(true);
            return;
          }

          const altData = await altPlaylistsResponse.json();
          setPlaylists(altData.playlists?.items || []);
          setModalVisible(true);
          return;
        }

        throw new Error(
          `Não foi possível carregar as playlists: ${playlistsResponse.status}`
        );
      }

      const data = await playlistsResponse.json();
      console.log(
        `${data.playlists?.items?.length || 0} playlists encontradas`
      );
      setPlaylists(data.playlists?.items || []);
      setModalVisible(true);
    } catch (err) {
      console.error("Erro ao carregar playlists:", err);
      setError(`Erro ao carregar playlists: ${err.message}`);
    }
  }
  // Reproduzir playlist
  async function playPlaylist(playlist) {
    if (!accessToken) {
      setError("Não há token de acesso. Faça login novamente.");
      return;
    }

    try {
      setLoading(true);
      console.log(
        `Tentando reproduzir playlist: ${playlist.name} (${playlist.id})`
      );

      // Verificar dispositivos disponíveis
      console.log("Verificando dispositivos disponíveis...");
      const deviceResponse = await fetch(
        `${SPOTIFY_API_ENDPOINT}/me/player/devices`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!deviceResponse.ok) {
        console.log("Resposta de dispositivos não ok:", deviceResponse.status);

        if (deviceResponse.status === 401) {
          console.log("Token expirado (401), removendo token");
          // Token expirado
          await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
          setAccessToken(null);
          throw new Error("Sessão expirada. Por favor, faça login novamente.");
        }
        throw new Error(
          `Não foi possível verificar dispositivos: ${deviceResponse.status}`
        );
      }

      const devicesData = await deviceResponse.json();
      console.log(
        `${devicesData.devices?.length || 0} dispositivos encontrados`
      );

      if (!devicesData.devices || devicesData.devices.length === 0) {
        throw new Error(
          "Nenhum dispositivo Spotify ativo encontrado. Abra o Spotify em um dispositivo primeiro."
        );
      }

      // Mostrar dispositivos disponíveis no console para debug
      devicesData.devices.forEach((device, index) => {
        console.log(
          `Dispositivo ${index + 1}: ${device.name} (${device.type}), ativo: ${
            device.is_active
          }`
        );
      });

      // Usar preferencialmente um dispositivo já ativo
      const activeDevice = devicesData.devices.find(
        (device) => device.is_active
      );
      const deviceId = activeDevice
        ? activeDevice.id
        : devicesData.devices[0].id;

      console.log(
        `Usando dispositivo: ${
          activeDevice ? activeDevice.name : devicesData.devices[0].name
        }`
      );

      // Iniciar reprodução, especificando o dispositivo explicitamente
      console.log("Iniciando reprodução...");
      const playResponse = await fetch(
        `${SPOTIFY_API_ENDPOINT}/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            context_uri: playlist.uri,
          }),
        }
      );

      console.log("Resposta de reprodução:", playResponse.status);

      if (!playResponse.ok) {
        if (playResponse.status === 404) {
          throw new Error(
            "Nenhum player ativo encontrado. Inicie uma reprodução no Spotify primeiro."
          );
        }

        if (playResponse.status === 403) {
          throw new Error(
            "Este usuário não tem uma assinatura Premium do Spotify, necessária para controlar a reprodução."
          );
        }

        throw new Error(
          `Não foi possível iniciar a reprodução: ${playResponse.status}`
        );
      }

      console.log("Reprodução iniciada com sucesso");
      setCurrentPlaylist(playlist);
      setModalVisible(false);
    } catch (err) {
      console.error("Erro ao reproduzir:", err);
      setError(`Erro ao reproduzir: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }
  // Pausar a reprodução
  async function pausePlayback() {
    if (!accessToken) {
      setError("Não há token de acesso. Faça login novamente.");
      return;
    }

    try {
      setLoading(true);
      console.log("Tentando pausar reprodução...");

      // Verificar dispositivos disponíveis para garantir que temos um dispositivo ativo
      console.log("Verificando dispositivos disponíveis...");
      const deviceResponse = await fetch(
        `${SPOTIFY_API_ENDPOINT}/me/player/devices`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!deviceResponse.ok) {
        console.log("Resposta de dispositivos não ok:", deviceResponse.status);

        if (deviceResponse.status === 401) {
          console.log("Token expirado (401), removendo token");
          await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
          setAccessToken(null);
          throw new Error("Sessão expirada. Por favor, faça login novamente.");
        }
        throw new Error(
          `Não foi possível verificar dispositivos: ${deviceResponse.status}`
        );
      }

      const devicesData = await deviceResponse.json();

      if (!devicesData.devices || devicesData.devices.length === 0) {
        throw new Error("Nenhum dispositivo Spotify ativo encontrado.");
      }

      // Usar preferencialmente um dispositivo já ativo
      const activeDevice = devicesData.devices.find(
        (device) => device.is_active
      );

      if (!activeDevice) {
        throw new Error(
          "Nenhum dispositivo Spotify ativo encontrado para pausar."
        );
      }

      console.log(`Dispositivo ativo encontrado: ${activeDevice.name}`);
      const deviceId = activeDevice.id;

      // Pausar reprodução no dispositivo ativo
      console.log("Enviando comando de pausa...");
      const response = await fetch(
        `${SPOTIFY_API_ENDPOINT}/me/player/pause?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("Resposta de pausa:", response.status);

      if (!response.ok) {
        if (response.status === 401) {
          console.log("Token expirado (401), removendo token");
          await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
          setAccessToken(null);
          throw new Error("Sessão expirada. Por favor, faça login novamente.");
        }

        if (response.status === 403) {
          throw new Error(
            "Este usuário não tem uma assinatura Premium do Spotify, necessária para controlar a reprodução."
          );
        }

        if (response.status === 404) {
          throw new Error("Nenhum player ativo encontrado para pausar.");
        }

        throw new Error(
          `Não foi possível pausar a reprodução: ${response.status}`
        );
      }

      console.log("Reprodução pausada com sucesso");
      setCurrentPlaylist(null);
    } catch (err) {
      console.error("Erro ao pausar:", err);
      setError(`Erro ao pausar: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // Renderizar item da playlist
  const renderPlaylistItem = ({ item }) => (
    <TouchableOpacity
      style={styles.playlistItem}
      onPress={() => playPlaylist(item)}
    >
      {item.images && item.images[0] && (
        <Image
          source={{ uri: item.images[0].url }}
          style={styles.playlistImage}
        />
      )}
      <View style={styles.playlistInfo}>
        <Text style={styles.playlistName}>{item.name}</Text>
        <Text style={styles.playlistDesc} numberOfLines={1}>
          {item.description || `Por ${item.owner?.display_name || "Spotify"}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
  function handlePress() {
    try {
      console.log("Botão do Spotify pressionado");
      if (currentPlaylist) {
        console.log("Tentando pausar playback");
        pausePlayback();
      } else {
        console.log("Tentando iniciar autenticação");
        authenticate();
      }
    } catch (error) {
      console.error("Erro ao manipular clique no botão:", error);
      setError(`Ocorreu um erro: ${error.message}`);
    }
  }

  return (
    <>
      {" "}
      <TouchableOpacity
        style={styles.spotifyButton}
        onPress={handlePress}
        activeOpacity={0.7}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : currentPlaylist ? (
          <PauseCircleIcon />
        ) : (
          <MusicIcon />
        )}
        <Text style={styles.buttonText}>
          {loading
            ? "Processando..."
            : currentPlaylist
            ? `Pausar: ${currentPlaylist.name}`
            : "Tocar Música"}
        </Text>
      </TouchableOpacity>
      {error && (
        <TouchableOpacity
          style={styles.retryButtonSmall}
          onPress={() => {
            setError(null);
            authenticate();
          }}
        >
          <Text style={styles.retryTextSmall}>Tentar novamente</Text>
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
              <Text style={styles.title}>Playlists para Foco</Text>
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
                <Text style={styles.loadingText}>Carregando playlists...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={authenticate}
                >
                  <Text style={styles.retryText}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={playlists}
                keyExtractor={(item) => item.id}
                renderItem={renderPlaylistItem}
                contentContainerStyle={styles.listContainer}
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  spotifyButton: {
    backgroundColor: "#1DB954", // Cor do Spotify
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
    marginBottom: 16,
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
  retryButtonSmall: {
    backgroundColor: "#1DB954",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginTop: 8,
    alignSelf: "center",
  },
  retryTextSmall: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  listContainer: {
    padding: 16,
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#144480",
  },
  playlistImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 12,
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  playlistDesc: {
    color: "#98A0A8",
    fontSize: 14,
  },
});
