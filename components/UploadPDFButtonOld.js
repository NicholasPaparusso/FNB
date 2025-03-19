import React, { useContext } from "react";
import { TouchableOpacity, Text, Alert, StyleSheet } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { ThemeContext } from "../theme/ThemeContext";

const UploadPDFButton = ({ onFileSelected }) => {
  const { theme } = useContext(ThemeContext);
  console.log("🟠 UploadPDFButton.js caricato correttamente!");

  const pickDocument = async () => {
    try {
      console.log("📂 L'utente sta selezionando un file...");
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });

      console.log("📂 Risultato del DocumentPicker:", result);

      if (result.canceled) {
        console.log("❌ L'utente ha annullato la selezione.");
        return;
      }

      if (!result.assets || result.assets.length === 0) {
        console.error("❌ Errore: Nessun asset trovato!");
        Alert.alert("Errore", "Nessun file selezionato.");
        return;
      }

      const fileUri = result.assets[0].uri;
      console.log("📂 File selezionato URI:", fileUri);

      const newPath = FileSystem.documentDirectory + "turni_mensili.pdf";
      console.log("📂 Verrà salvato in:", newPath);

      await FileSystem.copyAsync({
        from: fileUri,
        to: newPath,
      });

      const fileInfo = await FileSystem.getInfoAsync(newPath);
      console.log("✅ File salvato, esiste?", fileInfo.exists);

      if (fileInfo.exists) {
        Alert.alert("File caricato!", "Il file è stato salvato con successo.");
        onFileSelected(newPath);
      } else {
        Alert.alert("Errore", "Il file non è stato salvato correttamente.");
      }
    } catch (error) {
      console.error("❌ Errore nel caricamento del file:", error);
      Alert.alert("Errore", "Impossibile caricare il file.");
    }
  };

  return (
    <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={pickDocument}>
      <Text style={styles.buttonText}>Carica PDF Turni</Text>
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

export default UploadPDFButton;
