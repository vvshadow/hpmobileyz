import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity, 
  Modal,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PatientsListScreen = ({ navigation }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const fetchPatients = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://192.168.1.117:8000/api/patients', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Erreur de chargement');
      
      const data = await response.json();
      setPatients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleDelete = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://192.168.1.117:8000/api/patients/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Échec de la suppression');
      
      setPatients(patients.filter(p => p.id !== id));
      setDeleteVisible(false);
    } catch (err) {
      Alert.alert('Erreur', err.message);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement des patients...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Liste des Patients</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('PatientCreate')}
          >
            <Icon name="add" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorCard}>
            <Icon name="error" size={24} color="#FF3B30" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {patients.map(patient => (
          <View key={patient.id} style={styles.patientCard}>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>
                {patient.prenom} {patient.nom}
              </Text>
              <Text style={styles.patientDetail}>ID: {patient.patient_id}</Text>
              <Text style={styles.patientDetail}>
                Né(e) le: {new Date(patient.dtenaiss).toLocaleDateString()}
              </Text>
            </View>
            
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => navigation.navigate('PatientView', { id: patient.id })}
              >
                <Icon name="visibility" size={24} color="#007AFF" />
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => navigation.navigate('PatientEdit', { patient })}
              >
                <Icon name="edit" size={24} color="#4CAF50" />
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => {
                  setSelectedPatient(patient.id);
                  setDeleteVisible(true);
                }}
              >
                <Icon name="delete" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={deleteVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDeleteVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmer la suppression</Text>
            <Text style={styles.modalText}>Êtes-vous sûr de vouloir supprimer ce patient ?</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => handleDelete(selectedPatient)}
              >
                <Text style={styles.confirmButtonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ... (Reprendre les styles de ProfileScreen et ajouter :)
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 50,
  },
  patientCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  patientDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 15,
    marginLeft: 10,
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  errorText: {
    color: '#FF3B30',
    marginLeft: 10,
  },
});

export default PatientsListScreen;