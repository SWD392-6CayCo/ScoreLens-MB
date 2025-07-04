import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function Match() {
    const [scoreA, setScoreA] = useState(0);
    const [scoreB, setScoreB] = useState(1);

    const [shots, setShots] = useState([
        { time: "18:58", shotNumber: 27, player: "PLAYER 1", result: "SCORED" },
        { time: "19:00", shotNumber: 28, player: "PLAYER 2", result: "MISSED" },
        { time: "19:04", shotNumber: 29, player: "PLAYER 1", result: "MISSED" },
    ]);

    const [fontsLoaded] = useFonts({
        BebasNeue: require("../../assets/fonts/BebasNeue-Regular.ttf"),
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
                    source={require("../../assets/images/logo.png")}
                    style={{
                        width: 80,
                        height: 80,
                    }}
                />
                <View>
                    <Text style={styles.tableInfo}>TABLE: 01</Text>
                    <Text style={styles.rateInfo}>rate to: 03</Text>
                </View>

                <Text style={styles.roundInfo}>ROUND 01</Text>
            </View>

            {/* Teams and Scores */}
            <View style={styles.teamsContainer}>
                <View style={styles.row}>
                    {/* Team A + Player 1 (3 cols) */}
                    <View style={styles.colA}>
                        <View style={styles.teamHeader}>
                            <Text style={styles.teamName}>TEAM A</Text>
                        </View>
                        <Text style={styles.playerLabel}>PLAYER 1</Text>
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
                        <View style={styles.teamHeader}>
                            <Text style={styles.teamName}>TEAM B</Text>
                        </View>
                        <Text style={styles.playerLabel}>PLAYER 2</Text>
                    </View>
                </View>
            </View>

            {/* Shot History */}
            <View style={styles.shotHistory}>
                {shots.map((shot, index) => (
                    <View key={index} style={styles.shotRow}>
                        <Text style={styles.shotTime}>{shot.time}</Text>
                        <Text style={styles.shotNumber}>SHOT #{shot.shotNumber}</Text>
                        <Text style={styles.shotPlayer}>{shot.player}</Text>
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
        color: "white",
        fontSize: 35,
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
        fontSize: 200,
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
        textAlign: "right"
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
}); 