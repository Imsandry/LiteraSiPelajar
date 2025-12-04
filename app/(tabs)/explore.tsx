// app/tabs/explore.tsx (Daftar Pesanan)

import React, { useState, useEffect, memo } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ref, onValue, DataSnapshot } from 'firebase/database';
import { db } from '../firebaseConfig'; 

// --- DEFINISI TIPE DATA LOKAL ---
export type OrderStatus = 'Diproses' | 'Diambil' | 'Dalam Pengiriman' | 'Tiba di Tujuan' | 'Selesai' | 'Dipesan'; 

export interface Order {
    id: string; // Firebase Key
    title: string;
    status: OrderStatus;
    date: string; // OrderDate dari Firebase
    quantity: number;
    totalPrice: number;
    [key: string]: any; 
}
// ---------------------------------------------------------------------

// --- Komponen Kartu Pesanan ---
const OrderCard: React.FC<{ item: Order }> = memo(({ item }) => {
    
    const isCompleted = item.status === 'Selesai' || item.status === 'Tiba di Tujuan';
    const statusColor = isCompleted ? '#28a745' : item.status === 'Dipesan' ? '#ffc107' : '#007bff';
    const displayDate = item.date ? new Date(item.date).toLocaleDateString('id-ID', {
        year: 'numeric', month: 'short', day: 'numeric',
    }) : 'Tanggal tidak tersedia';

    const handlePress = () => {
        // PERBAIKAN NAVIGASI: Mengarahkan ke app/orderDetail.tsx
        router.push({
            pathname: '/orderDetail', // Mengarah ke halaman detail pesanan yang baru
            params: {
                id: item.id, // Hanya perlu ID Pesanan
            },
        });
    };

    let statusBackgroundColor = '#fff9e6'; // Default Dipesan
    if (isCompleted) {
        statusBackgroundColor = '#e6fff4';
    } else if (item.status !== 'Dipesan') {
        statusBackgroundColor = '#e6f7ff'; // Proses Pengiriman/Ambil
    }


    return (
        <TouchableOpacity onPress={handlePress} style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text 
                    style={[
                        styles.cardStatus, 
                        { 
                            color: statusColor,
                            backgroundColor: statusBackgroundColor,
                            borderColor: statusColor,
                        }
                    ]}
                >
                    {item.status}
                </Text>
            </View>
            <Text style={styles.cardDetail}>Jumlah: {item.quantity}x</Text>
            <Text style={styles.cardDetail}>Total: **Rp {Number(item.totalPrice).toLocaleString('id-ID')}**</Text>
            <Text style={styles.cardDate}>Tanggal Pesan: {displayDate}</Text>
        </TouchableOpacity>
    );
});

// --- Komponen Pesan Kosong ---
const EmptyListMessage: React.FC = () => {
    return (
        <View style={styles.centerMessage}>
            <MaterialIcons name="info-outline" size={32} color="#6c757d" />
            <Text style={styles.messageText}>Tidak ada pesanan sama sekali.</Text>
        </View>
    );
}


// --- Komponen Utama ExploreScreen ---
export default function ExploreScreen() {
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        if (!db || !db.app.options.databaseURL) {
            setIsLoading(false);
            console.warn("Firebase Database belum terinisialisasi atau konfigurasi gagal.");
            return;
        }

        // Perbaikan path ref
        const ordersRef = ref(db, 'orders'); 

        const unsubscribe = onValue(ordersRef, (snapshot: DataSnapshot) => {
            setIsLoading(true);
            try {
                const data = snapshot.val() || {};
                
                const ordersArray: Order[] = Object.keys(data).map(key => {
                    const orderData = data[key];
                    const defaultDate = new Date().toISOString();
                    const orderDate = orderData.orderDate || defaultDate; 
                    
                    return {
                        id: key, 
                        title: orderData.title || 'Pesanan Tanpa Judul',
                        status: orderData.status || 'Dipesan', 
                        date: orderDate, 
                        quantity: orderData.quantity || 1,
                        totalPrice: orderData.totalPrice || 0,
                        ...orderData,
                    } as Order;
                }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); 

                setAllOrders(ordersArray);
                
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setIsLoading(false);
            }
        });

        return () => unsubscribe();
    }, [db]); 

    const renderContent = () => {
        if (isLoading) {
            return (
                <View style={styles.centerMessage}>
                    <ActivityIndicator size="large" color="#007bff" />
                    <Text style={styles.messageText}>Memuat semua pesanan...</Text>
                </View>
            );
        }

        return (
            <FlatList
                data={allOrders}
                renderItem={({ item }) => <OrderCard item={item} />}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContentContainer}
                ListEmptyComponent={EmptyListMessage}
                ListHeaderComponent={() => (
                    <View style={styles.listHeaderWrapper}>
                        <Text style={styles.listInstructionText}>
                            Daftar semua pesanan Anda (terbaru di atas).
                        </Text>
                    </View>
                )}
            />
        );
    };

    return (
        <SafeAreaView style={styles.fullContainer}>
            {renderContent()}
        </SafeAreaView>
    );
}

// --- Style Sheet ---
const styles = StyleSheet.create({
    fullContainer: { flex: 1, backgroundColor: '#f8f9fa' },
    listHeaderWrapper: { paddingTop: 10, marginBottom: 10, },
    listInstructionText: {
        fontSize: 12, color: '#6c757d', textAlign: 'center', fontStyle: 'italic', paddingHorizontal: 20, 
    },
    listContentContainer: { paddingHorizontal: 20, paddingBottom: 50, },
    card: {
        backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 10, width: '100%', 
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3,
        elevation: 3, borderLeftWidth: 5, borderLeftColor: '#007bff',
    },
    cardHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, 
        borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 5,
    },
    cardTitle: { fontSize: 17, fontWeight: '700', color: '#333', flex: 1, },
    cardStatus: {
        fontSize: 12, fontWeight: '700', marginLeft: 10, paddingHorizontal: 8, paddingVertical: 4,
        borderRadius: 8, borderWidth: 1,
    },
    cardDetail: { fontSize: 14, color: '#555', marginBottom: 3, },
    cardDate: { fontSize: 12, color: '#adb5bd', marginTop: 5, fontStyle: 'italic', },
    centerMessage: {
        justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, marginTop: 50, flex: 1,
    },
    messageText: { fontSize: 16, color: '#6c757d', marginTop: 10, textAlign: 'center', },
});