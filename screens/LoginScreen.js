import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.22:3000'; 

const LoginScreen = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Validation des champs
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    // Validation basique de l'email
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password
      });

      // Stockage du token et mise à jour de l'état d'authentification
      await AsyncStorage.setItem('token', response.data.token);
      setIsAuthenticated(true);
      
    } catch (error) {
      let errorMessage = 'Erreur de connexion';
      
      if (error.response) {
        
        switch (error.response.status) {
          case 400:
            errorMessage = 'Données invalides';
            break;
          case 401:
            errorMessage = 'Identifiants incorrects';
            break;
          case 403:
            errorMessage = 'Compte non vérifié';
            break;
          case 500:
            errorMessage = 'Erreur serveur';
            break;
          default:
            errorMessage = error.response.data.error || errorMessage;
        }
      } else if (error.request) {
        errorMessage = 'Le serveur ne répond pas';
      }
      
      Alert.alert('Erreur', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
      
      <TextInput
        placeholder="Adresse email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        placeholder="Mot de passe"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={styles.input}
      />
      
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button 
          title="Se connecter" 
          onPress={handleLogin} 
          disabled={isLoading}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
});

export default LoginScreen;