// app/tabs/index.tsx
import React from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import books from "../data/books";

export default function BookListScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pilih Buku</Text>

      <FlatList
        data={books}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={item.image}
              style={styles.image}
              resizeMode="cover"
            />

            <Text style={styles.bookTitle} numberOfLines={2}>
              {item.title}
            </Text>

            <Text style={styles.price}>
              Rp {item.price.toLocaleString("id-ID")}
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                router.push({
                  pathname: "/detail",
                  params: { id: item.id },
                })
              }
            >
              <Text style={styles.buttonText}>Detail</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#ffffff" },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  card: {
    width: "48%",
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  image: { width: "100%", height: 140, borderRadius: 8 },
  bookTitle: { marginTop: 8, fontSize: 14, fontWeight: "600" },
  price: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "700",
    color: "#0a7a5f",
  },
  button: {
    marginTop: 10,
    backgroundColor: "#007bff",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700" },
});