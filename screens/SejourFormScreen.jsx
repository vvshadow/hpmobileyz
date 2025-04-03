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
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
//import DateTimePicker from '@react-native-community/datetimepicker';

const SejourFormScreen = ({ navigation, route }) => {
  const { sejour } = route.params || {};
  const [formData, setFormData] = useState({
    dtear: sejour?.dtear ? new Date(sejour.dtear) : new Date(),
    dtedep: sejour?.dtedep ? new Date(sejour.dtedep) : new Date(),
    patient_id: sejour?.patient_id?.toString() || '',
    lit_id: sejour?.lit_id?.toString() || '',
    commentaire: sejour?.commentaire || '',
    arrive: sejour?.arrive || '',
    sorti: sejour?.sorti || '',
  });
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState({ start: false, end: false });

  const handleDateChange = (event, selectedDate, field) => {
    setShowDatePicker({ ...showDatePicker, [field]: false });
    if (selectedDate) {
      setFormData({ ...formData, [field]: selectedDate });
    }
  };

  const validateForm = () => {
    const requiredFields = ['dtear', 'dtedep', 'patient_id', 'lit_id', 'commentaire'];
    const missingFields = requiredFields.filter(field => !formData[field].toString().trim());
    
    if (missingFields.length > 0) {
      Alert.alert('Champs manquants', 'Tous les champs obligatoires doivent être remplis');
      return false;
    }

    if (formData.dtear >= formData.dtedep) {
      Alert.alert('Dates invalides', 'La date de fin doit être postérieure à la date de début');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const url = sejour 
        ? `http://192.168.1.117:8000/api/sejours/${sejour.id}`
        : 'http://192.168.1.117:8000/api/sejours';

      const payload = {
        ...formData,
        dtear: formData.dtear.toISOString().split('T')[0],
        dtedep: formData.dtedep.toISOString().split('T')[0],
      };

      const response = await fetch(url, {
        method: sejour ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(await response.text());
      
      navigation.goBack();
    } catch (err) {
      Alert.alert('Erreur', err.message || 'Erreur de sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color="#2d4059" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {sejour ? 'Modifier Séjour' : 'Nouveau Séjour'}
          </Text>
        </View>

        <View style={styles.formContainer}>
          {/* Date Inputs */}
          <View style={styles.dateRow}>
            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => setShowDatePicker({ ...showDatePicker, start: true })}
            >
              <Text style={styles.dateText}>
                {formData.dtear.toLocaleDateString()}
              </Text>
              <Icon name="event" size={20} color="#6B7280" />
            </TouchableOpacity>

            <Icon name="arrow-forward" size={24} color="#6B7280" />

            <TouchableOpacity 
              style={styles.dateInput}
              onPress={() => setShowDatePicker({ ...showDatePicker, end: true })}
            >
              <Text style={styles.dateText}>
                {formData.dtedep.toLocaleDateString()}
              </Text>
              <Icon name="event" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {showDatePicker.start && (
            <DateTimePicker
              value={formData.dtear}
              mode="date"
              onChange={(e, d) => handleDateChange(e, d, 'dtear')}
            />
          )}

          {showDatePicker.end && (
            <DateTimePicker
              value={formData.dtedep}
              mode="date"
              onChange={(e, d) => handleDateChange(e, d, 'dtedep')}
            />
          )}

          {/* Autres champs */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ID Patient</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={formData.patient_id}
              onChangeText={text => setFormData({...formData, patient_id: text})}
              placeholder="Entrez l'ID du patient"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>ID Lit</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={formData.lit_id}
              onChangeText={text => setFormData({...formData, lit_id: text})}
              placeholder="Entrez l'ID du lit"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Commentaire</Text>
            <TextInput
              style={[styles.input, { height: 100 }]}
              multiline
              value={formData.commentaire}
              onChangeText={text => setFormData({...formData, commentaire: text})}
              placeholder="Notes médicales..."
            />
          </View>

          <View style={styles.timeRow}>
            <View style={styles.timeInput}>
              <Text style={styles.label}>Heure arrivée</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                value={formData.arrive}
                onChangeText={text => setFormData({...formData, arrive: text})}
              />
            </View>

            <View style={styles.timeInput}>
              <Text style={styles.label}>Heure sortie</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                value={formData.sorti}
                onChangeText={text => setFormData({...formData, sorti: text})}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              {sejour ? 'Mettre à jour' : 'Créer Séjour'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles similaires à PatientFormScreen avec ajustements
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 15,
  },
  timeInput: {
    flex: 1,
  },
});

export default SejourFormScreen;