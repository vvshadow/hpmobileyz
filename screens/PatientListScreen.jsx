import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
  Dimensions,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { debounce } from 'lodash';

const { width } = Dimensions.get('window');

const PatientsListScreen = ({ navigation }) => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPatients = async (query = '') => {
    try {
      const token = await AsyncStorage.getItem('token');
      const url = `http://192.168.1.117:8000/api/patients?search=${query}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Erreur de chargement');

      const data = await response.json();
      setPatients(data); // Garde tous les patients dans l'état `patients`

      // Filtrer les patients en fonction de la requête de recherche
      if (query) {
        const filtered = data.filter(
          (patient) =>
            patient.prenom.toLowerCase().includes(query.toLowerCase()) ||
            patient.nom.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredPatients(filtered);
      } else {
        // Si la requête est vide, afficher tous les patients
        setFilteredPatients(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((query) => {
      fetchPatients(query);
    }, 800),
    []
  );

  useEffect(() => {
    if (searchQuery === '') {
      // Si le champ est vide, récupérer tous les patients immédiatement
      fetchPatients('');
    } else {
      setSearchLoading(true);
      debouncedSearch(searchQuery);
    }
  }, [searchQuery]);

  const handleDelete = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://192.168.1.117:8000/api/patients/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Échec de la suppression');

      setFilteredPatients(filteredPatients.filter((p) => p.id !== id));
      setDeleteVisible(false);
    } catch (err) {
      Alert.alert('Erreur', err.message);
    }
  };

  const renderPatientItem = ({ item }) => (
    <View style={styles.patientCard} key={item.id}>
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>
          {item.prenom} {item.nom}
        </Text>
        <View style={styles.detailRow}>
          <Icon name="fingerprint" size={14} color="#666" />
          <Text style={styles.patientDetail}> {item.patient_id}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="cake" size={14} color="#666" />
          <Text style={styles.patientDetail}>
            {new Date(item.dtenaiss).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => navigation.navigate('PatientView', { id: item.id })}
          style={styles.actionButton}
        >
          <Icon name="visibility" size={20} color="#007AFF" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('PatientEdit', { patient: item })}
          style={styles.actionButton}
        >
          <Icon name="edit" size={20} color="#4CAF50" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setSelectedPatient(item.id);
            setDeleteVisible(true);
          }}
          style={styles.actionButton}
        >
          <Icon name="delete" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

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
      <View style={styles.header}>
        <Text style={styles.title}>Patients</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('PatientCreate')}
        >
          <Icon name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un patient..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchLoading && <ActivityIndicator style={styles.searchLoader} color="#007AFF" />}
      </View>

      {error && (
        <View style={styles.errorCard}>
          <Icon name="error" size={24} color="#FF3B30" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={filteredPatients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPatientItem}
        contentContainerStyle={styles.scrollContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="group" size={60} color="#E0E0E0" />
            <Text style={styles.emptyText}>Aucun patient trouvé</Text>
          </View>
        }
      />

      <Modal
        visible={deleteVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Icon name="warning" size={28} color="#FF3B30" />
              <Text style={styles.modalTitle}>Supprimer patient</Text>
            </View>
            <Text style={styles.modalText}>Cette action est irréversible. Confirmer la suppression ?</Text>

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
                <Text style={styles.confirmButtonText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FB',
  },
  loadingText: {
    marginTop: 15,
    color: '#666',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A237E',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  searchContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#FFF',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 45,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchLoader: {
    position: 'absolute',
    right: 20,
    top: 13,
  },
  patientCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A237E',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  patientDetail: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginLeft: 10,
  },
  actionButton: {
    padding: 8,
  },
  errorCard: {
    backgroundColor: '#FFEBEE',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  errorText: {
    color: '#FF3B30',
    marginLeft: 10,
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#9E9E9E',
    fontSize: 16,
    marginTop: 15,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    width: width * 0.85,
    borderRadius: 16,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A237E',
    marginLeft: 10,
  },
  modalText: {
    color: '#666',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 25,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 15,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#FF3B30',
  },
  confirmButtonText: {
    color: '#FFF',
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 30,
  },
});

export default PatientsListScreen;