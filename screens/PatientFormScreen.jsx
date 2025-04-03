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
  Alert,
  Platform
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
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
    if (!formData.nom.trim() || !formData.prenom.trim() || !formData.dtenaiss.trim()) {
      Alert.alert('Champs requis', 'Tous les champs doivent être remplis');
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.dtenaiss)) {
      Alert.alert('Format invalide', 'La date doit être au format AAAA-MM-JJ');
      return;
    }

    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) throw new Error('Authentification requise');

      const url = patient 
        ? `http://192.168.1.113:8000/api/patients/${patient.id}`
        : 'http://192.168.1.113:8000/api/patients';
      
      const response = await fetch(url, {
        method: patient ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur de serveur');
      }
      
      navigation.goBack();
    } catch (err) {
      Alert.alert('Erreur', err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="#2d4059" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              {patient ? 'Modifier Patient' : 'Nouveau Patient'}
            </Text>
            <Icon name="person" size={26} color="#2d4059" style={styles.titleIcon} />
          </View>
        </View>
        <View style={styles.formContainer}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nom</Text>
            <TextInput
              style={styles.input}
              value={formData.nom}
              onChangeText={text => setFormData({...formData, nom: text})}
              placeholder="Entrez le nom"
              placeholderTextColor="#9a9a9a"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Prénom</Text>
            <TextInput
              style={styles.input}
              value={formData.prenom}
              onChangeText={text => setFormData({...formData, prenom: text})}
              placeholder="Entrez le prénom"
              placeholderTextColor="#9a9a9a"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date de naissance</Text>
            <TextInput
              style={styles.input}
              placeholder="AAAA-MM-JJ"
              placeholderTextColor="#9a9a9a"
              value={formData.dtenaiss}
              onChangeText={text => setFormData({...formData, dtenaiss: text})}
              keyboardType="numbers-and-punctuation"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              {patient ? 'Sauvegarder' : 'Créer Patient'}
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
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    marginRight: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2d4059',
    marginRight: 10,
  },
  titleIcon: {
    marginTop: 3,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4a4a4a',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#f1f3f5',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#2d4059',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  submitButton: {
    backgroundColor: '#70B2F9',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#3f51b5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  disabledButton: {
    backgroundColor: '#a5b4fc',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default PatientFormScreen;