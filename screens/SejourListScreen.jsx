import React, { useEffect, useState } from 'react';
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
// URL de l'API fixe remplaçant la variable d'environnement
const API_URL = 'http://192.168.1.155:8000/api';

const { width, height } = Dimensions.get('window');

const SejourListScreen = ({ navigation }) => {
  const [sejours, setSejours] = useState([]);
  const [filteredSejours, setFilteredSejours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [selectedSejour, setSelectedSejour] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getAuthToken = async () => {
    try {
      return await SecureStore.getItemAsync('authToken');
    } catch (error) {
      console.error('Error retrieving token:', error);
      return null;
    }
  };

  const fetchSejours = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        navigation.navigate('Login');
        return;
      }
      const url = `${API_URL}/sejours`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 401) {
        await SecureStore.deleteItemAsync('authToken');
        navigation.navigate('Login');
        return;
      }
      if (!response.ok) throw new Error('Erreur de chargement des données');
      const data = await response.json();
      const sejoursList = data.member || data;
      setSejours(sejoursList);
      setFilteredSejours(sejoursList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const token = await getAuthToken();
      if (!token) {
        navigation.navigate('Login');
      } else {
        fetchSejours();
      }
    };
    checkAuthAndFetch();
  }, []);

  // 🔍 Filtrage local à chaque changement de `searchQuery`
  useEffect(() => {
    if (!searchQuery) {
      setFilteredSejours(sejours);
      return;
    }

    const query = searchQuery.toLowerCase();

    const filtered = sejours.filter((item) => {
      const nom = item.patient?.nom?.toLowerCase() || '';
      const prenom = item.patient?.prenom?.toLowerCase() || '';
      const service = item.lit?.chambre?.service?.nomserv?.toLowerCase() || '';
      return (
        nom.includes(query) ||
        prenom.includes(query) ||
        service.includes(query)
      );
    });

    setFilteredSejours(filtered);
  }, [searchQuery, sejours]);

  const handleDelete = async (id) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        navigation.navigate('Login');
        return;
      }
      const response = await fetch(`${API_URL}/sejours/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 401) {
        await SecureStore.deleteItemAsync('authToken');
        navigation.navigate('Login');
        return;
      }
      if (!response.ok) throw new Error('Échec de la suppression');
      const updatedSejours = filteredSejours.filter(s => s.id !== id);
      setFilteredSejours(updatedSejours);
      setSejours(sejours.filter(s => s.id !== id));
      Alert.alert('Succès', 'Séjour supprimé avec succès');
    } catch (err) {
      Alert.alert('Erreur', err.message);
    } finally {
      setDeleteVisible(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const renderSejourItem = ({ item }) => (
    <View style={styles.sejourCard}>
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>Arrivé: {formatDate(item.dtear)}</Text>
        {item.dtedep && (
          <Text style={styles.dateText}>Départ: {formatDate(item.dtedep)}</Text>
        )}
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.patientInfo}>
          <Text style={styles.patientName}>
            {item.patient?.prenom} {item.patient?.nom}
          </Text>
          <Text style={styles.serviceText}>
            {item.lit?.chambre?.service?.nomserv}
          </Text>
        </View>
        <View style={styles.locationInfo}>
          <View style={styles.locationRow}>
            <Icon name="bed" size={18} color="#4B5563" />
            <Text style={styles.detailText}>Lit {item.lit?.numlit}</Text>
          </View>
          <View style={styles.locationRow}>
            <Icon name="meeting-room" size={18} color="#4B5563" />
            <Text style={styles.detailText}>
              Chambre {item.lit?.chambre?.numchambre}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('SejourEdit', { sejour: item })}
        >
          <Icon name="edit" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.validateButton]}
          onPress={() => navigation.navigate('ValiderArriverScreen', { id: item.id })}
        >
          <Icon name="check-circle" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => {
            setSelectedSejour(item.id);
            setDeleteVisible(true);
          }}
        >
          <Icon name="delete" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Chargement des séjours...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestion des Séjours</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AjouterSejour')}
        >
          <Icon name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par nom, prénom ou service..."
          placeholderTextColor="#6B7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Icon name="search" size={24} color="#6B7280" style={styles.searchIcon} />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={24} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <FlatList
        data={filteredSejours}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSejourItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="hotel" size={60} color="#CBD5E1" />
            <Text style={styles.emptyText}>Aucun séjour trouvé</Text>
          </View>
        }
      />

      {/* Modal suppression */}
      <Modal
        visible={deleteVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Icon name="warning" size={32} color="#DC2626" />
              <Text style={styles.modalTitle}>Confirmer la suppression</Text>
            </View>
            <Text style={styles.modalBody}>
              Êtes-vous sûr de vouloir supprimer définitivement ce séjour ?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteVisible(false)}
              >
                <Text style={styles.buttonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => handleDelete(selectedSejour)}
              >
                <Text style={[styles.buttonText, styles.confirmText]}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: '700' },
  addButton: {
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 50,
    elevation: 2,
  },
  searchContainer: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 2,
  },
  searchInput: { flex: 1, height: 50, color: '#1F2937', fontSize: 16, paddingLeft: 40 },
  searchIcon: { position: 'absolute', left: 16 },
  sejourCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 16,
    elevation: 2,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dateText: { color: '#6B7280', fontSize: 14, fontWeight: '500' },
  patientInfo: {},
  patientName: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  serviceText: { color: '#3B82F6', fontWeight: '500', fontSize: 14 },
  infoContainer: { marginTop: 12 },
  locationInfo: { marginTop: 12, gap: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { color: '#4B5563', fontSize: 14 },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  viewButton: { backgroundColor: '#3B82F6' },
  editButton: { backgroundColor: '#10B981' },
  validateButton: { backgroundColor: '#34D399' },
  deleteButton: { backgroundColor: '#EF4444' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: { backgroundColor: 'white', width: '80%', borderRadius: 16, padding: 20 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
  modalBody: { color: '#6B7280', fontSize: 16, lineHeight: 24, marginBottom: 24 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16 },
  modalButton: { paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8 },
  cancelButton: { backgroundColor: '#F3F4F6' },
  confirmButton: { backgroundColor: '#EF4444' },
  buttonText: { fontWeight: '600', fontSize: 16 },
  confirmText: { color: 'white' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
  loadingText: { color: '#3B82F6', fontSize: 16, fontWeight: '500' },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEE2E2',
    padding: 16,
    marginHorizontal: 20,
    borderRadius: 12,
    marginTop: 16,
  },
  errorText: { color: '#DC2626', fontSize: 14, flex: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 300, gap: 16 },
  emptyText: { color: '#9CA3AF', fontSize: 16, fontWeight: '500' },
  listContent: { paddingBottom: 20 },
});

export default SejourListScreen;
