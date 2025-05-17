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
  TextInput,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import * as SecureStore from 'expo-secure-store';
// URL de l'API fixe remplaçant la variable d'environnement
const API_URL = 'http://192.168.1.155:8000/api';

const AjouterSejourScreen = ({ navigation }) => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedChambre, setSelectedChambre] = useState(null);
  const [selectedLit, setSelectedLit] = useState(null);
  const [dtear, setDtear] = useState(new Date());
  const [dtedep, setDtedep] = useState(null);
  const [arrive, setArrive] = useState('Non');
  const [commentaire, setCommentaire] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDepDatePicker, setShowDepDatePicker] = useState(false);
  const [patients, setPatients] = useState([]);
  const [services, setServices] = useState([]);
  const [chambres, setChambres] = useState([]);
  const [lits, setLits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPatientPicker, setShowPatientPicker] = useState(false);
  const [showServicePicker, setShowServicePicker] = useState(false);
  const [showChambrePicker, setShowChambrePicker] = useState(false);
  const [showLitPicker, setShowLitPicker] = useState(false);

  const getAuthToken = async () => {
    try {
      return await SecureStore.getItemAsync('authToken');
    } catch (err) {
      console.error('Erreur lors de la récupération du token', err);
      return null;
    }
  };

  // Au chargement, récupérer patients et services
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getAuthToken();
        if (!token) {
          navigation.navigate('Login');
          return;
        }

        // Récupération des patients
        const patientsResponse = await fetch(`${API_URL}/patients`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const patientsData = await patientsResponse.json();
        setPatients(patientsData);

        // Récupération des services
        const servicesResponse = await fetch(`${API_URL}/services`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const servicesData = await servicesResponse.json();
        setServices(servicesData);
      } catch (err) {
        Alert.alert('Erreur', 'Échec du chargement des données');
      }
    };

    fetchData();
  }, []);

  // Lorsque le service est sélectionné, récupérer les chambres correspondantes
  useEffect(() => {
    const fetchChambres = async () => {
      if (!selectedService) return;
      try {
        const token = await getAuthToken();
        const chambresResponse = await fetch(`${API_URL}/services/${selectedService}/chambres`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const chambresData = await chambresResponse.json();
        setChambres(chambresData);
      } catch (err) {
        Alert.alert('Erreur', 'Échec du chargement des chambres');
      }
    };

    fetchChambres();
  }, [selectedService]);

  // Lorsque la chambre est sélectionnée, récupérer les lits disponibles de la chambre
  useEffect(() => {
    const fetchLits = async () => {
      if (!selectedChambre) return;
      try {
        const token = await getAuthToken();
        const litsResponse = await fetch(`${API_URL}/chambres/${selectedChambre}/lits/disponibles`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const litsData = await litsResponse.json();
        setLits(litsData);
      } catch (err) {
        Alert.alert('Erreur', 'Échec du chargement des lits');
      }
    };

    fetchLits();
  }, [selectedChambre]);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDtear(selectedDate);
    }
  };

  const handleDepDateChange = (event, selectedDate) => {
    setShowDepDatePicker(false);
    if (selectedDate) {
      setDtedep(selectedDate);
    }
  };

  const handleSubmit = async () => {
    if (!selectedPatient || !selectedService || !selectedChambre || !selectedLit) {
      Alert.alert('Erreur', 'Veuillez sélectionner un patient, un service, une chambre et un lit');
      return;
    }

    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) {
        navigation.navigate('Login');
        return;
      }

      const newSejour = {
        patient: `/api/patients/${selectedPatient}`,
        service: `/api/services/${selectedService}`,
        chambre: `/api/chambres/${selectedChambre}`,
        lit: `/api/lits/${selectedLit}`,
        dtear: dtear.toISOString(),
        dtedep: dtedep?.toISOString(),
        arrive,
        commentaire,
      };

      const response = await fetch(`${API_URL}/sejours`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSejour),
      });

      if (!response.ok) throw new Error('Échec de la création du séjour');
      
      Alert.alert('Succès', 'Séjour créé avec succès');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#3B82F6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouveau Séjour</Text>

        {/* Sélection du patient */}
        <TouchableOpacity
          style={styles.inputField}
          onPress={() => setShowPatientPicker(true)}>
          <Text style={selectedPatient ? styles.inputText : styles.placeholderText}>
            {selectedPatient 
              ? patients.find(p => p.id === selectedPatient)?.prenom + ' ' + 
                patients.find(p => p.id === selectedPatient)?.nom
              : 'Sélectionner un patient'}
          </Text>
          <Icon name="arrow-drop-down" size={24} color="#6B7280" />
        </TouchableOpacity>

        {/* Sélection du service */}
        <TouchableOpacity
          style={styles.inputField}
          onPress={() => setShowServicePicker(true)}>
          <Text style={selectedService ? styles.inputText : styles.placeholderText}>
            {selectedService 
              ? services.find(s => s.id === selectedService)?.nomserv
              : 'Sélectionner un service'}
          </Text>
          <Icon name="arrow-drop-down" size={24} color="#6B7280" />
        </TouchableOpacity>

        {/* Sélection de la chambre */}
        <TouchableOpacity
          style={styles.inputField}
          onPress={() => {
            if (!selectedService) {
              Alert.alert('Erreur', 'Veuillez d’abord sélectionner un service');
              return;
            }
            setShowChambrePicker(true);
          }}>
          <Text style={selectedChambre ? styles.inputText : styles.placeholderText}>
            {selectedChambre 
              ? `Chambre ${chambres.find(c => c.id === selectedChambre)?.numchambre}`
              : 'Sélectionner une chambre'}
          </Text>
          <Icon name="arrow-drop-down" size={24} color="#6B7280" />
        </TouchableOpacity>

        {/* Sélection du lit */}
        <TouchableOpacity
          style={styles.inputField}
          onPress={() => {
            if (!selectedChambre) {
              Alert.alert('Erreur', 'Veuillez d’abord sélectionner une chambre');
              return;
            }
            setShowLitPicker(true);
          }}>
          <Text style={selectedLit ? styles.inputText : styles.placeholderText}>
            {selectedLit 
              ? `Lit ${lits.find(l => l.id === selectedLit)?.numlit}`
              : 'Sélectionner un lit'}
          </Text>
          <Icon name="arrow-drop-down" size={24} color="#6B7280" />
        </TouchableOpacity>

        {/* Date d'entrée */}
        <TouchableOpacity
          style={styles.inputField}
          onPress={() => setShowDatePicker(true)}>
          <Text style={styles.inputText}>
            {dtear.toLocaleDateString('fr-FR')}
          </Text>
          <Icon name="event" size={24} color="#6B7280" />
        </TouchableOpacity>

        {/* Date de sortie */}
        <TouchableOpacity
          style={styles.inputField}
          onPress={() => setShowDepDatePicker(true)}>
          <Text style={styles.inputText}>
            {dtedep ? dtedep.toLocaleDateString('fr-FR') : 'Sélectionner une date de sortie (optionnel)'}
          </Text>
          <Icon name="event" size={24} color="#6B7280" />
        </TouchableOpacity>

        {/* Sélecteur d'arrivée */}
        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Patient arrivé ?</Text>
          <Picker
            selectedValue={arrive}
            onValueChange={(itemValue) => setArrive(itemValue)}
            style={styles.picker}>
            <Picker.Item label="Oui" value="Oui" />
            <Picker.Item label="Non" value="Non" />
          </Picker>
        </View>

        {/* Commentaire */}
        <TextInput
          style={styles.commentInput}
          placeholder="Commentaire (optionnel)"
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={4}
          value={commentaire}
          onChangeText={setCommentaire}
        />

        {/* Bouton de soumission */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Créer le séjour</Text>
          )}
        </TouchableOpacity>

        {/* Modals pour les sélecteurs */}
        {/* Modal Patient */}
        <Modal visible={showPatientPicker} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Picker
                selectedValue={selectedPatient}
                onValueChange={(itemValue) => {
                  setSelectedPatient(itemValue);
                  setShowPatientPicker(false);
                }}>
                {patients.map((patient) => (
                  <Picker.Item
                    key={patient.id}
                    label={`${patient.prenom} ${patient.nom}`}
                    value={patient.id}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </Modal>

        {/* Modal Service */}
        <Modal visible={showServicePicker} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Picker
                selectedValue={selectedService}
                onValueChange={(itemValue) => {
                  setSelectedService(itemValue);
                  // Réinitialiser chambre et lit si le service change
                  setSelectedChambre(null);
                  setSelectedLit(null);
                  setChambres([]);
                  setLits([]);
                  setShowServicePicker(false);
                }}>
                {services.map((service) => (
                  <Picker.Item
                    key={service.id}
                    label={service.nomserv}
                    value={service.id}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </Modal>

        {/* Modal Chambre */}
        <Modal visible={showChambrePicker} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Picker
                selectedValue={selectedChambre}
                onValueChange={(itemValue) => {
                  setSelectedChambre(itemValue);
                  // Réinitialiser le lit si la chambre change
                  setSelectedLit(null);
                  setLits([]);
                  setShowChambrePicker(false);
                }}>
                {chambres.map((chambre) => (
                  <Picker.Item
                    key={chambre.id}
                    label={`Chambre ${chambre.numchambre}`}
                    value={chambre.id}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </Modal>

        {/* Modal Lit */}
        <Modal visible={showLitPicker} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Picker
                selectedValue={selectedLit}
                onValueChange={(itemValue) => {
                  setSelectedLit(itemValue);
                  setShowLitPicker(false);
                }}>
                {lits.map((lit) => (
                  <Picker.Item
                    key={lit.id}
                    label={`Lit ${lit.numlit}`}
                    value={lit.id}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </Modal>

        {/* Date Pickers */}
        {showDatePicker && (
          <DateTimePicker
            value={dtear}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {showDepDatePicker && (
          <DateTimePicker
            value={dtedep || new Date()}
            mode="date"
            display="default"
            onChange={handleDepDateChange}
          />
        )}
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
    marginBottom: 20,
  },
  inputField: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
  },
  inputText: {
    fontSize: 16,
    color: '#1F2937',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
    padding: 16,
  },
  picker: {
    height: 50,
  },
  commentInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 16,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
});

export default AjouterSejourScreen;
