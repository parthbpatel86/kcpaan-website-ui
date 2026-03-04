// App.js - KC Paan Main Entry Point
import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./src/context/AuthContext";
import { CartProvider } from "./src/context/CartContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <View style={styles.root}>
      <SafeAreaProvider>
        <AuthProvider>
          <CartProvider>
            <AppNavigator />
            <StatusBar style="light" backgroundColor="#1A0A00" />
          </CartProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    /*
     * WEB SCROLL FIX:
     * On web, flex:1 alone doesn't bound the height — the container just grows
     * to fit content, so ScrollViews never have anything to scroll within.
     * '100vh' pins the root to the actual browser viewport height.
     * overflow:'hidden' prevents the browser's own scrollbar appearing and
     * lets React Native's ScrollView handle all scrolling internally.
     */
    ...(Platform.OS === "web" && {
      height: "100vh",
      maxHeight: "100vh",
      overflow: "hidden",
    }),
  },
});
