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
import * as SecureStore from 'expo-secure-store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { debounce } from 'lodash';

const { width, height } = Dimensions.get('window');

const PatientListScreen = ({ navigation }) => {
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
      const token = await SecureStore.getItemAsync('authToken');
      const url = `http://172.20.10.2:8000/api/patients?search=${query}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Erreur de chargement');

      const data = await response.json();
      setPatients(data);
      setFilteredPatients(
        query
          ? data.filter(
              (patient) =>
                patient.prenom.toLowerCase().includes(query.toLowerCase()) ||
                patient.nom.toLowerCase().includes(query.toLowerCase())
            )
          : data
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((query) => fetchPatients(query), 800),
    []
  );

  useEffect(() => {
    if (searchQuery === '') {
      fetchPatients('');
    } else {
      setSearchLoading(true);
      debouncedSearch(searchQuery);
    }
  }, [searchQuery]);

  const handleDelete = async (id) => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const response = await fetch(`http://172.20.10.2:8000/api/patients/${id}`, {
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
    <View style={styles.patientCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.prenom[0]}
          {item.nom[0]}
        </Text>
      </View>

      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>
          {item.prenom} {item.nom}
        </Text>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Icon name="fingerprint" size={16} color="#6B7280" />
            <Text style={styles.detailText}>{item.id}</Text>
          </View>

          <View style={styles.detailItem}>
            <Icon name="cake" size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              {new Date(item.dtenaiss).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.iconButton, styles.viewButton]}
          onPress={() => navigation.navigate('PatientView', { id: item.id })}
          activeOpacity={0.6}>
          <Icon name="visibility" size={20} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, styles.editButton]}
          onPress={() => navigation.navigate('PatientEdit', { patient: item })}
          activeOpacity={0.6}>
          <Icon name="edit" size={20} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, styles.deleteButton]}
          onPress={() => {
            setSelectedPatient(item.id);
            setDeleteVisible(true);
          }}
          activeOpacity={0.7}>
          <Icon name="delete" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Chargement des patients...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Patients</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('PatientCreate')}>
          <Icon name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un patient..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchLoading && <ActivityIndicator style={styles.searchLoader} color="#6366f1" />}
      </View>

      {error && (
        <View style={styles.errorCard}>
          <Icon name="error" size={24} color="#EF4444" />
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
            <Icon name="people-outline" size={60} color="#CBD5E1" />
            <Text style={styles.emptyText}>Aucun patient trouvé</Text>
          </View>
        }
      />

      <Modal
        visible={deleteVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Icon name="warning" size={32} color="#EF4444" />
              <Text style={styles.modalTitle}>Confirmer la suppression</Text>
            </View>
            <Text style={styles.modalText}>
              Êtes-vous sûr de vouloir supprimer définitivement ce patient ?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteVisible(false)}>
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => handleDelete(selectedPatient)}>
                <Text style={styles.confirmButtonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Les styles restent identiques à la version précédente
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#4f46e5',
    borderBottomRightRadius: 24,
    borderBottomLeftRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  addButton: {
    backgroundColor: '#10B981',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  searchContainer: {
    marginHorizontal: 20,
    marginTop: -12,
    backgroundColor: '#FFF',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    height: 52,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    paddingLeft: 40,
    fontFamily: 'System',
  },
  searchIcon: {
    position: 'absolute',
    left: 20,
    zIndex: 1,
  },
  patientCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7381F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  detailsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13.5,
    color: '#64748b',
    letterSpacing: -0.1,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginLeft: 10,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  viewButton: {
    backgroundColor: '#4B8BF3',
  },
  editButton: {
    backgroundColor: '#2BD99F',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    width: width * 0.82,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1e293b',
    marginLeft: 12,
  },
  modalText: {
    color: '#64748b',
    fontSize: 15,
    lineHeight: 22,
    marginVertical: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
  },
  cancelButtonText: {
    color: '#64748B',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#EF4444',
  },
  confirmButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: height * 0.5,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
    marginTop: 14,
    fontWeight: '500',
  },
});

export default PatientListScreen;