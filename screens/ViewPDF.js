import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { WebView } from "react-native-webview";
import * as FileSystem from "expo-file-system";

const ViewPDF = () => {
  const [pdfUri, setPdfUri] = useState(null);

  useEffect(() => {
    const checkForPDF = async () => {
      // Imposta il percorso del PDF (può essere lo stesso utilizzato in fase di upload)
      const filePath = FileSystem.documentDirectory + "turni_mensili.pdf";
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (fileInfo.exists) {
        setPdfUri(filePath);
      }
    };

    checkForPDF();
  }, []);

  if (!pdfUri) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Nessun PDF disponibile</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView source={{ uri: pdfUri }} style={{ flex: 1 }} />
    </View>
  );
};

export default ViewPDF;
