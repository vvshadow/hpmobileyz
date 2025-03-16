import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator,
  ScrollView, 
  Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PatientFormScreen = ({ navigation, route }) => {
  const { patient } = route.params || {};
  const [formData, setFormData] = useState({
    nom: patient?.nom || '',
    prenom: patient?.prenom || '',
    dtenaiss: patient?.dtenaiss ? new Date(patient.dtenaiss).toISOString().split('T')[0] : '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.nom || !formData.prenom || !formData.dtenaiss) {
      Alert.alert('Erreur', 'Tous les champs sont obligatoires');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const url = patient 
        ? `http://192.168.1.117:8000/api/patients/${patient.id}`
        : 'http://192.168.1.117:8000/api/patients';
      
      const response = await fetch(url, {
        method: patient ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) throw new Error(patient ? 'Échec de la modification' : 'Échec de la création');
      
      navigation.goBack();
    } catch (err) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>

        <Text style={styles.title}>
          {patient ? 'Modifier Patient' : 'Nouveau Patient'}
        </Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Nom</Text>
          <TextInput
            style={styles.input}
            value={formData.nom}
            onChangeText={text => setFormData({...formData, nom: text})}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Prénom</Text>
          <TextInput
            style={styles.input}
            value={formData.prenom}
            onChangeText={text => setFormData({...formData, prenom: text})}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Date de naissance</Text>
          <TextInput
            style={styles.input}
            placeholder="AAAA-MM-JJ"
            value={formData.dtenaiss}
            onChangeText={text => setFormData({...formData, dtenaiss: text})}
          />
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              {patient ? 'Enregistrer' : 'Créer Patient'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  backButton: {
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PatientFormScreen;