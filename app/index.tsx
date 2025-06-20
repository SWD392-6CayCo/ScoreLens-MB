import { LinearGradient } from "expo-linear-gradient";
import { Image, StyleSheet, Text, View } from "react-native";
import { useFonts } from "expo-font";

export default function Index() {

   const [fontsLoaded] = useFonts({
    "BebasNeue": require("../assets/fonts/BebasNeue-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient
      colors={["#1F7D53", "#F5A623"]}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={styles.wrapper}
    >
      <View style={styles.row}>
        <Image
          source={require("../assets/images/logo.png")}
          style={{
            width: 80,
            height: 80,
          }}
        />
          <Text style={styles.tableInfo}>TABLE: 01</Text>
          <Text style={styles.roundInfo}>ROUND 01</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  tableInfo: {
    textAlign: "center",
    color: "white",
    fontSize: 40,
    fontWeight: "600",
    fontFamily: "BebasNeue",
    letterSpacing: 1,
  },
  roundInfo: {
    color: "white",
    fontSize: 35,
    fontWeight: "600",
    fontFamily: "BebasNeue",
    letterSpacing: 1,
  },
});
