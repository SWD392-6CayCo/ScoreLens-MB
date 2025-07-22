/* eslint-disable react-hooks/exhaustive-deps */
import webSocketService from "@/app/services/webSocketService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Modal, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";

type Player = {
  name: string;
  id: number;
};

type Team = {
  teamName: string;
  players: Player[];
};

type MatchInfo = {
  raceTo: number;
  totalSet: number;
  teams: Team[];
};
export default function Match() {
  const router = useRouter();

  const [matchData, setMatchData] = useState<MatchInfo | null>(null);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [round, setRound] = useState(1);
  const [shots, setShots] = useState<Shot[]>([]);

  // Add modal state
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winnerData, setWinnerData] = useState<any>(null);

  type Shot = {
    time: string;
    shot: number;
    player: string;
    result: string;
  };

  const [fontsLoaded] = useFonts({
    BebasNeue: require("../assets/fonts/BebasNeue-Regular.ttf"),
  });

  function parseMatchInfo(raw: any): MatchInfo {
    const raceTo = raw?.sets?.[0]?.raceTo ?? null;
    const totalSet = raw?.totalSet ?? null;

    const teams: Team[] =
      raw?.teams?.map((team: any) => ({
        teamName: team?.name ?? "",
        players:
          team?.players?.map((player: any) => ({
            id: player?.playerID ?? 0,
            name: player?.name ?? "",
          })) ?? [],
      })) ?? [];

    return {
      raceTo,
      totalSet,
      teams,
    };
  }

  function getPlayerName(playerString: string): string {
    const playerIdMatch = playerString.match(/PLAYER (\d+)/);

    if (playerIdMatch && matchData?.teams) {
      const playerId = parseInt(playerIdMatch[1]);

      for (const team of matchData.teams) {
        const player = team.players.find((p) => p.id === playerId);
        if (player) {
          return player.name;
        }
      }
    }

    return playerString;
  }

  useEffect(() => {
    const loadMatchData = async () => {
      try {
        const data = await AsyncStorage.getItem("matchData");
        if (data) {
          const matchInfo = parseMatchInfo(JSON.parse(data));
          setMatchData(matchInfo);
        }
        console.log("Match data loaded:", matchData);
      } catch (error) {
        console.error("Error loading match data:", error);
      }
    };

    loadMatchData();
  }, []);

  useEffect(() => {
    if (!matchData) return;
    const topicShot = "/topic/shot_event/23374e21-2391-41b0-b275-651df88b3b04";
    const topicMatch =
      "/topic/match_event/23374e21-2391-41b0-b275-651df88b3b04";

    if (webSocketService.isConnected) {
      console.log("✅ Already connected, subscribing immediately");
      webSocketService.subscribe(topicShot, (message) => {
        console.log("📨 Shot Event Message:", message);
        setShots((prevShots) => {
          const updatedShots = [...prevShots, message?.data];
          return updatedShots.length > 5 ? updatedShots.slice(1) : updatedShots;
        });
      });

      webSocketService.subscribe(topicMatch, (message) => {
        console.log("📨 Match Event Message:", message);
        if (message.code === "WINNING_SET") {
          //Nofi winner
          Toast.show({
            type: "success",
            text1: "🏆 Set Winner!",
            text2: message.data,
            position: "top",
            topOffset: 50,
            visibilityTime: 4000,
          });

          if (message.data?.includes(matchData?.teams?.[0]?.teamName)) {
            setScoreA((prev) => prev + 1);
          } else if (message.data?.includes(matchData?.teams?.[1]?.teamName)) {
            setScoreB((prev) => prev + 1);
          }
          setRound((prevRound) => {
            if (prevRound < matchData.totalSet) {
              return prevRound + 1;
            }
            return prevRound;
          });
        } else if (message.code === "WINNING_MATCH") {
          // Show winner modal
          setWinnerData(message?.data);
          setShowWinnerModal(true);
        }
      });
    } else {
      console.log("🔄 Connecting to WebSocket...");
      webSocketService.connect(() => {
        console.log("✅ Connected, now subscribing to:", topicShot);
        webSocketService.subscribe(topicShot, (message) => {
          console.log("📨 Shot Event Message:", message);
        });
      });

      webSocketService.subscribe(topicMatch, (message) => {
        console.log("📨 Match Event Message:", message);
        if (message.code === "WINNING_SET") {
          //Nofi winner
          Toast.show({
            type: "success",
            text1: "🏆 Set Winner!",
            text2: message.data,
            position: "top",
            topOffset: 50,
            visibilityTime: 4000,
          });

          if (message.data?.includes(matchData?.teams?.[0]?.teamName)) {
            setScoreA((prev) => prev + 1);
          } else if (message.data?.includes(matchData?.teams?.[1]?.teamName)) {
            setScoreB((prev) => prev + 1);
          }
          setRound((prevRound) => {
            if (prevRound < matchData.totalSet) {
              return prevRound + 1;
            }
            return prevRound;
          });
        }
      });
    }

    return () => {
      console.log("🧹 Unsubscribing from:", topicShot);
      webSocketService.unsubscribe(topicShot);
      webSocketService.unsubscribe(topicMatch);
    };
  }, [matchData]);

  // Function to close modal and navigate
  const closeWinnerModal = () => {
    setShowWinnerModal(false);
    setWinnerData(null);
    AsyncStorage.removeItem("matchData");
    setMatchData(null);
    setScoreA(0);
    setScoreB(0);
    setRound(1);
    setShots([]);
    router.push("/");
  };

  useEffect(() => {
    if (showWinnerModal) {
      const timer = setTimeout(() => {
        closeWinnerModal();
      }, 60000); // 60 seconds

      return () => clearTimeout(timer);
    }
  }, [showWinnerModal]);

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
        <View>
          <Text style={styles.tableInfo}>TABLE: RVII</Text>
          <Text style={styles.rateInfo}>race to: 0{matchData?.raceTo}</Text>
        </View>

        <Text style={styles.roundInfo}>
          ROUND 0{round}/0{matchData?.totalSet}
        </Text>
      </View>

      {/* Teams and Scores */}
      <View style={styles.teamsContainer}>
        <View style={styles.row}>
          {/* Team A + Player 1 (3 cols) */}
          <View style={styles.colA}>
            {matchData?.teams?.[0] && (
              <>
                <View style={styles.teamHeader}>
                  <Text style={styles.teamName}>
                    {matchData?.teams?.[0]?.teamName}
                  </Text>
                </View>
                <Text style={styles.playerLabel}>
                  {matchData?.teams?.[0]?.players?.[0].name}
                </Text>
              </>
            )}
          </View>

          {/* Score A (3 cols) */}
          <View style={styles.colScore}>
            <Text style={styles.score}>{scoreA}</Text>
          </View>

          {/* Vertical Divider */}
          <View style={styles.verticalDivider} />

          {/* Score B (3 cols) */}
          <View style={styles.colScore}>
            <Text style={styles.score}>{scoreB}</Text>
          </View>

          {/* Team B + Player 2 (3 cols) */}
          <View style={styles.colB}>
            {matchData?.teams?.[1] && (
              <>
                <View style={styles.teamHeader}>
                  <Text style={styles.teamName}>
                    {matchData?.teams?.[1]?.teamName}
                  </Text>
                </View>
                <Text style={styles.playerLabel}>
                  {matchData?.teams?.[1]?.players?.[0].name}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Shot History */}
      <View style={styles.shotHistory}>
        {shots.map((shot, index) => (
          <View key={index} style={styles.shotRow}>
            <Text style={styles.shotTime}>
              {shot.time?.split(".")[0] || shot.time}
            </Text>
            <Text
              style={[
                styles.shotNumber,
                shot.result === "SCORED" ? styles.scored : styles.missed,
              ]}
            >
              {shot.shot}
            </Text>
            <Text style={styles.shotPlayer}>{getPlayerName(shot.player)}</Text>
            <Text
              style={[
                styles.shotResult,
                shot.result === "SCORED" ? styles.scored : styles.missed,
              ]}
            >
              {shot.result}
            </Text>
          </View>
        ))}
      </View>

      {/* Winner Modal */}
      <Modal
        visible={showWinnerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeWinnerModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🏆 MATCH WINNER! 🏆</Text>
            {winnerData && (scoreA > scoreB) ? (
              <Text style={styles.winnerText}>
                {matchData?.teams?.[0]?.teamName} win this match!
              </Text>
            ) : (
              <Text style={styles.winnerText}>
                {matchData?.teams?.[1]?.teamName} win this match!
              </Text>
            )}
            <Text style={styles.finalScoreText}>
              {scoreA} - {scoreB}
            </Text>
          </View>
        </View>
      </Modal>
      <Toast />
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
  },
  tableInfo: {
    textAlign: "center",
    color: "white",
    fontSize: 45,
    fontWeight: "600",
    fontFamily: "BebasNeue",
    letterSpacing: 1,
  },
  rateInfo: {
    textAlign: "center",
    color: "rgba(255,255,255,0.9)",
    fontSize: 30,
    fontWeight: "600",
    letterSpacing: 1,
    fontFamily: "BebasNeue",
  },
  roundInfo: {
    color: "black",
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "BebasNeue",
    letterSpacing: 1,
  },
  teamsContainer: {
    marginVertical: 20,
  },
  colA: {
    flex: 1,
    height: "100%",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  colB: {
    flex: 1,
    height: "100%",
    alignItems: "flex-end",
    justifyContent: "flex-start",
  },
  colScore: {
    flex: 4,
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "BebasNeue",
  },
  verticalDivider: {
    width: 2,
    height: 200,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  teamHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  teamName: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  playerLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
  },
  score: {
    color: "white",
    fontSize: 210,
    marginTop: -50,
    fontWeight: "bold",
  },
  divider: {
    width: 2,
    height: 200,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  shotHistory: {
    flex: 1,
    backgroundColor: "rgba(255,255,255, 0.47)",
    borderRadius: 10,
    padding: 12,
    width: "60%",
    justifyContent: "flex-start",
    alignSelf: "center",
    gap: 10,
  },
  shotRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  shotTime: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
    fontFamily: "BebasNeue",
  },
  shotNumber: {
    color: "#1F7D53",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "left",
    flex: 1,
  },
  shotPlayer: {
    color: "black",
    fontSize: 14,
    flex: 1,
    fontWeight: "bold",
    textAlign: "right",
  },
  shotResult: {
    fontSize: 14,
    fontWeight: "bold",
    flex: 1,
    textAlign: "right",
  },
  scored: {
    color: "#1F7D53",
  },
  missed: {
    color: "#B01212",
  },
  connectionStatus: {
    marginTop: 10,
    alignItems: "center",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "#FF0000",
    fontSize: 14,
    marginTop: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    minWidth: 300,
    maxWidth: "90%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F7D53",
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "BebasNeue",
  },
  winnerText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#F5A623",
    marginBottom: 15,
    textAlign: "center",
    fontFamily: "BebasNeue",
  },
  finalScoreText: {
    fontSize: 30,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  winnerDetails: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  countdownText: {
    fontSize: 14,
    color: "#999",
    marginBottom: 15,
    textAlign: "center",
    fontStyle: "italic",
  },
  closeButton: {
    backgroundColor: "#1F7D53",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 10,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
