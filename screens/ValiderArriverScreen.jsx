import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { API_URL } from '@env';

const ValiderArriverScreen = ({ route, navigation }) => {
  const { id } = route.params;
  const [selectedValue, setSelectedValue] = useState('Non');
  const [loading, setLoading] = useState(false);
  const [sejour, setSejour] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [comment, setComment] = useState('');

  const getAuthToken = async () => {
    try {
      return await SecureStore.getItemAsync('authToken');
    } catch (err) {
      console.error('Erreur lors de la récupération du token', err);
      return null;
    }
  };

  const fetchSejourDetail = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        navigation.navigate('Login');
        return;
      }
      const response = await fetch(`${API_URL}/sejours/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 401) {
        await SecureStore.deleteItemAsync('authToken');
        navigation.navigate('Login');
        return;
      }
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des détails du séjour");
      }
      const data = await response.json();
      setSejour(data);
      setComment(data.commentaire || '');
      setSelectedValue(data.arrive || 'Non');
    } catch (err) {
      Alert.alert('Erreur', err.message);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchSejourDetail();
  }, []);

  const handleValidate = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) {
        navigation.navigate('Login');
        return;
      }
      
      const response = await fetch(`${API_URL}/sejours/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/merge-patch+json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          arrive: selectedValue,
          commentaire: comment 
        }),
      });

      if (response.status === 401) {
        await SecureStore.deleteItemAsync('authToken');
        navigation.navigate('Login');
        return;
      }
      if (!response.ok) throw new Error("Échec de la mise à jour du séjour");
      
      Alert.alert('Succès', "Les informations ont bien été mises à jour");
      navigation.goBack();
    } catch (err) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Chargement des détails du séjour...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Valider l'arrivée du séjour</Text>

        {sejour && sejour.patient ? (
          <View style={styles.patientInfoContainer}>
            <Text style={styles.infoLabel}>Patient :</Text>
            <Text style={styles.infoValue}>
              {sejour.patient.prenom} {sejour.patient.nom}
            </Text>

            <Text style={styles.infoLabel}>Service :</Text>
            <View style={styles.serviceBadge}>
              <Text style={styles.serviceText}>
                {sejour.lit?.chambre?.service?.nomserv || 'Non spécifié'}
              </Text>
            </View>

            <Text style={styles.infoLabel}>Lit :</Text>
            <Text style={styles.infoValue}>
              Chambre {sejour.lit?.chambre?.numchambre} - Lit {sejour.lit?.numlit}
            </Text>
          </View>
        ) : (
          <Text style={styles.infoValue}>Aucune information disponible</Text>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Patient Arrivé ?</Text>
          <TouchableOpacity 
            style={styles.pickerButton}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.pickerButtonText}>{selectedValue}</Text>
            <Icon name="arrow-drop-down" size={24} color="#1F2937" />
          </TouchableOpacity>

          <Modal
            visible={showPicker}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Picker
                  selectedValue={selectedValue}
                  onValueChange={(itemValue) => setSelectedValue(itemValue)}
                >
                  <Picker.Item label="Oui" value="Oui" />
                  <Picker.Item label="Non" value="Non" />
                </Picker>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => setShowPicker(false)}
                >
                  <Text style={styles.confirmButtonText}>Confirmer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>

        <View style={styles.commentContainer}>
          <Text style={styles.label}>Commentaire :</Text>
          <TextInput
            style={styles.commentInput}
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
            placeholder="Ajouter un commentaire..."
            placeholderTextColor="#9CA3AF"
          />
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
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  scrollContainer: { padding: 16 },
  backButton: { marginBottom: 10 },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  patientInfoContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    marginBottom: 20,
    gap: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  infoValue: { 
    fontSize: 16, 
    color: '#1F2937',
    marginBottom: 8,
  },
  serviceBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  serviceText: {
    color: '#1D4ED8',
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
    marginBottom: 8,
  },
  pickerButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#1F2937',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  confirmButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  commentContainer: {
    marginBottom: 20,
  },
  commentInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#1F2937',
    elevation: 2,
  },
  validateButton: {
    backgroundColor: '#34D399',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  validateButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#3B82F6' },
});

export default ValiderArriverScreen;