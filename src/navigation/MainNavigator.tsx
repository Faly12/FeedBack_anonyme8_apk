import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CreateSondageScreen from '../screens/sondage/CreateSondageScreen';
import DetailSondageScreen from '../screens/sondage/DetailSondageScreen';
import ListeSondageScreen from '../screens/sondage/ListeSondageScreen';
import ResultatScreen from '../screens/sondage/ResultatScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function SondageStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTitleStyle: { color: '#111827', fontWeight: '700' },
        headerShadowVisible: false,
      }}>
      <Stack.Screen name="ListeSondage" component={ListeSondageScreen} options={{ title: 'Sondages' }} />
      <Stack.Screen name="DetailSondage" component={DetailSondageScreen} options={{ title: 'Détails' }} />
      <Stack.Screen name="CreateSondage" component={CreateSondageScreen} options={{ title: 'Créer un sondage' }} />
      <Stack.Screen name="Resultat" component={ResultatScreen} options={{ title: 'Résultats' }} />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#0f766e',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: { borderTopColor: '#e5e7eb' },
        tabBarIcon: ({ color, size }) => {
          const iconName = route.name === 'Home' ? 'list-outline' : 'person-circle-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}>
      <Tab.Screen name="Home" component={SondageStack} options={{ headerShown: false, title: 'Sondages' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
}
