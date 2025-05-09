import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  FlatList,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { debounce } from 'lodash';
import { API_URL } from '@env';

const { width, height } = Dimensions.get('window');

const UserListScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async (query = '') => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      const url = `${API_URL}/users?search=${query}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Erreur de chargement');

      const data = await response.json();
      setUsers(data);
      setFilteredUsers(
        query
          ? data.filter(user =>
              user.email.toLowerCase().includes(query.toLowerCase())
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
    debounce(query => fetchUsers(query), 800),
    []
  );

  useEffect(() => {
    if (searchQuery === '') {
      fetchUsers('');
    } else {
      setSearchLoading(true);
      debouncedSearch(searchQuery);
    }
  }, [searchQuery]);

  const renderUserItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.email.charAt(0).toUpperCase()}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{item.email}</Text>
        <Text style={styles.detail}>Rôles: {item.roles.join(', ')}</Text>
        <Text style={styles.detail}>
  
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.iconButton, styles.viewButton]}
          onPress={() => navigation.navigate('UserView', { id: item.id })}
          activeOpacity={0.6}
        >
          <Icon name="visibility" size={20} color="#FFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, styles.editButton]}
          onPress={() => navigation.navigate('UserEdit', { user: item })}
          activeOpacity={0.6}
        >
          <Icon name="edit" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Chargement des utilisateurs...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Utilisateurs</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('UserCreate')}
        >
          <Icon name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un utilisateur..."
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
        data={filteredUsers}
        keyExtractor={item => item.id.toString()}
        renderItem={renderUserItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="person-outline" size={60} color="#CBD5E1" />
            <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 20, color: '#4F46E5', fontSize: 16, fontWeight: '500' },
  header: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#4f46e5',
    borderBottomRightRadius: 24,
    borderBottomLeftRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#FFF' },
  addButton: {
    backgroundColor: '#10B981',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
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
    elevation: 3,
    height: 52,
  },
  searchIcon: { position: 'absolute', left: 20, zIndex: 1 },
  searchInput: { flex: 1, fontSize: 16, paddingLeft: 40 },
  searchLoader: { marginRight: 16 },
  errorCard: { flexDirection: 'row', padding: 16, backgroundColor: '#FEE2E2', margin: 20, borderRadius: 12 },
  errorText: { marginLeft: 8, color: '#B91C1C' },
  listContent: { paddingVertical: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
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
  avatarText: { color: '#fff', fontSize: 19, fontWeight: '600' },
  info: { flex: 1 },
  name: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  detail: { fontSize: 13.5, color: '#64748b' },
  actions: { flexDirection: 'row', gap: 10, marginLeft: 10 },
  iconButton: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  viewButton: { backgroundColor: '#4B8BF3' },
  editButton: { backgroundColor: '#2BD99F' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: height * 0.5 },
  emptyText: { color: '#94a3b8', fontSize: 16, marginTop: 14 },
});

export default UserListScreen;
