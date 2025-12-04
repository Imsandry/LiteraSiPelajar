// app/(tabs)/map.tsx
import React from "react";
import { FontAwesome } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router } from "expo-router";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";

import { getDatabase, ref, remove } from "firebase/database";
import { getApps, initializeApp } from "firebase/app";

// === FIREBASE CONFIG ===
const firebaseConfig = {
  apiKey: "AIzaSyBK8bj5cMHhOf5IerajNRz9-utWr4fCMKo",
  authDomain: "literasipelajar-5ee61.firebaseapp.com",
  databaseURL: "https://literasipelajar-5ee61-default-rtdb.firebaseio.com",
  projectId: "literasipelajar-5ee61",
  storageBucket: "literasipelajar-5ee61.firebasestorage.app",
  messagingSenderId: "511909199846",
  appId: "1:511909199846:web:7653a76ca1fe0fcb35e027"
};

// Init Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);

// HTML Map
const webmap: any = require("../../assets/html/map.html");

export default function MapScreen() {
  const isWeb = Platform.OS === "web";

  // === DELETE FUNCTION (langsung hapus, bukan navigate) ===
  const deleteData = async (id: string) => {
    try {
      await remove(ref(db, `bookstores/${id}`));
      console.log("Deleted:", id);
    } catch (err) {
      console.log("Delete error:", err);
      Alert.alert("Error", "Gagal menghapus data.");
    }
  };

  const handleMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);

      // EDIT
      if (msg.type === "edit") {
        router.push(`/edit?id=${encodeURIComponent(msg.id)}`);
        return;
      }

      // DELETE
      if (msg.type === "delete") {
        Alert.alert(
          "Hapus Data",
          "Yakin ingin menghapus data ini?",
          [
            { text: "Batal", style: "cancel" },
            {
              text: "Hapus",
              style: "destructive",
              onPress: () => deleteData(msg.id),
            },
          ],
          { cancelable: true }
        );
        return;
      }
    } catch (e) {
      console.warn("Failed to parse message:", e);
    }
  };

  return (
    <View style={styles.container}>
      {isWeb ? (
        <iframe
          src={webmap as unknown as string}
          style={{ flex: 1, width: "100%", height: "100%", border: 0 }}
        />
      ) : (
        <WebView
          originWhitelist={["*"]}
          source={webmap}
          style={styles.webview}
          onMessage={handleMessage}
          allowFileAccess
          allowUniversalAccessFromFileURLs
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push("/create")}
        activeOpacity={0.85}
      >
        <FontAwesome name="plus" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: Constants.statusBarHeight },
  webview: { flex: 1 },
  fab: {
    position: "absolute",
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    right: 20,
    bottom: 20,
    backgroundColor: "#0275d8",
    borderRadius: 30,
    elevation: 8,
  },
});
