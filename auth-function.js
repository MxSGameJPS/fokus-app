// Função de autenticação melhorada para o componente botaoSpotify
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
      setAccessToken(savedToken);
      await fetchFocusPlaylists(savedToken);
      return;
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

    // Iniciar fluxo de autenticação com WebBrowser com tratamento de erros melhorado
    try {
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        REDIRECT_URI,
        {
          showInRecents: true,
          createTask: false,
        }
      );

      console.log("Resultado WebBrowser:", result.type);

      if (result.type === "success") {
        // Extrair o token de acesso da URL de redirecionamento
        const { url } = result;
        console.log("URL de retorno:", url);

        if (url.includes("error=")) {
          const errorMsg = url.split("error=")[1].split("&")[0];
          throw new Error(
            `Erro de autenticação Spotify: ${decodeURIComponent(errorMsg)}`
          );
        }

        if (!url.includes("access_token=")) {
          throw new Error("Token de acesso não encontrado na URL de retorno");
        }

        const accessToken = url.split("#access_token=")[1].split("&")[0];

        // Salvar o token para uso futuro
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
        setAccessToken(accessToken);

        // Buscar playlists de foco
        await fetchFocusPlaylists(accessToken);
      } else {
        console.log("Autenticação cancelada pelo usuário");
        setError("Autenticação cancelada ou falhou");
      }
    } catch (authError) {
      console.error("Erro durante autenticação WebBrowser:", authError);
      setError(`Falha na autenticação: ${authError.message}`);
    }
  } catch (err) {
    console.error("Erro geral de autenticação:", err);
    setError(`Erro na autenticação: ${err.message}`);
  } finally {
    setLoading(false);
  }
}
