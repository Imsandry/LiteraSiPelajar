// app/edit.tsx - KODE LENGKAP YANG DIMODIFIKASI
import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Platform, // Import Platform
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ref, update, onValue, off } from "firebase/database";
import { db } from "./firebaseConfig";
import { WebView } from "react-native-webview"; // Import WebView
import Constants from "expo-constants"; // Import Constants

// Import HTML map edit (Asumsi file berada di lokasi ini)
const editMapHtml: any = require("../assets/html/edit-map.html");

export default function EditBookstoreScreen() {
  const params = useLocalSearchParams();
  const bookstoreId = String(params.id ?? "");
  const webViewRef = useRef<WebView>(null); // Ref untuk WebView

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // --- LOGIKA MEMUAT DATA AWAL ---
  useEffect(() => {
    if (!bookstoreId) {
      Alert.alert("Error", "ID Toko Buku tidak ditemukan.");
      router.back();
      return;
    }

    const bookstoreRef = ref(db, `bookstores/${bookstoreId}`);

    const callback = (snapshot: any) => {
      if (snapshot.exists && snapshot.exists()) {
        const data = snapshot.val();
        setName(data.name ?? "");
        setAddress(data.address ?? "");
        const initialLat = data.lat != null ? String(data.lat) : "";
        const initialLng = data.lng != null ? String(data.lng) : "";
        
        setLat(initialLat);
        setLng(initialLng);

        // Setelah data dimuat, kirim koordinat ke WebView (Map)
        if (webViewRef.current && initialLat && initialLng) {
          // Hanya kirim jika WebView sudah tersedia dan memiliki data lat/lng
          sendInitialLocationToWebview(initialLat, initialLng);
        }
      } else {
        Alert.alert("Error", "Data toko buku tidak ditemukan.");
        router.back();
      }
      setIsLoading(false);
    };

    onValue(bookstoreRef, callback, (err) => {
      console.error("Firebase onValue error:", err);
      Alert.alert("Error", "Gagal memuat data toko buku.");
      setIsLoading(false);
    });

    return () => {
      try {
        off(bookstoreRef, "value", callback);
      } catch (e) {
        // ignore
      }
    };
  }, [bookstoreId]);
  
  // --- LOGIKA MENGIRIM KOORDINAT KE WEBVIEW ---
  const sendInitialLocationToWebview = (initialLat: string, initialLng: string) => {
      const message = JSON.stringify({
          type: 'initialLocation',
          lat: initialLat,
          lng: initialLng,
      });

      // sendMessage adalah cara komunikasi dari RN ke WebView
      if (webViewRef.current) {
          // Menggunakan setTimeout karena terkadang WebView belum siap sepenuhnya
          setTimeout(() => {
             webViewRef.current?.postMessage(message);
          }, 1000); 
      }
  };

  // --- LOGIKA MENERIMA KOORDINAT DARI WEBVIEW ---
  const handleMapMessage = (event: any) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === "coordinates") {
        // Mengisi otomatis field Lat dan Lng
        setLat(String(msg.lat));
        setLng(String(msg.lng));
      }
    } catch (e) {
      console.warn("Failed to parse message from WebView:", e);
    }
  };

  // --- LOGIKA SUBMIT/SIMPAN ---
  const handleSubmit = async () => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (!name || !address || isNaN(latitude) || isNaN(longitude)) {
      Alert.alert("Error", "Semua field harus diisi dan Lat/Lng harus berupa angka.");
      return;
    }

    setIsSaving(true);

    try {
      const updatedData = {
        name,
        address,
        lat: latitude,
        lng: longitude,
        updatedAt: new Date().toISOString(),
      };

      const bookstoreRef = ref(db, `bookstores/${bookstoreId}`);
      await update(bookstoreRef, updatedData);

      Alert.alert("Sukses", `Toko Buku ${name} berhasil diperbarui!`);
      router.back();
    } catch (error) {
      console.error("Gagal memperbarui toko buku:", error);
      Alert.alert("Error", "Gagal menyimpan data ke database. Cek koneksi Anda.");
    } finally {
      setIsSaving(false);
    }
  };
  // ... (sisa kode lainnya)

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Memuat data toko...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Edit Toko Buku</Text>
        
        {/* === AREA WEBVIEW MAP === */}
        <View style={styles.mapContainer}>
          {Platform.OS === "web" ? (
             // Web: Gunakan iframe
            // eslint-disable-next-line jsx-a11y/iframe-has-title
            <iframe
              src={editMapHtml as unknown as string}
              style={{ flex: 1, width: "100%", height: "100%", border: 0 }}
            />
          ) : (
            // Mobile: Gunakan WebView
            <WebView
              ref={webViewRef}
              originWhitelist={["*"]}
              source={editMapHtml}
              style={styles.webview}
              onMessage={handleMapMessage} // Menerima koordinat dari map
              // Agar initial location terkirim setelah WebView dimuat
              onLoadEnd={() => sendInitialLocationToWebview(lat, lng)}
              allowFileAccess
              allowUniversalAccessFromFileURLs
            />
          )}
        </View>
        <Text style={styles.labelMapHint}>*Geser marker di peta untuk mendapatkan koordinat otomatis</Text>
        {/* ======================= */}

        <Text style={styles.label}>ID Data</Text>
        <TextInput style={[styles.input, styles.disabledInput]} value={bookstoreId} editable={false} />

        <Text style={styles.label}>Nama Toko</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nama Toko" />

        <Text style={styles.label}>Alamat</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Alamat" multiline />

        <Text style={styles.label}>Latitude (Garis Lintang)</Text>
        {/* Lat/Lng akan terisi otomatis dari map, atau bisa di-edit manual */}
        <TextInput 
          style={styles.input} 
          value={lat} 
          onChangeText={setLat} 
          placeholder="Latitude" 
          keyboardType="numeric" 
        />

        <Text style={styles.label}>Longitude (Garis Bujur)</Text>
        <TextInput 
          style={styles.input} 
          value={lng} 
          onChangeText={setLng} 
          placeholder="Longitude" 
          keyboardType="numeric" 
        />

        <TouchableOpacity style={[styles.button, isSaving && styles.buttonDisabled]} onPress={handleSubmit} disabled={isSaving}>
          {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Perbarui Data</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonBack} onPress={() => router.back()}>
          <Text style={styles.buttonBackText}>Batal</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8f9fa" },
  loadingText: { marginTop: 10, fontSize: 16, color: "#007bff" },
  scrollContent: { padding: 20 },
  header: { fontSize: 24, fontWeight: "bold", color: "#ffc107", marginBottom: 30, textAlign: "center" },
  label: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 5, marginTop: 10 },
  labelMapHint: { fontSize: 12, color: "#6c757d", marginBottom: 15, fontStyle: 'italic' },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#ced4da", borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 15 },
  disabledInput: { backgroundColor: "#e9ecef", color: "#6c757d" },
  button: { backgroundColor: "#007bff", padding: 15, borderRadius: 8, alignItems: "center", marginTop: 20, elevation: 3 },
  buttonDisabled: { backgroundColor: "#6c757d" },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  buttonBack: { marginTop: 10, padding: 10, alignItems: "center" },
  buttonBackText: { color: "#007bff", fontSize: 16 },
  // Gaya baru untuk Map
  mapContainer: { height: 250, width: "100%", marginBottom: 10, borderWidth: 1, borderColor: "#ced4da", borderRadius: 8, overflow: 'hidden' },
  webview: { flex: 1 },
});