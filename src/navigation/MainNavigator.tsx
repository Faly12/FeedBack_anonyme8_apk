import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HeaderRight } from "../components/HeaderRight";
import ProfileScreen from "../screens/profile/ProfileScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import CreateSondageScreen from "../screens/sondage/CreateSondageScreen";
import DetailSondageScreen from "../screens/sondage/DetailSondageScreen";
import ListeSondageScreen from "../screens/sondage/ListeSondageScreen";
import ResultatScreen from "../screens/sondage/ResultatScreen";
import EditSondageScreen from "../screens/sondage/EditSondageScreen"; // Si vous voulez un écran séparé
import { useAppTheme } from "../theme/AppThemeContext";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function SondageStack() {
  const { theme } = useAppTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: theme.background },
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
        headerTitleStyle: { color: theme.text, fontWeight: "700" },
        headerRight: () => <HeaderRight />,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="ListeSondage"
        component={ListeSondageScreen}
        options={{ title: "Sondages" }}
      />
      <Stack.Screen
        name="DetailSondage"
        component={DetailSondageScreen}
        options={{ title: "Détails" }}
      />
      <Stack.Screen
        name="CreateSondage"
        component={CreateSondageScreen}
        options={{ title: "Créer un sondage" }}
      />
      <Stack.Screen
        name="Resultat"
        component={ResultatScreen}
        options={{ title: "Résultats" }}
      />
      {/* Optionnel: si vous voulez un écran de gestion séparé */}
      <Stack.Screen
        name="EditSondage"
        component={EditSondageScreen}
        options={{ title: "Modifier le sondage" }}
      />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  const { theme } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
        headerTitleStyle: { color: theme.text, fontWeight: "700" },
        headerRight: () => <HeaderRight />,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.tabInactive,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
        },
        tabBarIcon: ({ color, size }) => {
          const iconName =
            route.name === "Home"
              ? "list-outline"
              : route.name === "Settings"
                ? "settings-outline"
                : "person-circle-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={SondageStack}
        options={{ headerShown: false, title: "Sondages" }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: "Parametres" }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: "Profil" }}
      />
    </Tab.Navigator>
  );
}