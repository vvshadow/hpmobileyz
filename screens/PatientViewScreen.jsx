import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity,
  StatusBar,
  Animated
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Icon from 'react-native-vector-icons/MaterialIcons';

const PatientViewScreen = ({ navigation, route }) => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = route.params;
  const [scaleAnim] = useState(new Animated.Value(1));

  const fetchPatient = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const response = await fetch(`http://192.168.1.113:8000/api/patients/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error('Patient non trouvé');
      
      const data = await response.json();
      setPatient(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetchPatient();
  };

  const animatePress = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    });
  };

  const calculateAge = (birthDate) => {
    const diff = Date.now() - new Date(birthDate).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Chargement du patient...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <View style={styles.backButtonCircle}>
              <Icon name="arrow-back" size={24} color="#4F46E5" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.profileHeader}>
            <View style={[styles.profileIcon, styles.profileIconShadow]}>
              <Icon name="person" size={32} color="#FFF" />
            </View>
            <Text style={styles.name}>
              {patient.prenom} <Text style={styles.lastName}>{patient.nom}</Text>
            </Text>
            <Text style={styles.patientId}>ID PATIENT • #{patient.id}</Text>
          </View>
        </View>

        {error ? (
          <View style={styles.errorContent}>
            <Icon name="error-outline" size={50} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={handleRetry}
              activeOpacity={0.8}
            >
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.content}>
            <View style={[styles.infoCard, styles.cardShadow]}>
              <View style={styles.cardHeader}>
                <Icon name="medical-services" size={24} color="#4F46E5" />
                <Text style={styles.cardTitle}>Dossier Médical</Text>
              </View>
              
              <View style={styles.detailContainer}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Informations de base</Text>
                  <View style={styles.detailItem}>
                    <Icon name="calendar-today" size={20} color="#64748B" style={styles.itemIcon} />
                    <View style={styles.itemTextContainer}>
                      <Text style={styles.itemLabel}>Âge</Text>
                      <Text style={styles.itemValue}>
                        {calculateAge(patient.dtenaiss)} ans
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.separator} />

                  <View style={styles.detailItem}>
                    <Icon name="cake" size={20} color="#64748B" style={styles.itemIcon} />
                    <View style={styles.itemTextContainer}>
                      <Text style={styles.itemLabel}>Date de naissance</Text>
                      <Text style={styles.itemValue}>
                        {new Date(patient.dtenaiss).toLocaleDateString('fr-FR')}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.separator} />

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Identifiants</Text>
                  <View style={styles.detailItem}>
                    <Icon name="fingerprint" size={20} color="#64748B" style={styles.itemIcon} />
                    <View style={styles.itemTextContainer}>
                      <Text style={styles.itemLabel}>N° Patient</Text>
                      <Text style={styles.itemValue}>{patient.id || 'Non renseigné'}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity
                style={[styles.editButton, styles.buttonShadow]}
                onPress={() => {
                  animatePress();
                  navigation.navigate('PatientEdit', { patient });
                }}
                activeOpacity={0.9}
              >
                <Icon name="edit-document" size={20} color="#FFF" />
                <Text style={styles.editButtonText}>Éditer le dossier</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748B',
    fontSize: 16,
    fontWeight: '500',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#FFF',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 24,
    zIndex: 2,
  },
  backButtonCircle: {
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    padding: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 16,
  },
  profileIcon: {
    backgroundColor: '#7381F7',
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileIconShadow: {
    shadowColor: '#7381F7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  lastName: {
    color: '#7381F7',
  },
  patientId: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  content: {
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  cardShadow: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginLeft: 12,
  },
  detailContainer: {
    marginTop: 8,
  },
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  itemIcon: {
    marginRight: 16,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 14,
    color: '#7381F7',
    marginBottom: 4,
    fontWeight: '500',
  },
  itemValue: {
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
    marginHorizontal: -24,
  },
  editButton: {
    backgroundColor: '#7381F7',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonShadow: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  retryButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PatientViewScreen;