import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
  TouchableWithoutFeedback
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { ThemeContext } from "../theme/ThemeContext";
import Icon from "react-native-vector-icons/FontAwesome"; // Importa FontAwesome
import CalendarioStore from "../CalendarioStore";

// Configurazione in italiano per il calendario
LocaleConfig.locales["it"] = {
  monthNames: [
    "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio",
    "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre",
    "Novembre", "Dicembre"
  ],
  monthNamesShort: [
    "Gen", "Feb", "Mar", "Apr", "Mag",
    "Giu", "Lug", "Ago", "Set", "Ott",
    "Nov", "Dic"
  ],
  dayNames: [
    "Domenica", "Lunedì", "Martedì", "Mercoledì",
    "Giovedì", "Venerdì", "Sabato"
  ],
  dayNamesShort: ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"],
  today: "Oggi"
};
LocaleConfig.defaultLocale = "it";

// Array per i nomi dei mesi in italiano (per la formattazione della data)
const italianMonthNames = [
  "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio",
  "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre",
  "Novembre", "Dicembre"
];

// Funzione per formattare la data "YYYY-MM-DD" in "D Mese YYYY"
const formatDateItalian = (dateStr) => {
  const [year, month, day] = dateStr.split("-");
  const monthIndex = parseInt(month, 10) - 1;
  const monthName = italianMonthNames[monthIndex] || month;
  return `${parseInt(day, 10)} ${monthName} ${year}`;
};

const Calendario = () => {
  const { theme } = useContext(ThemeContext);
  
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = String(today.getMonth() + 1).padStart(2, "0");

  const [selectedPerson, setSelectedPerson] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [modalVisible, setModalVisible] = useState(false); // per il dettaglio del turno
  const [personModalVisible, setPersonModalVisible] = useState(false); // per la selezione della persona
  const [searchText, setSearchText] = useState("");
  const [persons, setPersons] = useState([]);
  const [selectedTurnInfo, setSelectedTurnInfo] = useState(null);
  const [calendarioData, setCalendarioData] = useState(CalendarioStore.getData());

  // Subscribe to changes in the store
  useEffect(() => {
    const unsubscribe = CalendarioStore.subscribe((data) => {
      setCalendarioData(JSON.parse(data));
    });
    
    // Initialize with current data
    setCalendarioData(CalendarioStore.getData());
    
    // Cleanup subscription when component unmounts
    return () => unsubscribe();
  }, []);

  // Inizializza la lista delle persone dal JSON
  useEffect(() => {
    if (calendarioData && Object.keys(calendarioData).length > 0) {
      const keys = Object.keys(calendarioData);
      setPersons(keys);
      if (keys.length > 0) {
        setSelectedPerson(keys[0]);
      }
    }
  }, [calendarioData]);

  // Filtra i turni per il mese corrente per la persona selezionata
  const getTurnsForCurrentMonth = useCallback(() => {
    if (!calendarioData || !selectedPerson) return {};
    
    const turns = calendarioData[selectedPerson] || {};
    const filtered = {};
    Object.keys(turns).forEach((dateStr) => {
      if (dateStr.startsWith(`${currentYear}-${currentMonth}-`)) {
        filtered[dateStr] = turns[dateStr].codice;
      }
    });
    return filtered;
  }, [selectedPerson, currentYear, currentMonth, calendarioData]);

  const turnsMapping = getTurnsForCurrentMonth();

  // Custom day component per il calendario
  const renderDay = (props) => {
    const { date, state } = props;
    const dateStr = date.dateString;
    const turnCode = turnsMapping[dateStr];

    const onPressDay = () => {
      setSelectedDate(dateStr);
      if (calendarioData[selectedPerson] && calendarioData[selectedPerson][dateStr]) {
        setSelectedTurnInfo(calendarioData[selectedPerson][dateStr]);
        setModalVisible(true);
      }
    };

    return (
      <TouchableOpacity onPress={onPressDay} style={styles.dayContainer}>
        <Text style={[styles.dayText, state === "disabled" && styles.disabledDayText]}>
          {date.day}
        </Text>
        {turnCode && (
          <View style={[styles.badge, { backgroundColor: theme.primary }]}>
            <Text style={styles.badgeText}>{turnCode}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Filtra la lista delle persone in base al testo di ricerca
  const filteredPersons = persons.filter(person =>
    person.toLowerCase().includes(searchText.toLowerCase())
  );

  // Rende ogni elemento della FlatList della selezione delle persone
  const renderPersonItem = ({ item }) => (
    <TouchableOpacity
      style={styles.personItem}
      onPress={() => {
        setSelectedPerson(item);
        setPersonModalVisible(false);
      }}
    >
      <Text style={styles.personText}>{item}</Text>
    </TouchableOpacity>
  );

  const markedDates = selectedDate
    ? { [selectedDate]: { selected: true, selectedColor: "orange" } }
    : {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seleziona persona</Text>
      {/* Bottone per aprire la modale di selezione persona */}
      <TouchableOpacity
        style={[styles.selectorButton, { borderColor: theme.primary }]}
        onPress={() => setPersonModalVisible(true)}
      >
        <Text style={styles.selectorText}>{selectedPerson || "cerca un nome.."}</Text>
      </TouchableOpacity>

      {/* Modale per la selezione della persona */}
      <Modal
        visible={personModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPersonModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.personModalContent}>
            <TextInput
              style={styles.searchInput}
              placeholder="cerca un nome.."
              value={searchText}
              onChangeText={setSearchText}
            />
            <FlatList
              data={filteredPersons}
              keyExtractor={(item) => item}
              renderItem={renderPersonItem}
              style={styles.personList}
              keyboardShouldPersistTaps="handled"
            />
            <TouchableOpacity
              style={[styles.closeButtonModal, { backgroundColor: theme.primary }]}
              onPress={() => setPersonModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Chiudi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Calendario e altri contenuti */}
      <Calendar
        dayComponent={renderDay}
        current={`${currentYear}-${currentMonth}-01`}
        markedDates={markedDates}
        style={styles.calendar}
      />

      {/* Modal per i dettagli del turno */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              {selectedTurnInfo ? (
                <>
                  <Text style={styles.modalTitle}>
                    Turno del {formatDateItalian(selectedDate)}
                  </Text>
                  <Text style={styles.modalText}>
                    Codice: {selectedTurnInfo.codice}
                  </Text>
                  <Text style={styles.modalText}>
                    Inizio: {selectedTurnInfo.dettagli.inizio || "-"}
                  </Text>
                  <Text style={styles.modalText}>
                    Fine: {selectedTurnInfo.dettagli.fine || "-"}
                  </Text>
                  <Text style={styles.modalText}>
                    Durata: {selectedTurnInfo.dettagli.durata || "-"}
                  </Text>
                  {selectedTurnInfo.dettagli.treni && (
                    <>
                      <Text style={styles.modalText}>Treni:</Text>
                      {selectedTurnInfo.dettagli.treni.map((train, index) => (
                        <Text key={index} style={styles.trainItem}>
                          {index + 1}. {train}
                        </Text>
                      ))}
                    </>
                  )}
                  <Text style={styles.modalText}>
                    Maggiorazione mg:{" "}
                    {selectedTurnInfo.dettagli.mg ? (
                      <Icon name="check-circle" size={20} color="green" />
                    ) : (
                      <Icon name="times-circle" size={20} color="red" />
                    )}
                  </Text>
                  <Text style={styles.modalText}>
                    Maggiorazione tc:{" "}
                    {selectedTurnInfo.dettagli.tc ? (
                      <Icon name="check-circle" size={20} color="green" />
                    ) : (
                      <Icon name="times-circle" size={20} color="red" />
                    )}
                  </Text>
                  <Text style={styles.modalText}>
                    Maggiorazione td:{" "}
                    {selectedTurnInfo.dettagli.td ? (
                      <Icon name="check-circle" size={20} color="green" />
                    ) : (
                      <Icon name="times-circle" size={20} color="red" />
                    )}
                  </Text>
                </>
              ) : (
                <Text style={styles.modalText}>Nessun turno disponibile</Text>
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Chiudi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff"
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10
  },
  selectorButton: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 10
  },
  selectorText: {
    fontSize: 16
  },
  calendar: {
    marginBottom: 20
  },
  dayContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: Dimensions.get("window").width / 7,
    height: 50
  },
  dayText: {
    fontSize: 16
  },
  disabledDayText: {
    color: "#ccc"
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginTop: 2
  },
  badgeText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "bold"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20
  },
  personModalContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    maxHeight: "80%"
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 10
  },
  personList: {
    maxHeight: 200
  },
  personItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee"
  },
  personText: {
    fontSize: 16
  },
  closeButtonModal: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center"
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    maxHeight: "80%"
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10
  },
  modalText: {
    fontSize: 16,
    marginBottom: 8
  },
  trainItem: {
    fontSize: 16,
    marginLeft: 10,
    marginVertical: 2
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: "orange",
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center"
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  }
});

export default Calendario;
