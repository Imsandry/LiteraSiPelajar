// app/detail.tsx

import { useLocalSearchParams, router } from "expo-router";
import React, { useState, useMemo } from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
    TextInput, 
} from "react-native";
import MapView, { Marker, Region } from 'react-native-maps'; 
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { ref, push, set } from 'firebase/database';
import { db } from './firebaseConfig'; // Pastikan path relatif ini benar

// Asumsikan file ini ada
import books from "./data/books"; 

// Data Marker Statis (Contoh Lokasi Toko)
interface MapMarker {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
}

const STATIC_MARKERS: MapMarker[] = [
    { id: 'toko_a', name: 'Toko Buku Utama', latitude: -7.7956, longitude: 110.3695 }, 
    { id: 'toko_b', name: 'Cabang Malioboro', latitude: -7.7925, longitude: 110.3667 }, 
    { id: 'toko_c', name: 'Gudang Kaliurang', latitude: -7.7471, longitude: 110.3809 }, 
];

type PaymentMethod = 'QR' | 'COD' | null;

export default function DetailScreen() {
    const params = useLocalSearchParams();
    const id = String(params.id ?? "");
    const book = books.find((b) => b.id === id);

    // State
    const [quantity, setQuantity] = useState(1);
    const [showMap, setShowMap] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
    const [address, setAddress] = useState(''); 
    const [isLoading, setIsLoading] = useState(false); 

    // Kalkulasi Total Harga
    const totalPrice = useMemo(() => {
        return (book?.price || 0) * quantity;
    }, [book, quantity]);

    if (!book) {
        return (
            <View style={styles.container}>
                <Text style={styles.notFound}>Buku tidak ditemukan</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Kembali</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBuy = async () => {
        if (quantity < 1) {
            Alert.alert("Gagal", "Jumlah pembelian harus minimal 1.");
            return;
        }
        if (!paymentMethod) {
            Alert.alert("Gagal", "Pilih metode pembayaran terlebih dahulu.");
            return;
        }
        if (address.trim().length < 10) {
            Alert.alert("Gagal", "Mohon isi alamat pengiriman dengan lengkap (minimal 10 karakter).");
            return;
        }

        setIsLoading(true);

        try {
            // 1. Buat Objek Data Pesanan
            const orderData = {
                bookId: book.id,
                title: book.title,
                quantity: quantity,
                totalPrice: totalPrice,
                paymentMethod: paymentMethod,
                shippingAddress: address.trim(),
                orderDate: new Date().toISOString(),
                status: "Dipesan",
                userId: 'anonymous_user_' + new Date().getTime(), 
            };

            // 2. Simpan ke Firebase Realtime Database di path /orders/
            const ordersRef = ref(db, 'orders'); 
            const newOrderRef = push(ordersRef); 
            await set(newOrderRef, orderData);
            
            const orderId = newOrderRef.key;
            
            Alert.alert("Sukses", `Pesanan Anda (${orderId}) berhasil dicatat!`);

            // 3. Navigasi ke halaman checkout dengan membawa data
            router.push({
                pathname: "/checkout",
                params: {
                    id: book.id,
                    title: book.title,
                    quantity: quantity.toString(),
                    totalPrice: totalPrice.toString(),
                    paymentMethod: paymentMethod,
                    address: address, 
                    orderId: orderId, 
                },
            });

        } catch (error) {
            console.error("Gagal menyimpan pesanan ke Firebase:", error);
            Alert.alert("Gagal", "Terjadi kesalahan saat mencatat pesanan. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuantityChange = (delta: number) => {
        setQuantity(prev => Math.max(1, prev + delta));
    };

    const toggleMap = () => {
        setShowMap(prev => !prev);
    };
    
    // Perbaikan: Tentukan tipe data eksplisit untuk initialMapRegion
    const initialMapRegion: Region = { 
        latitude: STATIC_MARKERS[0]?.latitude || -7.7956, 
        longitude: STATIC_MARKERS[0]?.longitude || 110.3695,
        latitudeDelta: 0.02,
        longitudeDelta: 0.01,
    };

    const MapComponent = () => {
        if (STATIC_MARKERS.length === 0) {
            return (
                <View style={[styles.mapContainer, { justifyContent: 'center', alignItems: 'center' }]}>
                    <MaterialIcons name="location-off" size={40} color="#c00" />
                    <Text style={{ marginTop: 10 }}>Tidak ada lokasi toko yang tersedia.</Text>
                </View>
            );
        }

        return (
            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    initialRegion={initialMapRegion}
                    zoomControlEnabled={true}
                    showsUserLocation={true}
                >
                    {STATIC_MARKERS.map(marker => (
                        <Marker
                            key={marker.id}
                            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                            title={marker.name}
                            description={`Koordinat: ${marker.latitude}, ${marker.longitude}`}
                        >
                            <FontAwesome5 name="store" size={24} color="#e67e22" />
                        </Marker>
                    ))}
                </MapView>
                <Text style={styles.mapInstruction}>Peta ini menunjukkan lokasi toko, alamat pengiriman diisi di kolom di atas.</Text>
            </View>
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <Text style={styles.loadingText}>Memproses Pesanan...</Text>
                </View>
            )}

            {/* Gambar, Judul & Harga */}
            <Image source={book.image} style={styles.image} resizeMode="cover" />
            <Text style={styles.title}>{book.title}</Text>
            <Text style={styles.price}>Harga Satuan: Rp {book.price.toLocaleString("id-ID")}</Text>

            {/* Info Buku */}
            <View style={styles.infoBox}>
                <Text style={styles.infoText}>Penulis: {book.author}</Text>
                <Text style={styles.infoText}>Penerbit: {book.publisher}</Text>
                <Text style={styles.infoText}>Tahun: {book.year}</Text>
                <Text style={styles.infoText}>Kategori: {book.category}</Text>
            </View>
            
            <Text style={styles.longDesc}>{book.longDesc}</Text>

            {/* Jumlah Barang & Total Harga */}
            <View style={styles.quantityContainer}>
                <Text style={styles.quantityLabel}>Jumlah Beli:</Text>
                <View style={styles.quantityControl}>
                    <TouchableOpacity 
                        style={styles.quantityButton} 
                        onPress={() => handleQuantityChange(-1)} 
                        disabled={quantity <= 1 || isLoading}
                    >
                        <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{quantity}</Text>
                    <TouchableOpacity 
                        style={styles.quantityButton} 
                        onPress={() => handleQuantityChange(1)}
                        disabled={isLoading}
                    >
                        <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>
            
            <View style={styles.totalPriceContainer}>
                <Text style={styles.totalPriceLabel}>Total Harga:</Text>
                <Text style={styles.totalPriceValue}>Rp {totalPrice.toLocaleString("id-ID")}</Text>
            </View>
            
            {/* KOLOM PENGISIAN ALAMAT */}
            <View style={styles.addressContainer}>
                <Text style={styles.addressLabel}><MaterialIcons name="location-on" size={18} color="#0056b3" /> Alamat Pengiriman:</Text>
                <TextInput
                    style={styles.addressInput}
                    multiline
                    placeholder="Masukkan alamat lengkap (Jalan, Nomor Rumah, RT/RW, Kelurahan, Kecamatan)"
                    placeholderTextColor="#999"
                    value={address}
                    onChangeText={setAddress}
                    editable={!isLoading}
                />
            </View>
            {/* ======================= */}

            {/* PEMILIHAN METODE PEMBAYARAN */}
            <Text style={styles.paymentHeader}>Pilih Metode Pembayaran</Text>
            <View style={styles.paymentMethodContainer}>
                <TouchableOpacity 
                    style={[styles.paymentOption, paymentMethod === 'QR' && styles.paymentOptionSelected]}
                    onPress={() => setPaymentMethod('QR')}
                    disabled={isLoading}
                >
                    <MaterialIcons name="qr-code" size={30} color={paymentMethod === 'QR' ? '#fff' : '#007bff'} />
                    <Text style={[styles.paymentText, paymentMethod === 'QR' && styles.paymentTextSelected]}>Bayar dengan QR Code</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.paymentOption, paymentMethod === 'COD' && styles.paymentOptionSelected]}
                    onPress={() => setPaymentMethod('COD')}
                    disabled={isLoading}
                >
                    <FontAwesome5 name="truck" size={24} color={paymentMethod === 'COD' ? '#fff' : '#28a745'} />
                    <Text style={[styles.paymentText, paymentMethod === 'COD' && styles.paymentTextSelected]}>Cash on Delivery (COD)</Text>
                </TouchableOpacity>
            </View>

            {/* TOGGLE PETA LOKASI TOKO */}
            <TouchableOpacity style={styles.mapToggleButton} onPress={toggleMap} disabled={isLoading}>
                <FontAwesome5 
                    name={showMap ? "chevron-up" : "chevron-down"} 
                    size={16}
                    color="#fff"
                    style={{ marginRight: 10 }}
                />
                <Text style={styles.mapToggleText}>
                    {showMap ? "Sembunyikan Peta Lokasi Toko" : "Tampilkan Peta Lokasi Toko"}
                </Text>
            </TouchableOpacity>

            {showMap && <MapComponent />}

            {/* Tombol beli (Sekarang Checkout) */}
            <TouchableOpacity 
                style={[styles.buyButton, isLoading && styles.disabledButton]} 
                onPress={handleBuy} 
                disabled={isLoading}
            >
                <Text style={styles.buyButtonText}>{isLoading ? 'Memproses...' : `Checkout (${quantity})`}</Text>
            </TouchableOpacity>

            {/* Tombol kembali */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()} disabled={isLoading}>
                <Text style={styles.backButtonText}>Kembali</Text>
            </TouchableOpacity>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { alignItems: "center", padding: 20, backgroundColor: "#fff" },
    image: { width: 260, height: 360, borderRadius: 12, marginBottom: 18 },
    title: { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 8 },
    price: { fontSize: 18, color: "#0a7a5f", fontWeight: "700", marginBottom: 14 },
    infoBox: { width: "100%", padding: 12, borderRadius: 10, backgroundColor: "#f2f2f2", marginBottom: 14 },
    infoText: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
    longDesc: { fontSize: 14, textAlign: "left", color: "#444", marginBottom: 20 },
    
    // STYLE BARU ALAMAT
    addressContainer: { width: '100%', marginBottom: 20, paddingHorizontal: 10, },
    addressLabel: { fontSize: 16, fontWeight: '700', color: '#0056b3', marginBottom: 8, },
    addressInput: { 
        borderWidth: 1, 
        borderColor: '#ccc', 
        borderRadius: 8, 
        padding: 10, 
        height: 80, 
        textAlignVertical: 'top', 
        backgroundColor: '#fff',
        fontSize: 14,
    },
    // ==========================

    quantityContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 15, paddingHorizontal: 20, },
    quantityLabel: { fontSize: 16, fontWeight: '600', color: '#333' },
    quantityControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee', borderRadius: 8 },
    quantityButton: { paddingHorizontal: 15, paddingVertical: 8, backgroundColor: '#ccc', borderRadius: 8 },
    quantityButtonText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
    quantityText: { fontSize: 18, fontWeight: '700', paddingHorizontal: 15, color: '#333' },
    totalPriceContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', padding: 12, borderRadius: 10, backgroundColor: '#e6f7ff', marginBottom: 20, borderWidth: 1, borderColor: '#b3e0ff', },
    totalPriceLabel: { fontSize: 16, fontWeight: '700', color: '#0056b3' },
    totalPriceValue: { fontSize: 18, fontWeight: '900', color: '#e67e22' },
    paymentHeader: { fontSize: 16, fontWeight: '700', width: '100%', textAlign: 'left', marginBottom: 10, color: '#333', paddingHorizontal: 10, },
    paymentMethodContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20, },
    paymentOption: { flex: 1, alignItems: 'center', padding: 15, borderRadius: 10, borderWidth: 2, borderColor: '#ccc', marginHorizontal: 5, backgroundColor: '#fff', },
    paymentOptionSelected: { borderColor: '#007bff', backgroundColor: '#007bff', shadowColor: '#007bff', shadowOpacity: 0.3, shadowRadius: 5, },
    paymentText: { marginTop: 8, fontSize: 13, fontWeight: '600', textAlign: 'center', color: '#333' },
    paymentTextSelected: { color: '#fff', fontWeight: '700', },
    mapToggleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#007bff', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, marginBottom: 20, width: '100%', },
    mapToggleText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    mapContainer: { width: "100%", height: 300, marginBottom: 20, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, overflow: 'hidden', },
    map: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', },
    mapInstruction: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: '#fff',
        padding: 8,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '500',
    },
    buyButton: { backgroundColor: "#28a745", paddingVertical: 14, paddingHorizontal: 30, borderRadius: 10, marginBottom: 10, width: '100%', alignItems: 'center', elevation: 5, },
    buyButtonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
    backButton: { backgroundColor: "#6c757d", paddingVertical: 10, paddingHorizontal: 26, borderRadius: 10, marginBottom: 30, },
    backButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    notFound: { fontSize: 18, color: "#c00", marginBottom: 12 },
    
    // Gaya Loading
    loadingOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    loadingText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007bff',
    },
    disabledButton: {
        backgroundColor: '#90ee90', 
    }
});
