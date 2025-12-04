import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { ref, push } from 'firebase/database';
import { db } from './firebaseConfig'; 
import * as Location from 'expo-location'; // <-- IMPORT BARU

export default function CreateBookstoreScreen() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false); // <-- STATE BARU UNTUK LOKASI

  // --- Fungsi untuk mendapatkan lokasi saat ini ---
  const fetchLocation = async () => {
    setIsLocating(true);
    try {
      // Meminta izin lokasi
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Ditolak', 'Perlu izin lokasi untuk mendapatkan koordinat saat ini.');
        return;
      }

      // Mengambil lokasi
      let location = await Location.getCurrentPositionAsync({});
      
      const currentLat = location.coords.latitude.toFixed(6);
      const currentLng = location.coords.longitude.toFixed(6);

      setLat(currentLat);
      setLng(currentLng);
      Alert.alert('Sukses', `Lokasi berhasil didapatkan: \nLat: ${currentLat}, Lng: ${currentLng}`);

    } catch (error) {
      console.error('Gagal mengambil lokasi:', error);
      Alert.alert('Error', 'Gagal mendapatkan lokasi GPS. Pastikan GPS Anda aktif.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = async () => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (!name || !address || isNaN(latitude) || isNaN(longitude)) {
      Alert.alert('Error', 'Semua field harus diisi dan Lat/Lng harus berupa angka.');
      return;
    }

    setIsLoading(true);

    try {
      const newBookstore = {
        name,
        address,
        lat: latitude,
        lng: longitude,
        createdAt: new Date().toISOString(),
      };

      // Simpan data ke path 'bookstores' di Realtime Database
      const bookstoresRef = ref(db, 'bookstores');
      await push(bookstoresRef, newBookstore);
      
      Alert.alert('Sukses', `Toko Buku ${name} berhasil ditambahkan!`);
      router.back(); // Kembali ke halaman peta
      
    } catch (error) {
      console.error('Gagal menambahkan toko buku:', error);
      Alert.alert('Error', 'Gagal menyimpan data ke database. Cek koneksi Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>Tambah Toko Buku Baru</Text>

        <Text style={styles.label}>Nama Toko</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Cth: Toko Buku Senja"
        />

        <Text style={styles.label}>Alamat</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="Cth: Jl. Kaliurang No. 123"
          multiline
        />

        <Text style={styles.label}>Latitude (Garis Lintang)</Text>
        <TextInput
          style={styles.input}
          value={lat}
          onChangeText={setLat}
          placeholder="-7.7956 (Manual)"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Longitude (Garis Bujur)</Text>
        <TextInput
          style={styles.input}
          value={lng}
          onChangeText={setLng}
          placeholder="110.3695 (Manual)"
          keyboardType="numeric"
        />
        
        {/* Tombol Ambil Lokasi Otomatis */}
        <TouchableOpacity 
          style={[styles.buttonLocate, isLocating && styles.buttonDisabled]} 
          onPress={fetchLocation} 
          disabled={isLocating || isLoading}
        >
          {isLocating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>📍 Gunakan Lokasi Saat Ini</Text>
          )}
        </TouchableOpacity>


        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleSubmit} 
          disabled={isLoading || isLocating}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Simpan Toko Buku</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.buttonBack} onPress={() => router.back()}>
          <Text style={styles.buttonBackText}>Batal</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
  },
  buttonLocate: { // <-- STYLE BARU UNTUK TOMBOL LOKASI
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonBack: {
    marginTop: 10,
    padding: 10,
    alignItems: 'center',
  },
  buttonBackText: {
    color: '#007bff',
    fontSize: 16,
  }
});