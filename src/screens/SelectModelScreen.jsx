import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Modal,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import QRCode from "react-native-qrcode-svg";
import Constants from "expo-constants";

const qrLink =
  Constants.expoConfig?.extra?.qrLink || "https://your-app-download-link.com";

export default function SelectModelScreen() {
  const router = useRouter();

  const [showInfoMenu, setShowInfoMenu] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  const toggleInfoMenu = () => setShowInfoMenu((prev) => !prev);

  const goToHome = () => {
    setShowInfoMenu(false);
    router.push("/home-screen");
  };

  const isWeb = Platform.OS === "web";

  return (
    <View style={styles.container}>
      {}
      <View style={styles.header}>
        <Image
          source={require("../../assets/icons/printer.png")}
          style={styles.headerIcon}
        />

        <TouchableOpacity
          onPress={() => router.push("/model-list")}
          style={styles.searchButton}
        >
          <Text style={styles.searchButtonText}>Please Select a Model</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleInfoMenu}>
          <Image
            source={require("../../assets/icons/info.png")}
            style={styles.headerIcon}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Text style={styles.bodyText}>
          No device currently selected, please select device.
        </Text>
      </View>

      {showInfoMenu && (
        <View style={styles.infoMenu}>
          <Text style={styles.infoMenuTitle}>
            @jcrice13/GT_ISM_PartsBookProject
          </Text>
          <Text style={styles.infoMenuDescription}>
            Build for internal distribution.
          </Text>
          <TouchableOpacity
            style={styles.infoMenuButton}
            onPress={() => {
              setShowInfoMenu(false);
              setShowQRCode(true);
            }}
          >
            <Text style={styles.infoMenuButtonText}>Download for Mobile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.infoMenuButton} onPress={goToHome}>
            <Text style={styles.infoMenuButtonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={showQRCode}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowQRCode(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { maxWidth: isWeb ? 600 : 500 }]}>
            <Text style={[styles.qrHeader, { fontSize: isWeb ? 24 : 18 }]}>
              Access on Mobile
            </Text>
            <QRCode value={qrLink} size={isWeb ? 240 : 280} />
            <Text style={[styles.qrDescription, { fontSize: isWeb ? 16 : 14 }]}>
              Scan this QR code with your mobile device to quickly access our
              website and enjoy a seamless browsing experience on the go.
            </Text>
            <TouchableOpacity
              onPress={() => setShowQRCode(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#EDEDED" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#283593",
    paddingTop: 20,
    paddingHorizontal: 10,
    paddingBottom: 20,
    justifyContent: "space-between",
  },
  headerIcon: {
    width: 25,
    height: 25,
    tintColor: "#fff",
  },
  searchButton: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  searchButtonText: { color: "#333", fontSize: 16 },
  body: { flex: 1, justifyContent: "center", alignItems: "center" },
  bodyText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginHorizontal: 20,
  },
  infoMenu: {
    position: "absolute",
    top: 80,
    right: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    width: 200,
  },
  infoMenuTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#283593",
  },
  infoMenuDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 10,
  },
  infoMenuButton: { paddingVertical: 5 },
  infoMenuButtonText: {
    fontSize: 14,
    color: "#333",
    textDecorationLine: "underline",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  qrHeader: {
    fontWeight: "bold",
    color: "#283593",
    marginBottom: 15,
  },
  qrDescription: {
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: "#283593",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  closeButtonText: { color: "#fff", fontSize: 14 },
});
