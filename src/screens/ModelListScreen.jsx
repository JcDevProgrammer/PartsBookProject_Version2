import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  TextInput,
  Alert,
  Platform,
  Modal,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import { encode } from "base-64";
import Constants from "expo-constants";
import PdfViewer from "../../components/PdfViewer";

const API_KEY = "AIzaSyBQyrQ7B9pgfT_G6FWXmGGF3WJflROQwCU";
const BASE_FOLDER_ID = "199DuYp35mYFnhUH4lpnIgBxZ-65Tclv_";
const BASE_URL = "https://www.googleapis.com/drive/v3";

async function getDriveItems(folderId, pageToken = null) {
  try {
    const params = {
      q: `'${folderId}' in parents`,
      key: API_KEY,
      fields:
        "nextPageToken, files(id, name, mimeType, webContentLink, webViewLink)",
      pageSize: 1000,
    };
    if (pageToken) params.pageToken = pageToken;
    const response = await axios.get(`${BASE_URL}/files`, { params });
    return {
      files: response.data.files || [],
      nextPageToken: response.data.nextPageToken || null,
    };
  } catch (error) {
    console.error("Error fetching Google Drive items:", error);
    return { files: [], nextPageToken: null };
  }
}

async function getTopLevelItems() {
  const { files } = await getDriveItems(BASE_FOLDER_ID, null);
  const folders = files.filter(
    (item) => item.mimeType === "application/vnd.google-apps.folder"
  );
  return folders.sort((a, b) => a.name.localeCompare(b.name));
}

function getFolderLogo(folderName) {
  return require("../../assets/icons/folder.png");
}

const qrLink =
  Constants.expoConfig?.extra?.qrLink || "https://your-app-download-link.com";

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 5000;
  for (let i = 0; i < bytes.byteLength; i += chunkSize) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
  }
  return encode(binary);
}

const FolderItem = React.memo(
  ({ item, isExpanded, onToggleFolder, onOpenFile }) => (
    <View style={styles.folderContainer}>
      <TouchableOpacity
        style={styles.folderRow}
        onPress={() => onToggleFolder(item)}
      >
        <View style={styles.folderHeader}>
          <Image source={getFolderLogo(item.name)} style={styles.brandLogo} />
          <Text style={styles.folderTitle}>{item.name}</Text>
          {item.children && item.children.length > 0 && (
            <Text style={styles.folderCount}>
              ({item.children.length} items)
            </Text>
          )}
        </View>
        <Image
          source={require("../../assets/icons/arrow.png")}
          style={[
            styles.arrowIcon,
            isExpanded && { transform: [{ rotate: "180deg" }] },
          ]}
        />
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.fileList}>
          {item.loading ? (
            <ActivityIndicator size="small" color="#283593" />
          ) : item.children && item.children.length > 0 ? (
            item.children
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((child) => (
                <TouchableOpacity
                  key={child.id}
                  style={styles.fileItem}
                  onPress={() => onOpenFile(child)}
                >
                  <View style={styles.fileRow}>
                    <Image
                      source={require("../../assets/icons/pdf.png")}
                      style={styles.pdfLogo}
                    />
                    <Text style={styles.fileName}>{child.name}</Text>
                  </View>
                </TouchableOpacity>
              ))
          ) : (
            <Text style={styles.noFilesText}>No files found.</Text>
          )}
        </View>
      )}
    </View>
  )
);

export default function ModelListScreen() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedFolder, setExpandedFolder] = useState(null);
  const [selectedPdfBase64, setSelectedPdfBase64] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showInfoMenu, setShowInfoMenu] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const pdfViewerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");

  // For smooth modal animation on mobile (QR Code modal)
  const [modalOpacity] = useState(new Animated.Value(0));

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(!!online);
    });
    if (isOnline) {
      loadTopLevelItems();
    } else {
      loadCachedItems();
    }
    return () => unsubscribe();
  }, [isOnline]);

  useEffect(() => {
    if (showAccessModal) {
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showAccessModal]);

  const loadTopLevelItems = async () => {
    setLoading(true);
    try {
      const driveItems = await getTopLevelItems();
      setItems(driveItems);
      await AsyncStorage.setItem(
        "@cachedDriveItems",
        JSON.stringify(driveItems)
      );
    } catch (error) {
      console.error("Error loading top-level items:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCachedItems = async () => {
    try {
      const cached = await AsyncStorage.getItem("@cachedDriveItems");
      if (cached) {
        setItems(JSON.parse(cached));
      }
    } catch (error) {
      console.error("Error loading cached drive items:", error);
    }
  };

  const fetchFolderChildren = async (folder) => {
    if (!isOnline) {
      Alert.alert("Offline", "Cannot fetch folder contents offline.");
      return;
    }
    try {
      folder.loading = true;
      setItems([...items]);
      const { files } = await getDriveItems(folder.id);
      folder.children = files.sort((a, b) => a.name.localeCompare(b.name));
      folder.loading = false;
      setItems([...items]);
    } catch (error) {
      console.error("Error fetching folder children:", error);
      folder.loading = false;
      setItems([...items]);
    }
  };

  const handleToggleFolder = async (folder) => {
    if (expandedFolder && expandedFolder.id === folder.id) {
      setExpandedFolder(null);
      return;
    }
    setExpandedFolder(folder);
    if (folder.mimeType === "application/vnd.google-apps.folder") {
      if (!folder.children) {
        await fetchFolderChildren(folder);
      }
    }
  };

  // Mobile branch: Gamit ang caching at downloadAsync para mapabilis ang pag-load ng PDF
  const handleOpenFile = async (file) => {
    if (!isOnline) {
      Alert.alert("Offline", "Cannot view PDF offline.");
      return;
    }
    if (Platform.OS === "web") {
      const viewerUrl = `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(
        file.webContentLink
      )}`;
      setSelectedPdfBase64(viewerUrl);
      return;
    }
    try {
      setIsDownloading(true);
      const fileUri = FileSystem.cacheDirectory + file.id + ".pdf";
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        const cachedData = await FileSystem.readAsStringAsync(fileUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setSelectedPdfBase64(cachedData);
      } else {
        const downloadRes = await FileSystem.downloadAsync(
          file.webContentLink,
          fileUri
        );
        const base64 = await FileSystem.readAsStringAsync(downloadRes.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setSelectedPdfBase64(base64);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to download PDF: " + error.message);
      console.error("Error downloading PDF:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Info", "Printing not supported on web in this snippet.");
    } else if (selectedPdfBase64) {
      try {
        const fileUri = FileSystem.cacheDirectory + "temp.pdf";
        await FileSystem.writeAsStringAsync(fileUri, selectedPdfBase64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await Print.printAsync({ uri: fileUri });
      } catch (error) {
        Alert.alert("Error", "Failed to print PDF: " + error.message);
      }
    }
  };

  const handleSearch = () => {
    if (Platform.OS !== "web" && pdfViewerRef.current) {
      pdfViewerRef.current.postMessage("focusSearch");
    } else {
      Alert.alert("Search", "Please use the browser's find (Ctrl+F) feature.");
    }
  };

  const toggleInfoMenu = () => setShowInfoMenu((prev) => !prev);
  const goToHome = () => {
    setShowInfoMenu(false);
    router.push("/home-screen");
  };

  const filteredData = useMemo(() => {
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  if (Platform.OS === "web" && selectedPdfBase64) {
    return (
      <View style={styles.viewerContainer}>
        <View style={styles.viewerHeader}>
          <TouchableOpacity onPress={() => setSelectedPdfBase64(null)}>
            <Image
              source={require("../../assets/icons/back.png")}
              style={styles.viewerIcon}
            />
          </TouchableOpacity>
          <Text style={styles.viewerTitle}>PDF Viewer</Text>
          <View style={styles.viewerActions}>
            <TouchableOpacity onPress={handlePrint}>
              <Image
                source={require("../../assets/icons/printer.png")}
                style={styles.viewerIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Search",
                  "Please use the browser's find (Ctrl+F) feature."
                )
              }
            >
              <Image
                source={require("../../assets/icons/search.png")}
                style={styles.viewerIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <PdfViewer ref={pdfViewerRef} uri={selectedPdfBase64} />
        </View>
      </View>
    );
  }

  if (selectedPdfBase64 && Platform.OS !== "web") {
    return (
      <View style={styles.viewerContainer}>
        <View style={styles.viewerHeader}>
          <TouchableOpacity onPress={() => setSelectedPdfBase64(null)}>
            <Image
              source={require("../../assets/icons/back.png")}
              style={styles.viewerIcon}
            />
          </TouchableOpacity>
          <Text style={styles.viewerTitle}>PDF Viewer</Text>
          <View style={styles.viewerActions}>
            <TouchableOpacity onPress={handlePrint}>
              <Image
                source={require("../../assets/icons/printer.png")}
                style={styles.viewerIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSearch}>
              <Image
                source={require("../../assets/icons/search.png")}
                style={styles.viewerIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <PdfViewer ref={pdfViewerRef} base64Data={selectedPdfBase64} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isDownloading && Platform.OS !== "web" && (
        <View style={styles.downloadOverlay}>
          <View style={styles.downloadBox}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.downloadText}>Downloading PDF...</Text>
          </View>
        </View>
      )}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={require("../../assets/icons/back.png")}
            style={styles.headerIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Please select a model</Text>
        <TouchableOpacity onPress={toggleInfoMenu}>
          <Image
            source={require("../../assets/icons/info.png")}
            style={styles.headerIcon}
          />
        </TouchableOpacity>
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
              setShowAccessModal(true);
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
        visible={showAccessModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAccessModal(false)}
      >
        <Animated.View
          style={[styles.modalContainer, { opacity: modalOpacity }]}
        >
          <View
            style={[
              styles.modalContent,
              { maxWidth: Platform.OS === "web" ? 600 : 500 },
            ]}
          >
            <Text
              style={[
                styles.qrHeader,
                { fontSize: Platform.OS === "web" ? 24 : 18 },
              ]}
            >
              Access on Mobile
            </Text>
            <Image
              source={require("../../assets/images/qr-code.png")}
              style={{
                width: Platform.OS === "web" ? 240 : 280,
                height: Platform.OS === "web" ? 240 : 280,
                resizeMode: "contain",
              }}
            />
            <Text
              style={[
                styles.qrDescription,
                { fontSize: Platform.OS === "web" ? 16 : 14 },
              ]}
            >
              Scan this QR code with your mobile device to quickly access our
              website and enjoy a seamless browsing experience on the go.
            </Text>
            <TouchableOpacity
              onPress={() => setShowAccessModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Modal>

      <View style={styles.searchContainer}>
        {!isOnline && (
          <Text style={{ color: "red", marginBottom: 5 }}>
            Offline mode. Showing cached data (if available).
          </Text>
        )}
        <TextInput
          style={styles.searchBar}
          placeholder="Search folder or PDF Name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#283593"
          style={{ marginTop: 20 }}
        />
      ) : filteredData.length > 0 ? (
        <FlatList
          data={filteredData.sort((a, b) => a.name.localeCompare(b.name))}
          keyExtractor={(item) => item.id}
          // Taasan ang initialNumToRender para agad makita lahat
          initialNumToRender={20}
          renderItem={({ item }) => (
            <FolderItem
              item={item}
              isExpanded={expandedFolder && expandedFolder.id === item.id}
              onToggleFolder={handleToggleFolder}
              onOpenFile={handleOpenFile}
            />
          )}
        />
      ) : (
        <View style={styles.noMatchContainer}>
          <Text style={styles.noMatchText}>
            {isOnline
              ? "No folders or PDFs match your search."
              : "No offline data available."}
          </Text>
        </View>
      )}
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
    paddingBottom: 20,
    paddingHorizontal: 12,
    justifyContent: "space-between",
  },
  headerIcon: { width: 25, height: 25, tintColor: "#fff" },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  infoMenu: {
    position: "absolute",
    top: 70,
    right: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    zIndex: 999,
    padding: 10,
  },
  infoMenuTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#283593",
  },
  infoMenuDescription: { fontSize: 12, color: "#666", marginBottom: 10 },
  infoMenuButton: { paddingVertical: 5 },
  infoMenuButtonText: {
    fontSize: 14,
    color: "#333",
    textDecorationLine: "underline",
  },
  searchContainer: { padding: 10, backgroundColor: "#EDEDED" },
  searchBar: {
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    fontSize: 16,
  },
  folderContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
  folderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  folderHeader: { flexDirection: "row", alignItems: "center", flexShrink: 1 },
  brandLogo: { width: 30, height: 30, marginRight: 10, resizeMode: "contain" },
  folderTitle: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
    flexShrink: 1,
    flexWrap: "wrap",
  },
  folderCount: { fontSize: 14, color: "#666", marginLeft: 8 },
  arrowIcon: { width: 20, height: 20, tintColor: "#333" },
  fileList: {
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  fileItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  fileRow: { flexDirection: "row", alignItems: "center" },
  pdfLogo: { width: 25, height: 25, marginRight: 12, resizeMode: "contain" },
  fileName: { fontSize: 16, color: "#283593", fontWeight: "600" },
  noFilesText: { fontSize: 14, color: "#666", fontStyle: "italic" },
  noMatchContainer: { marginTop: 40, alignItems: "center" },
  noMatchText: { fontSize: 16, color: "#666" },
  viewerContainer: { flex: 1, backgroundColor: "#EDEDED" },
  viewerHeader: {
    flexDirection: "row",
    backgroundColor: "#283593",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 12,
  },
  viewerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  viewerActions: { flexDirection: "row" },
  viewerIcon: { width: 25, height: 25, tintColor: "#fff", marginHorizontal: 8 },
  downloadOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 999,
    justifyContent: "center",
    alignItems: "center",
  },
  downloadBox: {
    backgroundColor: "#333",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  downloadText: { color: "#fff", marginTop: 10, fontSize: 16 },
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
  qrHeader: { fontWeight: "bold", color: "#283593", marginBottom: 15 },
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
