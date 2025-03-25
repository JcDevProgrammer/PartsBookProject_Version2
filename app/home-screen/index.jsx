import React, { useEffect, useRef } from "react";
import {
  Animated,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const openURL = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        alert("Cannot open URL: " + url);
      }
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  };

  return (
    <LinearGradient
      colors={["#e0eafc", "#cfdef3"]}
      style={styles.gradientContainer}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={require("../../assets/icons/back.png")}
              style={styles.headerIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Home</Text>
          <View style={{ width: 25, height: 25 }} />
        </View>

        {}
        <Animated.View
          style={[
            styles.body,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {}
          <Image
            source={require("../../assets/images/kimura-chaves-logo.png")}
            style={styles.bannerImage}
            resizeMode="contain"
          />

          {}
          <Text style={styles.welcomeText}>
            Welcome to Kimura Chaves Enterprise Inc.
          </Text>

          {}
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              openURL("https://www.facebook.com/kimurachavesenterpriseinc")
            }
          >
            <Text style={styles.buttonText}>Visit Our Facebook Page</Text>
          </TouchableOpacity>

          {}
          <TouchableOpacity
            style={styles.button}
            onPress={() => openURL("https://kceisewing.com/")}
          >
            <Text style={styles.buttonText}>Visit Our Website</Text>
          </TouchableOpacity>

          {}
          <View style={styles.section}>
            <Image
              source={require("../../assets/images/about-us.jpg")}
              style={styles.sectionImage}
              resizeMode="contain"
            />
            <Text style={styles.sectionTitle}>ABOUT US</Text>
            <Text style={styles.sectionContent}>
              We firmly believe that any garment or sewing project has the
              potential to achieve world-class quality. Whether you're a
              business or a home user, we're here to help you achieve that.
              {"\n\n"}
              We do this by starting each interaction with an in-depth
              consultation regarding your sewing needs. This guides us in
              creating smart solutions by suggesting only the best tools
              available. We further support you through our after-sales care and
              seminars for clients.
              {"\n\n"}
              At KCEI, your success is our success.
            </Text>
          </View>

          {}
          <View style={styles.section}>
            <Image
              source={require("../../assets/images/contact-us.png")}
              style={styles.sectionImage}
              resizeMode="contain"
            />
            <Text style={styles.sectionTitle}>CONTACT US</Text>
            <Text style={styles.sectionContent}>
              For inquiries, support, or further information, please reach out
              to us: {"\n\n"}
              <Text style={styles.sectionTitle1}>Metro Manila</Text>
              {"\n\n"}Email: kimurachaves1978@gmail.com
              {"\n"}Phone: +63 723 0241 to 43
              {"\n"}[Smart] +63 908 254 2709
              {"\n"}[Globe] +63 926 717 7768
              {"\n"}Address: 284-C Doña Anita Bldg., E. Rodriguez Sr. Ave.,
              Quezon City, Metro Manila
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    paddingBottom: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#283593",
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 10,
    justifyContent: "space-between",
    width: "100%",
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
  body: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 0,
  },
  bannerImage: {
    width: "100%",
    maxWidth: 900,
    height: Platform.OS === "web" ? 150 : 200,
    borderRadius: 0,
    marginTop: 0,
    marginBottom: 5,
  },
  welcomeText: {
    fontSize: Platform.OS === "web" ? 22 : 18,
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#283593",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 15,
    width: Platform.OS === "web" ? "25%" : "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: Platform.OS === "web" ? 16 : 16,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
    width: Platform.OS === "web" ? "60%" : "90%",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: Platform.OS === "web" ? 20 : 21,
    color: "#283593",
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 6,
    textAlign: "center",
  },
  sectionTitle1: {
    fontSize: Platform.OS === "web" ? 18 : 18,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 6,
  },
  sectionContent: {
    fontSize: Platform.OS === "web" ? 16 : 15,
    color: "#333",
    lineHeight: 20,
    textAlign: "justify",
    marginBottom: 6,
    paddingHorizontal: 10,
  },
  sectionImage: {
    width: "100%",
    maxWidth: 900,

    height: Platform.OS === "web" ? 350 : 300,
    borderRadius: 8,
    marginBottom: 8,
    alignSelf: "justify",
  },
});
