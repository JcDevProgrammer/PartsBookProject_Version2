import React from "react";
import { View, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";

export default function PdfViewer() {
  const { url } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      {!url ? (
        <WebView
          source={{ html: "<h1>No PDF URL provided</h1>" }}
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <WebView source={{ uri: url }} style={{ flex: 1 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EDEDED" },
});
