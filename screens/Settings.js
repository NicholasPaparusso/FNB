import React, { useContext, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Switch } from "react-native";
import { ThemeContext } from "../theme/ThemeContext";
import themes from "../theme/theme";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";

const Settings = () => {
  const { theme, changeTheme, toggleDarkMode, isDarkMode } = useContext(ThemeContext);
  const [selectedTheme, setSelectedTheme] = useState(theme.primary);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(theme.background, { duration: 300 }),
  }));

  const handleThemeChange = (themeName) => {
    setSelectedTheme(themes[themeName].light.primary);
    changeTheme(themeName, isDarkMode);
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={[styles.title, { color: theme.text }]}>Scegli un colore per l'app:</Text>

      {/* Griglia di colori */}
      <FlatList
        data={Object.keys(themes)}
        keyExtractor={(item) => item}
        numColumns={5}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.colorCircle,
              { backgroundColor: themes[item].light.primary },
              selectedTheme === themes[item].light.primary && styles.selectedCircle,
            ]}
            onPress={() => handleThemeChange(item)}
          />
        )}
      />

      {/* Interruttore Modalità Scura */}
      {/* <View style={styles.settingRow}>
        <Text style={[styles.text, { color: theme.text }]}>Modalità Scura</Text>
        <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
      </View> */}

    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  grid: {
    justifyContent: "center",
  },
  colorCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedCircle: {
    borderColor: "#000",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  selectedPreview: {
    marginTop: 20,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  selectedText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Settings;
