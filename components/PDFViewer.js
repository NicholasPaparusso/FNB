import React, { useContext } from "react";
import { TouchableOpacity, Text, Alert, Platform, StyleSheet } from "react-native";
import * as IntentLauncher from "expo-intent-launcher";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { ThemeContext } from "../theme/ThemeContext";

const PDFViewer = ({ fileUri }) => {
  const { theme } = useContext(ThemeContext);

  const openPDF = async () => {
    try {
      if (!fileUri) {
        Alert.alert("Errore", "Nessun file PDF disponibile");
        return;
      }

      console.log("📂 File originale:", fileUri);

      // Copia il file nella cache per evitare problemi di permessi
      const cacheUri = FileSystem.cacheDirectory + "turni_mensili.pdf";
      await FileSystem.copyAsync({ from: fileUri, to: cacheUri });

      console.log("📂 File copiato in cache:", cacheUri);

      // Convertiamo l'URI in un content:// accessibile da altre app
      const contentUri = await FileSystem.getContentUriAsync(cacheUri);
      console.log("🔗 Content URI per il PDF:", contentUri);

      if (Platform.OS === "android") {
        // Usa IntentLauncher per aprire il file con il visualizzatore predefinito
        await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
          data: contentUri,
          flags: 1,
          type: "application/pdf",
        });
      } else if (Platform.OS === "ios") {
        // Usa il sistema di condivisione su iOS
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(contentUri);
        } else {
          Alert.alert("Errore", "Il tuo dispositivo non supporta l'apertura dei file PDF.");
        }
      }
    } catch (error) {
      console.error("❌ Errore apertura PDF:", error);
      Alert.alert("Errore", "Impossibile aprire il PDF.");
    }
  };

  return (
    <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={openPDF}>
      <Text style={styles.buttonText}>Apri PDF</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25, // Bordo tondeggiante
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Ombra su Android
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default PDFViewer;
