import React, { useState, useEffect, useContext } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import * as FileSystem from "expo-file-system";
import UploadPDFButton from "../components/UploadPDFButton";
import PDFViewer from "../components/PDFViewer";
import { useNavigation } from "@react-navigation/native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { ThemeContext } from "../theme/ThemeContext";

const Home = () => {
  const [fileUri, setFileUri] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const checkForExistingFile = async () => {
      const filePath = FileSystem.documentDirectory + "turni_mensili.pdf";
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (fileInfo.exists) {
        setFileUri(filePath);
        setShowConfirmation(true);
      }
    };

    checkForExistingFile();
  }, []);

  useEffect(() => {
    if (fileUri) {
      setShowConfirmation(true);
    }
  }, [fileUri]);

  const handleNavigateToCalendar = () => {
    navigation.navigate("Calendario");
  };

  return (
    <View style={[{ flex: 1, padding: 20 }, { backgroundColor: theme.background }]}>
      <Text style={[{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }, { color: theme.text }]}>
        Benvenuto! Carica un file PDF per visualizzare i turni mensili.
      </Text>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 15 }}>
        <UploadPDFButton onFileSelected={setFileUri} onDataExtracted={setParsedData} />
        {fileUri && <PDFViewer fileUri={fileUri} />}
      </View>

      {/* Messaggio di conferma */}
      {showConfirmation && (
        <TouchableOpacity
          style={[styles.confirmationContainer, { backgroundColor: theme.primary }]}
          onPress={handleNavigateToCalendar}
        >
          <FontAwesome name="calendar" size={24} color={theme.iconColor || "#fff"} />
          <Text style={[styles.confirmationText, { color: theme.textOnPrimary || "#fff" }]}>
            File caricato correttamente. Vai al Calendario.
          </Text>
        </TouchableOpacity>
      )}

      {parsedData && (
        <ScrollView style={{ marginTop: 20, maxHeight: 300 }}>
          <Text style={[{ fontSize: 16, fontWeight: "bold" }, { color: theme.text }]}>
            Dati Estratti:
          </Text>
          <Text style={{ color: theme.text }}>{JSON.stringify(parsedData, null, 2)}</Text>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  confirmationContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  confirmationText: {
    marginLeft: 10,
    fontSize: 14,
  },
});

export default Home;
