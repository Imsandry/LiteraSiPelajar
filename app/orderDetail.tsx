// app/orderDetail.tsx (Sudah Benar)

import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from "expo-router";
import { off, onValue, ref } from 'firebase/database';
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { db } from './firebaseConfig';

// --- DEFINISI TIPE DATA ---
interface OrderData {
    bookId: string;
    title: string;
    quantity: number;
    totalPrice: number;
    paymentMethod: string;
    shippingAddress: string;
    orderDate: string;
    status: string;
    userId: string;
}

// =========================================================
// === KOMPONEN UTAMA: ORDER DETAIL VIEW ===
// =========================================================
export default function OrderDetailScreen() {
    const params = useLocalSearchParams();
    const orderId = String(params.id ?? ""); 

    const [order, setOrder] = useState<OrderData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!orderId) {
            setError("ID Pesanan tidak ditemukan.");
            setIsLoading(false);
            return;
        }
        const orderRef = ref(db, `orders/${orderId}`);

        const handleData = (snapshot: any) => {
            if (snapshot.exists()) {
                const data = snapshot.val() as OrderData;
                setOrder(data);
                setError(null);
            } else {
                setError(`Pesanan dengan ID: ${orderId} tidak ditemukan.`);
                setOrder(null);
            }
            setIsLoading(false);
        };

        // Menggunakan onValue untuk mendengarkan perubahan data secara real-time
        onValue(orderRef, handleData, (err) => {
            console.error("Firebase fetch error:", err);
            setError("Gagal memuat detail pesanan. Cek koneksi.");
            setIsLoading(false);
        });

        // Cleanup listener saat komponen dilepas
        return () => {
            off(orderRef, 'value', handleData);
        };
    }, [orderId]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Dipesan':
                return '#ffc107'; 
            case 'Diproses':
            case 'Diambil':
            case 'Dalam Pengiriman':
                return '#17a2b8'; 
            case 'Tiba di Tujuan':
            case 'Selesai':
                return '#28a745'; 
            default:
                return '#6c757d'; 
        }
    };

    if (isLoading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#007bff" />
                <Text style={styles.loadingText}>Memuat Detail Pesanan...</Text>
            </View>
        );
    }

    if (error || !order) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>⚠️ Error: {error || "Pesanan tidak ditemukan."}</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>Kembali</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const orderDate = order.orderDate ? new Date(order.orderDate).toLocaleDateString('id-ID', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : 'Tanggal tidak diketahui';
    
    // Pilihan navigasi kembali yang lebih fleksibel
    const handleGoBack = () => {
        // Coba kembali ke halaman sebelumnya (idealnya app/tabs/explore.tsx)
        router.back();
    }


    return (
        <ScrollView contentContainerStyle={styles.orderContainer}>
            <View style={styles.header}>
                <Text style={styles.mainTitle}>Detail Pesanan Anda 🛒</Text>
                <Text style={styles.orderIdText}>ID: **{orderId}**</Text>
            </View>

            <View style={styles.infoBoxOrder}>
                <Text style={styles.sectionTitleOrder}><MaterialIcons name="info" size={18} color="#0056b3" /> Informasi Umum</Text>
                <Text style={styles.infoTextOrder}>**Tanggal Pesan:** {orderDate}</Text>
                <Text style={styles.infoTextOrder}>
                    **Status:** <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>{order.status}</Text>
                </Text>
                <Text style={styles.infoTextOrder}>**Metode Bayar:** {order.paymentMethod === 'QR' ? 'QR Code (Segera Konfirmasi)' : 'Cash on Delivery (COD)'}</Text>
            </View>

            <View style={styles.infoBoxOrder}>
                <Text style={styles.sectionTitleOrder}><FontAwesome5 name="book" size={18} color="#0a7a5f" /> Detail Buku</Text>
                <Text style={styles.bookTitleOrder}>**{order.title}**</Text>
                <Text style={styles.infoTextOrder}>**ID Buku:** {order.bookId}</Text>
                <Text style={styles.infoTextOrder}>**Jumlah Beli:** {order.quantity} unit</Text>
                <Text style={styles.infoTextOrder}>**Total Harga:** <Text style={styles.totalPriceValueOrder}>Rp {order.totalPrice.toLocaleString("id-ID")}</Text></Text>
            </View>
            
            <View style={styles.addressBoxOrder}>
                <Text style={styles.sectionTitleOrder}><MaterialIcons name="location-on" size={18} color="#dc3545" /> Alamat Pengiriman</Text>
                <Text style={styles.addressTextOrder}>{order.shippingAddress}</Text>
            </View>

            <TouchableOpacity style={styles.backButtonOrder} onPress={handleGoBack}>
                <Text style={styles.backButtonTextOrder}>Kembali ke Daftar Sebelumnya</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

// =========================================================
// === STYLE SHEETS (Gaya khusus Detail Pesanan) ===
// =========================================================
const styles = StyleSheet.create({
    // --- GAYA UMUM ---
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#f8f9fa" },
    loadingText: { fontSize: 18, fontWeight: 'bold', color: '#007bff' },
    errorText: { fontSize: 18, color: '#dc3545', marginBottom: 20, textAlign: 'center' },
    backButton: { backgroundColor: "#6c757d", paddingVertical: 10, paddingHorizontal: 26, borderRadius: 10, marginBottom: 30, },
    backButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },

    // --- GAYA ORDER DETAIL VIEW ---
    orderContainer: { padding: 20, backgroundColor: "#f8f9fa", minHeight: '100%' },
    header: { marginBottom: 20, alignItems: 'center' },
    mainTitle: { fontSize: 24, fontWeight: '900', color: '#333' },
    orderIdText: { fontSize: 16, color: '#6c757d', marginTop: 5 },
    infoBoxOrder: { width: "100%", padding: 15, borderRadius: 10, backgroundColor: "#fff", marginBottom: 15, elevation: 2, borderWidth: 1, borderColor: '#eee' },
    addressBoxOrder: { width: "100%", padding: 15, borderRadius: 10, backgroundColor: "#ffebeb", marginBottom: 25, elevation: 2, borderWidth: 1, borderColor: '#f5c6cb' },
    sectionTitleOrder: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5 },
    infoTextOrder: { fontSize: 15, marginBottom: 5, color: '#444' },
    bookTitleOrder: { fontSize: 18, fontWeight: '800', color: '#0056b3', marginBottom: 10 },
    addressTextOrder: { fontSize: 15, lineHeight: 22, color: '#dc3545' },
    totalPriceValueOrder: { fontSize: 18, fontWeight: '900', color: '#e67e22' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5, color: '#fff', fontWeight: 'bold' },
    backButtonOrder: { backgroundColor: "#6c757d", paddingVertical: 12, paddingHorizontal: 26, borderRadius: 10, marginBottom: 20, width: '100%', alignItems: 'center', elevation: 3 },
    backButtonTextOrder: { color: "#fff", fontSize: 16, fontWeight: "700" },
});