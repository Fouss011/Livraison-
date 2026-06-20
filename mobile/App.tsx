import React from "react";
import { SafeAreaView, StatusBar, StyleSheet, Platform, View } from "react-native";
import { WebView } from "react-native-webview";

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5efe4" />
      <View style={styles.container}>
        <WebView
          source={{ uri: "https://fretlome.netlify.app/" }}
          style={styles.webview}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5efe4",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: "#f5efe4",
  },
  webview: {
    flex: 1,
    backgroundColor: "#f5efe4",
  },
});