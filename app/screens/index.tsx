import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useStomp } from "../hooks/useStomp";
import { useSubscription } from "../hooks/useSubscription";

export default function Index() {
  const baseUrl = process.env.EXPO_PUBLIC_API_ENDPOINT;
  const router = useRouter();
  const [qrUrl, setQrUrl] = useState("");
  const { client, isConnected } = useStomp();
  const [fontsLoaded] = useFonts({
    BebasNeue: require("../../assets/fonts/BebasNeue-Regular.ttf"),
  });

  const tableId = "23374e21-2391-41b0-b275-651df88b3b04";

  useSubscription(client, isConnected, '/topic/shot_event', (msg) => {
    console.log('Received shot event:', msg);
    // setShot(msg);
  });

  useEffect(() => {
    if (!baseUrl) {
      console.error("API_ENDPOINT environment variable is not set");
      return;
    }

    fetch(`${baseUrl}tables/${tableId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setQrUrl(data.data.qrCode);
      })
      .catch((error) => {
        console.error("Failed to fetch table data:", error);
      });
  }, [baseUrl]);

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
      <View style={styles.header}>
        <Image
          source={require("../../assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.title}>SCORE LENS</Text>
      </View>

      <View style={styles.qrContainer}>
        <View style={styles.qrFrame}>
          <View style={styles.qrPlaceholder}>
            <Image
              source={{ uri: qrUrl || "" }}
              style={styles.qrImage}
            />
          </View>
        </View>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Scan this QR code to start the match
        </Text>
        <Text style={styles.instructionSubtext}>
          Hope you have a great match and enjoy the game!
        </Text>
      </View>

      <TouchableOpacity onPress={() => {
        router.push("/screens/match");
      }}>
        <Text>Start Match</Text>
      </TouchableOpacity>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 15,
  },
  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "600",
    fontFamily: "BebasNeue",
    letterSpacing: 1,
  },
  qrContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  qrFrame: {
    width: 280,
    height: 280,
    borderWidth: 3,
    borderColor: "white",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  qrPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  qrImage: {
    width: 260,
    height: 260,
    borderRadius: 10,
  },
  instructions: {
    alignItems: "center",
    marginBottom: 40,
  },
  instructionText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  instructionSubtext: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    textAlign: "center",
  },
});
