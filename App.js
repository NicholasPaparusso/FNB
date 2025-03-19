import React, { useContext, useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import Home from "./screens/Home";
import Calendario from "./screens/Calendario";
import Settings from "./screens/Settings";
import { ThemeContext, ThemeProvider } from "./theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";

const Tab = createBottomTabNavigator();

function MainTabs() {
  const { theme } = useContext(ThemeContext);
  const [navbarColor, setNavbarColor] = useState(theme.primary);

  // Aggiorna dinamicamente il colore della navbar
  useEffect(() => {
    setNavbarColor(theme.primary);
  }, [theme]);

  const animatedTabBarStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(navbarColor, { duration: 300 }), // ✅ Navbar con il colore del tema
  }));

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") iconName = "home";
          else if (route.name === "Calendario") iconName = "calendar";
          else if (route.name === "Impostazioni") iconName = "settings";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: [animatedTabBarStyle, { height: 60, borderTopWidth: 0, backgroundColor: theme.primary }], // ✅ Navbar con il tema.primary
        tabBarActiveTintColor: "#FFFFFF", // ✅ Testo bianco per contrasto
        tabBarInactiveTintColor: "rgba(255,255,255,0.7)", // ✅ Testo leggermente più chiaro per icone inattive
        headerStyle: {
          backgroundColor: theme.primary, // ✅ Header con il colore principale
        },
        headerTintColor: "#FFFFFF", // ✅ Testo bianco per l'header
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Calendario" component={Calendario} />
      <Tab.Screen name="Impostazioni" component={Settings} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <MainTabs />
      </NavigationContainer>
    </ThemeProvider>
  );
}
