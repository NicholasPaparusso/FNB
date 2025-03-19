import React, { useContext } from "react";
import { TouchableOpacity, Text, Alert, StyleSheet } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { ThemeContext } from "../theme/ThemeContext";

const UploadPDFButton = ({ onFileSelected, onDataExtracted }) => {
  const { theme } = useContext(ThemeContext);

  const uploadFileToBackend = async (fileUri) => {
    try {
        const formData = new FormData();
        formData.append("file", {
            uri: fileUri,
            name: "documento.pdf",
            type: "application/pdf",
        });

        console.log("📤 Inizio upload...", fileUri);

        const response = await fetch("http://192.168.11.174:3000/upload", {
            method: "POST",  // ⚠️ Assicurati che sia POST, non GET!
            headers: {
                "Content-Type": "multipart/form-data",
            },
            body: formData,  // ⚠️ Il body deve essere incluso solo per POST
        });

        console.log("📡 Risposta ricevuta dal server:", response);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Errore nel caricamento: ${errorText}`);
        }

        const jsonData = await response.json();
        console.log("📌 Dati ricevuti:", jsonData);
        onDataExtracted(jsonData.text);
    } catch (error) {
        console.error("❌ Errore nell'upload:", error);
        Alert.alert("Errore", "Impossibile elaborare il file PDF.");
    }
};


  

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        Alert.alert("Errore", "Nessun file selezionato.");
        return;
      }

      const fileUri = result.assets[0].uri;
      const newPath = FileSystem.documentDirectory + "turni_mensili.pdf";

      await FileSystem.copyAsync({
        from: fileUri,
        to: newPath,
      });

      Alert.alert("File caricato!", "Il file è stato salvato con successo.");
      onFileSelected(newPath);

      // Invia il file al backend
      await uploadFileToBackend(newPath);
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
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default UploadPDFButton;
