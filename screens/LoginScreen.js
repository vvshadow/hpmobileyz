import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.117:3000'; // Remplacer par votre IP locale

const LoginScreen = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/login`, {
        username,
        password
      });

      await AsyncStorage.setItem('token', response.data.token);
      setIsAuthenticated(true);
    } catch (error) {
      let errorMessage = 'Erreur de connexion';
      if (error.response) {
        errorMessage = error.response.data.error || errorMessage;
      } else if (error.request) {
        errorMessage = 'Le serveur ne répond pas';
      }
      Alert.alert('Erreur', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Connexion</Text>
      <TextInput
        placeholder="Nom d'utilisateur"
        value={username}
        onChangeText={setUsername}
        style={{ marginBottom: 10, padding: 10, borderWidth: 1 }}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Mot de passe"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={{ marginBottom: 20, padding: 10, borderWidth: 1 }}
      />
      <Button 
        title={isLoading ? 'Chargement...' : 'Se connecter'} 
        onPress={handleLogin} 
        disabled={isLoading}
      />
    </View>
  );
};

export default LoginScreen;