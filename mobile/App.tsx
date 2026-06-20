import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{
          uri: "https://fretlome.netlify.app/"
        }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});