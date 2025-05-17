import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as SecureStore from 'expo-secure-store';
// URL de l'API fixe remplaçant la variable d'environnement
const API_URL = 'http://192.168.1.155:8000/api';

const UserViewScreen = ({ navigation, route }) => {
  const { id } = route.params;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserDetails = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const response = await fetch(`${API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Échec du chargement des données');
      
      const data = await response.json();
      setUser(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await SecureStore.getItemAsync('authToken');
              const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              });

              if (!response.ok) throw new Error('Échec de la suppression');
              
              navigation.goBack();
            } catch (err) {
              Alert.alert('Erreur', err.message);
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={40} color="#EF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchUserDetails}
        >
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="#4F46E5" />
          </TouchableOpacity>
          <Text style={styles.title}>Détails de l'utilisateur</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.infoSection}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.label}>Rôles</Text>
            <Text style={styles.value}>{user.roles.join(', ')}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.label}>Vérifié</Text>
            <Text style={styles.value}>
              {user.isVerified ? 'Oui' : 'Non'}
            </Text>
          </View>

     
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => navigation.navigate('UserEdit', { user })}
          >
            <Icon name="edit" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Modifier</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Icon name="delete" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Supprimer</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 10, color: '#4F46E5' },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    marginVertical: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 8,
  },
  retryText: { color: '#FFF', fontWeight: '600' },
  scrollContainer: { paddingBottom: 30 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
  },
  backButton: { marginRight: 16 },
  title: { fontSize: 20, fontWeight: '600', color: '#1F2937' },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    margin: 16,
    padding: 20,
  },
  infoSection: { marginBottom: 20 },
  label: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  value: { color: '#1F2937', fontSize: 16 },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  editButton: { backgroundColor: '#4F46E5' },
  deleteButton: { backgroundColor: '#EF4444' },
  buttonText: { color: '#FFF', fontWeight: '600' },
});

export default UserViewScreen;