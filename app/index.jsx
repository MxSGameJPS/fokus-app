import { Link } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View style={style.container}>
      <Image source={require("./Fokus.png")} />
      <View style={style.containerText}>
        <Text style={style.textFino}>Otimize sua produtividade,</Text>
        <Text style={style.textBold}>mergulhe no que importa</Text>
      </View>
      <View>
        <Image style={style.containerImage} source={require("./inicial.png")} />
      </View>
      <View style={style.containerBotton}>
        <Link style={style.link} href={{ pathname: "/pomodoro" }}>Quero Iniciar</Link>
      </View>
      <View style={style.footer}>
        <Text style={style.footerText}>Desenvolvido por</Text>
        <Text style={style.footerText}>Saulo Pavanello</Text>
      </View>
    </View>
  ); // This is the root component, no content needed here
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#021123",
    padding: 40,
    gap: 40,
  },
  containerText: {
    flex: 1,
    gap: 10,
  },
  containerImage: {
    width: 300,
    height: 300,
  },
  containerBotton: {
    width: 264,
    height: 60,
    backgroundColor: "#B872FF",
    borderRadius: 32, 
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  textFino: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "200",
    lineHeight: 39,
    textAlign: "center",
  },
  textBold: {
    fontSize: 28,
    textAlign: "center",
    color: "#fff",
    fontWeight: "700",
    lineHeight: 39,
  },  
  link : {
    color: "#021123",
    fontSize: 18,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
  },
  footer : {
    width: "80%",
  },
  footerText: {
    color: "#98A0A8",
    textAlign: "center",
    fontSize: 13,
    fontWeight: "400",
  },
});
