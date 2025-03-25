import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function VideoManualScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Video Manual Screen</Text>
      <Text>(Add your video manual content here!)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDEDED",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
