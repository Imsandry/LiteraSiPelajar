// app/checkout.tsx

import { useLocalSearchParams, router } from "expo-router"; 
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView, // Tambahkan SafeAreaView untuk layout yang lebih aman
} from "react-native";
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

// Data simulasi untuk status pesanan
interface OrderStatus {
    id: number;
    label: string;
    icon: keyof typeof MaterialIcons.glyphMap;
}

const ORDER_PROCESS: OrderStatus[] = [
    { id: 1, label: "Pesanan Diterima", icon: "check-circle" },
    { id: 2, label: "Sedang Dikemas", icon: "inventory" },
    { id: 3, label: "Dalam Pengiriman", icon: "local-shipping" },
    { id: 4, label: "Tiba di Tujuan", icon: "home" },
];

export default function CheckoutScreen() {
    const params = useLocalSearchParams();

    // Ambil data dari parameter navigasi
    const title = String(params.title || 'Buku');
    // Pastikan nilai numerik diolah dengan aman
    const totalPrice = String(params.totalPrice || '0');
    const quantity = String(params.quantity || '1');
    const paymentMethod = String(params.paymentMethod || 'COD'); 
    const address = String(params.address || 'Alamat tidak tersedia');

    // State simulasi proses belanja
    const [currentStep, setCurrentStep] = useState(1); 

    // Simulasikan proses berjalan 
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep(prev => {
                if (prev < ORDER_PROCESS.length) {
                    return prev + 1;
                }
                clearInterval(interval);
                return prev;
            });
        }, 5000); 

        return () => clearInterval(interval);
    }, []);


    const isQR = paymentMethod === 'QR';

    const handleGoToExplore = () => {
        router.replace('/(tabs)/explore'); 
    };

    return (
        // Bungkus dalam SafeAreaView untuk layout yang aman
        <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>
                <FontAwesome5 name="shopping-bag" size={24} color="#007bff" /> Status Pesanan
            </Text>

            {/* Detail Pesanan */}
            <View style={styles.orderDetailBox}>
                <Text style={styles.detailText}>
                    <Text style={styles.detailLabel}>Produk:</Text> {title} ({quantity}x)
                </Text>
                <Text style={styles.detailText}>
                    <Text style={styles.detailLabel}>Total Bayar:</Text> Rp {Number(totalPrice).toLocaleString("id-ID")}
                </Text>
                <Text style={styles.detailText}>
                    <Text style={styles.detailLabel}>Metode Bayar:</Text> {isQR ? 'QR Code' : 'Cash on Delivery (COD)'}
                </Text>
                <View style={styles.addressBox}>
                    <Text style={styles.addressTitle}>
                        <MaterialIcons name="location-on" size={16} color="#0056b3" /> Alamat Kirim:
                    </Text>
                    <Text style={styles.addressContent}>{address}</Text>
                </View>
            </View>

            {/* Tampilan QR CODE (Hanya jika metode bayar adalah QR) */}
            {isQR && (
                <View style={styles.qrContainer}>
                    <Text style={styles.qrHeader}>Lakukan Pembayaran</Text>
                    <Text style={styles.qrInstruction}>Scan QR Code di bawah ini untuk menyelesaikan pembayaran sebesar Rp {Number(totalPrice).toLocaleString("id-ID")}:</Text>
                    
                    {/* Placeholder QR Code VISUAL */}
                    <View style={styles.qrPlaceholder}>
                        <FontAwesome5 name="qrcode" size={180} color="#000" />
                    </View>
                </View>
            )}

            {/* Status Proses Belanja */}
            <View style={styles.processContainer}>
                <Text style={styles.processHeader}>
                    <MaterialIcons name="timeline" size={20} color="#333" /> Proses Pengiriman
                </Text>
                {/* Loop mapping status pesanan */}
                {ORDER_PROCESS.map((step) => (
                    <View key={step.id} style={styles.stepItem}>
                        <MaterialIcons
                            name={step.icon}
                            size={24}
                            color={step.id <= currentStep ? '#28a745' : '#ccc'}
                            style={styles.stepIcon}
                        />
                        <View style={styles.stepContent}>
                            <Text style={step.id <= currentStep ? styles.stepLabelActive : styles.stepLabel}>
                                {step.label}
                            </Text>
                            {/* Garis penghubung */}
                            {step.id < ORDER_PROCESS.length && (
                                <View style={[
                                    styles.stepLine,
                                    step.id < currentStep && styles.stepLineActive
                                ]} />
                            )}
                        </View>
                    </View>
                ))}
            </View>
            
            {/* Tombol Kembali ke Beranda */}
            <TouchableOpacity style={styles.backButton} onPress={handleGoToExplore}>
                <Text style={styles.backButtonText}>Lanjutkan Belanja / Kembali ke Beranda</Text>
            </TouchableOpacity>

        </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#fff" }, // Tambahkan style safeArea
    container: { 
        padding: 20, 
        backgroundColor: "#fff", 
        alignItems: 'center', 
        paddingBottom: 40 // Tambahkan padding bawah
    },
    header: { fontSize: 24, fontWeight: '700', marginBottom: 20, color: '#007bff' },

    // Detail Box
    orderDetailBox: {
        width: '100%',
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#e9ecef',
        marginBottom: 20,
    },
    detailText: { fontSize: 14, marginBottom: 5, color: '#495057' },
    detailLabel: { fontWeight: '700', color: '#333' },
    addressBox: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#dee2e6',
    },
    addressTitle: { fontSize: 14, fontWeight: '700', color: '#0056b3', marginBottom: 4 },
    addressContent: { fontSize: 14, color: '#495057', fontStyle: 'italic' },

    // QR Section
    qrContainer: {
        width: '100%',
        alignItems: 'center',
        padding: 20,
        borderRadius: 10,
        backgroundColor: '#fff3cd',
        borderWidth: 1,
        borderColor: '#ffc107',
        marginBottom: 20,
    },
    qrHeader: { fontSize: 18, fontWeight: '700', color: '#856404', marginBottom: 10 },
    qrInstruction: { fontSize: 14, textAlign: 'center', marginBottom: 15, color: '#856404' },
    qrPlaceholder: {
        width: 200,
        height: 200,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        // Hapus borderWidth/borderColor di sini, biarkan FontAwesome5 yang memberikan visual
    },
    qrPlaceholderText: { fontSize: 20, fontWeight: 'bold' }, // Sudah tidak digunakan

    // Process Timeline
    processContainer: {
        width: '100%',
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#e9f7ef',
        marginBottom: 20,
    },
    processHeader: { fontSize: 16, fontWeight: '700', color: '#28a745', marginBottom: 15 },
    stepItem: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    stepIcon: {
        marginRight: 10,
        marginTop: 5,
    },
    stepContent: {
        flex: 1,
    },
    stepLabel: {
        fontSize: 15,
        color: '#999',
        fontWeight: '600',
    },
    stepLabelActive: {
        fontSize: 15,
        color: '#28a745',
        fontWeight: '700',
    },
    stepLine: {
        height: 30,
        width: 3,
        backgroundColor: '#ccc',
        marginLeft: 11,
        marginBottom: -10,
    },
    stepLineActive: {
        backgroundColor: '#28a745',
    },
    
    // Style Tombol
    backButton: {
        backgroundColor: "#007bff",
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 10,
        marginTop: 20, // Tambah margin agar terpisah dari timeline
    },
    backButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});