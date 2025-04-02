import React, { useContext } from "react";
import { TouchableOpacity, Text, Alert, StyleSheet } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { ThemeContext } from "../theme/ThemeContext";
import CalendarioStore from "../CalendarioStore";

const UploadPDFButton = ({ onFileSelected }) => {
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
      
      const response = await fetch("https://serverfnb.onrender.com/upload", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });
      
      console.log("📡 Risposta ricevuta dal server:", response);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Errore nel caricamento: ${errorText}`);
      }
      
      // Parse the response as JSON
      const jsonData = await response.json();
      console.log("📌 Dati ricevuti:", jsonData);
      
      // Check if the response was successful
      if (jsonData.success) {
        // Store just the data field in our global store
        CalendarioStore.setData(jsonData.data);
        Alert.alert("Completato", "Dati dei turni caricati con successo!");
      } else {
        // Handle unsuccessful response
        throw new Error(jsonData.message || "Errore non specificato nell'elaborazione");
      }
      
    } catch (error) {
      console.error("❌ Errore nell'upload:", error);
      Alert.alert("Errore", `Impossibile elaborare il file PDF: ${error.message}`);
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
      const tempPath = FileSystem.documentDirectory + "temp_turni.pdf";
      
      // Copiamo temporaneamente il file per poterlo inviare al server
      await FileSystem.copyAsync({
        from: fileUri,
        to: tempPath,
      });
      
      if (onFileSelected) {
        onFileSelected(tempPath);
      }
      
      // Invia il file al backend
      await uploadFileToBackend(tempPath);
      
      // Elimina il file temporaneo dopo l'upload
      await FileSystem.deleteAsync(tempPath, { idempotent: true });
      
    } catch (error) {
      console.error("❌ Errore nel caricamento del file:", error);
      Alert.alert("Errore", "Impossibile caricare il file.");
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor: theme.primary }]} 
      onPress={pickDocument}
    >
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
