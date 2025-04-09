import React, { useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';

const BASE_URL = 'http://192.168.1.135:8000/api';

const ValiderArriverScreen = ({ route, navigation }) => {
  // Récupération de l'identifiant du séjour passé via la navigation
  const { id } = route.params;
  const [selectedValue, setSelectedValue] = useState('Non');
  const [loading, setLoading] = useState(false);

  const getAuthToken = async () => {
    try {
      return await SecureStore.getItemAsync('authToken');
    } catch (err) {
      console.error('Erreur lors de la récupération du token', err);
      return null;
    }
  };

  const handleValidate = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) {
        navigation.navigate('Login');
        return;
      }
      // Mise à jour partielle du champ "arrive" du séjour via PATCH
      const response = await fetch(`${BASE_URL}/sejours/${id}`, {
        method: 'PATCH',
        headers: {
          // Utilise l'en-tête merge-patch pour une mise à jour partielle
          'Content-Type': 'application/merge-patch+json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ arrive: selectedValue }),
      });
      if (response.status === 401) {
        await SecureStore.deleteItemAsync('authToken');
        navigation.navigate('Login');
        return;
      }
      if (!response.ok) throw new Error("Échec de la validation d'arrivée");
      Alert.alert('Succès', "L'état d'arrivée a bien été mis à jour");
      navigation.goBack();
    } catch (err) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Bouton de retour */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={24} color="#3B82F6" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Valider l'arrivée du séjour</Text>
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Patient Arrivé ?</Text>
        <Picker
          selectedValue={selectedValue}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedValue(itemValue)}
        >
          <Picker.Item label="Oui" value="Oui" />
          <Picker.Item label="Non" value="Non" />
        </Picker>
      </View>
      <TouchableOpacity
        style={styles.validateButton}
        onPress={handleValidate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.validateButtonText}>Valider</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', padding: 16 },
  backButton: { marginBottom: 10 },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    marginBottom: 20,
  },
  label: { fontSize: 16, color: '#3B82F6', fontWeight: '600', marginBottom: 8 },
  picker: { height: 50, width: '100%' },
  validateButton: {
    backgroundColor: '#34D399',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  validateButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});

export default ValiderArriverScreen;
