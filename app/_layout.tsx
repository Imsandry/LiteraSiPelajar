import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
// Status bar dihapus untuk memecahkan masalah rendering yang persisten.
// import { StatusBar } from 'expo-status-bar'; 
import React from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    // Menggunakan Fragment untuk memastikan hanya ada satu elemen root
    <>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="detail" options={{ presentation: 'modal', title: 'Detail Pesanan' }} />
        </Stack>
      </ThemeProvider>
      {/* Jika Anda masih ingin menggunakan StatusBar, gunakan di sini setelah pengujian berhasil */}
      {/* <StatusBar style="auto" /> */}
    </>
  );
}