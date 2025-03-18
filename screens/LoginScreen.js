import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  ActivityIndicator, 
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const API_URL = 'http://192.168.1.117:8000/api';
//const API_URL = 'http://192.0.0.2:8000/api';

const LoginScreen = ({ navigation, setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadSavedCredentials = async () => {
      const savedEmail = await AsyncStorage.getItem('email');
      const savedPassword = await AsyncStorage.getItem('password');
      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    };
    loadSavedCredentials();
  }, []);

  const validateForm = () => {
    let newErrors = {};
    if (!email) newErrors.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email invalide';
    if (!password) newErrors.password = 'Mot de passe requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/login_check`,
        { username: email, password },
        { headers: { 'Content-Type': 'application/json' } }
      );

      await AsyncStorage.setItem('token', response.data.token);
      if (rememberMe) {
        await AsyncStorage.multiSet([['email', email], ['password', password]]);
      } else {
        await AsyncStorage.multiRemove(['email', 'password']);
      }

      setIsAuthenticated(true);
    } catch (error) {
      let message = error.response?.data?.message || 'Erreur de connexion';
      if (error.response?.status === 401) message = 'Identifiants incorrects';
      Alert.alert('Erreur', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logo-png.png')}
            style={styles.logo}
          />
        </View>

        <Text style={styles.title}>Bienvenue !</Text>
        <Text style={styles.subtitle}>Connectez-vous pour continuer</Text>

        {/* Email Input */}
        <View style={[styles.inputContainer, errors.email && styles.inputError]}>
          <MaterialIcons 
            name="email" 
            size={20} 
            color={errors.email ? '#FF4444' : '#70B2F9'} 
            style={styles.icon} 
          />
          <TextInput
            placeholder="Adresse email"
            placeholderTextColor="#A0AEC0"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        {errors.email && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={14} color="#FF4444" />
            <Text style={styles.errorText}>{errors.email}</Text>
          </View>
        )}

        {/* Password Input */}
        <View style={[styles.inputContainer, errors.password && styles.inputError]}>
          <MaterialIcons 
            name="lock" 
            size={20} 
            color={errors.password ? '#FF4444' : '#70B2F9'} 
            style={styles.icon} 
          />
          <TextInput
            placeholder="Mot de passe"
            placeholderTextColor="#A0AEC0"
            value={password}
            secureTextEntry={!showPassword}
            onChangeText={setPassword}
            style={styles.input}
          />
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <MaterialIcons 
              name={showPassword ? 'visibility-off' : 'visibility'} 
              size={20} 
              color={errors.password ? '#FF4444' : '#666'} 
            />
          </TouchableOpacity>
        </View>
        {errors.password && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error-outline" size={14} color="#FF4444" />
            <Text style={styles.errorText}>{errors.password}</Text>
          </View>
        )}

        {/* Remember Me */}
        <View style={styles.rememberMeContainer}>
          <TouchableOpacity 
            onPress={() => setRememberMe(!rememberMe)}
            style={styles.checkbox}
          >
            <MaterialIcons 
              name={rememberMe ? 'check-box' : 'check-box-outline-blank'} 
              size={24} 
              color={rememberMe ? '#70B2F9' : '#CBD5E0'} 
            />
          </TouchableOpacity>
          <Text style={styles.rememberMeText}>Se souvenir de moi</Text>
        </View>

        {/* Login Button */}
        <TouchableOpacity 
          style={[styles.loginButton, isLoading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.9}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Se connecter</Text>
          )}
        </TouchableOpacity>

        {/* Forgot Password */}
        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.linkText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>

        {/* Signup Section */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Pas de compte ? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signupLink}>S'inscrire</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A365D',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    marginBottom: 10,
    paddingHorizontal: 15,
    height: 56,
  },
  inputError: {
    borderColor: '#FF4444',
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#2D3748',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: -5,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 13,
    marginLeft: 4,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  checkbox: {
    marginRight: 8,
  },
  rememberMeText: {
    color: '#4A5568',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#70B2F9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#70B2F9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'center',
    marginTop: 20,
  },
  linkText: {
    color: '#70B2F9',
    fontWeight: '500',
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  signupText: {
    color: '#718096',
    fontSize: 14,
  },
  signupLink: {
    color: '#70B2F9',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default LoginScreen;