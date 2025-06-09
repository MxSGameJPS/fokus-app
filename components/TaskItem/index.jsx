import { Pressable, StyleSheet, Text, View } from "react-native";
import { IconDelete, IconEdit, PlayIcon } from "../Icons";
import { router } from 'expo-router';

export default function TaskItem({
  completed,
  text,
  onToggleCompleted,
  onPressEdit,
  onPressDelete,
  dias,
  tempo,
}) {
  const containerStyle = [style.container];

  // Função para converter o tempo da tarefa em segundos para o pomodoro
  const converterTempoParaSegundos = (tempoInput) => {
    // console.log("Convertendo tempo:", tempoInput);
    
    // Se não existir valor, retorna o padrão (25 minutos)
    if (!tempoInput) {
      // console.log("Tempo não fornecido, usando padrão de 25 minutos");
      return 25 * 60; // 25 minutos
    }

    // Se for um número sem ":" (ex: "30" para 30 minutos)
    if (typeof tempoInput === "string" && !tempoInput.includes(":")) {
      const minutos = parseInt(tempoInput, 10);
      if (!isNaN(minutos)) {
        const segundos = minutos * 60;
        // console.log(`Convertido "${tempoInput}" para ${segundos} segundos`);
        return segundos; // Converter minutos para segundos
      }
    }

    // Se for uma string no formato MM:SS
    if (typeof tempoInput === "string" && tempoInput.includes(":")) {
      const partes = tempoInput.split(":");
      if (partes.length === 2) {
        const minutos = parseInt(partes[0], 10) || 0;
        const segundos = parseInt(partes[1], 10) || 0;
        const totalSegundos = (minutos * 60) + segundos;
        // console.log(`Convertido "${tempoInput}" para ${totalSegundos} segundos`);
        return totalSegundos;
      }
    }

    // Se for um número (segundos)
    if (typeof tempoInput === "number") {
      // console.log(`Usando valor numérico: ${tempoInput} segundos`);
      return tempoInput;
    }

    // Padrão: 25 minutos
    // console.log("Usando valor padrão: 1500 segundos (25 minutos)");
    return 25 * 60;
  };

  const iniciarPomodoro = () => {
  const tempoEmSegundos = converterTempoParaSegundos(tempo);
  // console.log("Iniciando pomodoro com tempo:", tempoEmSegundos, "segundos");
  
  // Navegando para a página do pomodoro com o tempo personalizado
  // e um parâmetro para iniciar automaticamente
  router.push({
    pathname: "/pomodoro",
    params: { 
      tempoPersonalizado: tempoEmSegundos,
      nomeTarefa: text,
      autoStart: 'true'  // Adicione este parâmetro
    }
  });
};

  const formatarTempo = (tempoInput) => {
    // Se não existir valor, retorna um padrão
    if (!tempoInput) {
      return "00:00";
    }

    // Se for um número sem ":"
    if (typeof tempoInput === "string" && !tempoInput.includes(":")) {
      // Interprete como minutos
      const minutos = parseInt(tempoInput, 10);
      if (!isNaN(minutos)) {
        return `${minutos < 10 ? "0" + minutos : minutos}:00`;
      }
    }

    // Se for uma string no formato MM:SS (como "30:15")
    if (typeof tempoInput === "string" && tempoInput.includes(":")) {
      const partes = tempoInput.split(":");
      if (partes.length === 2) {
        const minutos = partes[0].padStart(2, "0");
        const segundos = partes[1].padStart(2, "0");
        return `${minutos}:${segundos}`;
      }
    }

    // Se for um número (segundos)
    if (typeof tempoInput === "number") {
      const minutos = Math.floor(tempoInput / 60);
      const segundosRestantes = tempoInput % 60;

      const minutosFormatados = minutos < 10 ? `0${minutos}` : minutos;
      const segundosFormatados =
        segundosRestantes < 10 ? `0${segundosRestantes}` : segundosRestantes;

      return `${minutosFormatados}:${segundosFormatados}`;
    }

    // Caso não seja possível formatar, retorna um valor padrão
    return "00:00";
  };

  const tempoFormatado = formatarTempo(tempo);

  if (completed) {
    containerStyle.push(style.completed);
  }

  // console.log("TaskItem - Tempo original:", tempo);
  // console.log("TaskItem - Tempo formatado:", tempoFormatado);
  return (
    <View style={containerStyle}>
      <View style={style.containerText}>
        <Text style={style.text}>{text}</Text>
        <Text style={style.text}>Dias : {dias}</Text>
        <Text style={style.text}>Tempo : {tempoFormatado}</Text>
        <View style={style.containerButton}>
          <Pressable style={style.botao}>
            <PlayIcon />
            <Text style={style.botaoTextComeçar} onPress={iniciarPomodoro}>Começar</Text>
          </Pressable>
          <Pressable style={style.botaoFinal} onPress={onToggleCompleted}>
            <Text style={style.botaoText}>Finalizar</Text>
          </Pressable>
        </View>
      </View>
      <View></View>
      <View></View>
      <View></View>
      <View></View>
      <View style={style.containerIcon}>
        <View style={style.Icon}>
          <Pressable onPress={onPressEdit} style={style.iconButton}>
            <IconEdit />
          </Pressable>
          <Pressable onPress={onPressDelete} style={style.iconButton}>
            <IconDelete />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#98A0A8",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingVertical: 8,
    paddingLeft: 11,
    paddingRight: 11,
    width: "100%",
  },
  containerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  containerText: {
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    gap: 8,
  },
  completed: {
    backgroundColor: "#0F725C",
  },
  containerIcon: {
    alignItems: "center",
    justifyContent: "flex-end",
    width: 10,
  },
  Icon: {
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 5,
    paddingTop: 45,
  },
  text: {
    fontSize: 18,
    fontWeight: "600",
    color: "#021123",
    flexWrap: "wrap",
  },
  iconButton: {
    padding: 5,
  },
  botao: {
    backgroundColor: "#0F725C",
    padding: 8,
    borderRadius: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "110",
  },
  botaoFinal: {
    backgroundColor: "#021123",
    padding: 8,
    borderRadius: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    width: "110",
    justifyContent: "center",
  },
  botaoText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  botaoTextComeçar: {
    color: "#021123",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});
