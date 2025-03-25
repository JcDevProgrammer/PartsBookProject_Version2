import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";

export default function InformationScreen() {
  const router = useRouter();

  const infoItems = [
    { id: "1", title: "Tutorial" },
    { id: "2", title: "Version" },
    { id: "3", title: "License" },
    { id: "4", title: "Clear cache" },
    { id: "5", title: "Pre-load" },
    { id: "6", title: "End user license agreement" },
    { id: "7", title: "Privacy Policy" },
  ];

  return (
    <View style={styles.container}>
      {}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require("../../assets/icons/back.png")}
            style={styles.headerIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Information</Text>
        {}
        <View style={{ width: 25, height: 25 }} />
      </View>

      {}
      <FlatList
        data={infoItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item}>
            <Text style={styles.itemText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDEDED",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#283593",
    paddingVertical: 20,
    paddingHorizontal: 10,
    justifyContent: "space-between",
  },
  headerIcon: {
    width: 25,
    height: 25,
    tintColor: "#fff",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  item: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#EDEDED",
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
});
