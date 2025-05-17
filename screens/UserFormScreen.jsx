import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  ScrollView,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Icon from 'react-native-vector-icons/MaterialIcons';
// URL de l'API fixe remplaçant la variable d'environnement
const API_URL = 'http://192.168.1.155:8000/api';

const UserFormScreen = ({ route, navigation }) => {
  const { user } = route.params || {};
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    roles: [],
    isVerified: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        password: '', // Mot de passe vide pour l'édition
        roles: user.roles,
        isVerified: user.isVerified,
      });
    }
  }, [user]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validation pour la création
      if (!user && !formData.password) {
        throw new Error('Le mot de passe est requis');
      }

      const token = await SecureStore.getItemAsync('authToken');
      const url = user 
        ? `${API_URL}/users/${user.id}`
        : `${API_URL}/users`;

      const method = user ? 'PUT' : 'POST';

      // Préparation des données avec gestion conditionnelle du mot de passe
      const requestData = {
        email: formData.email,
        roles: formData.roles,
        isVerified: formData.isVerified,
      };

      if (!user) {
        requestData.password = formData.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || errorData.error || 'Erreur de sauvegarde');
      }

      navigation.goBack();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={text => setFormData({ ...formData, email: text })}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
        </View>

        {!user && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Mot de passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={formData.password}
                onChangeText={text => setFormData({ ...formData, password: text })}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Icon 
                  name={showPassword ? 'visibility-off' : 'visibility'} 
                  size={24} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Rôles (séparés par des virgules)</Text>
          <TextInput
            style={styles.input}
            value={formData.roles.join(', ')}
            onChangeText={text => setFormData({ ...formData, roles: text.split(/,\s*/) })}
            placeholder="Ex: ROLE_ADMIN, ROLE_USER"
          />
        </View>

        <View style={[styles.formGroup, styles.switchContainer]}>
          <Text style={styles.label}>Vérifié</Text>
          <Switch
            value={formData.isVerified}
            onValueChange={value => setFormData({ ...formData, isVerified: value })}
          />
        </View>

        {error && (
          <View style={styles.errorCard}>
            <Icon name="error" size={20} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>
              {user ? 'Mettre à jour' : 'Créer utilisateur'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  scrollContainer: { padding: 20 },
  formGroup: { marginBottom: 20 },
  label: { 
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 15,
    top: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#B91C1C',
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserFormScreen;