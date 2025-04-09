import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import PatientsListScreen from './screens/PatientListScreen';
import PatientViewScreen from './screens/PatientViewScreen';
import PatientFormScreen from './screens/PatientFormScreen';
import SejourListScreen from './screens/SejourListScreen';
import SejourFormScreen from './screens/SejourFormScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      setIsAuthenticated(!!token);
    };
    checkAuth();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          headerBackTitleVisible: false,
          headerTintColor: '#007AFF',
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen 
              name="Patients" 
              component={PatientsListScreen}
              options={({ navigation }) => ({ 
                title: 'Gestion des Patients',
                headerRight: () => (
                  <TouchableOpacity
                    style={{ marginRight: 15 }}
                    onPress={() => navigation.navigate('Profile')}
                  >
                    <Icon name="person" size={24} color="#007AFF" />
                  </TouchableOpacity>
                )
              })}
            />
            <Stack.Screen 
              name="PatientView" 
              component={PatientViewScreen} 
              options={{ title: 'Détails Patient' }} 
            />
            <Stack.Screen 
              name="PatientCreate" 
              component={PatientFormScreen} 
              options={{ title: 'Nouveau Patient' }} 
            />
            <Stack.Screen 
              name="PatientEdit" 
              component={PatientFormScreen} 
              options={{ title: 'Modifier Patient' }} 
            />
              <Stack.Screen 
              name="SejourList" 
              component={SejourListScreen} 
              options={{ title: 'Détails Séjour' }} 
            />
            <Stack.Screen 
              name="SejourCreate" 
              component={SejourFormScreen} 
              options={{ title: 'Nouveau Séjour' }} 
            />
            <Stack.Screen 
              name="SejourEdit" 
              component={SejourFormScreen} 
              options={{ title: 'Modifier Séjour' }} 
            />

            <Stack.Screen 
              name="Profile" 
              options={{ title: 'Profil Utilisateur' }}
            >
              {(props) => <ProfileScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
            </Stack.Screen>
          </>
        ) : (
          <Stack.Screen 
            name="Login" 
            options={{ headerShown: false }}
          >
            {(props) => <LoginScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};


export default App;
