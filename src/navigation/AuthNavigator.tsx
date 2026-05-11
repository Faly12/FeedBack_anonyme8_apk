import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HeaderRight } from "../components/HeaderRight";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import { useAppTheme } from "../theme/AppThemeContext";

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
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
        name="Login"
        component={LoginScreen}
        options={{ title: "Connexion" }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: "S'inscrire" }}
      />
    </Stack.Navigator>
  );
}
