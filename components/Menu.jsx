import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Menu = ({ navigation }) => {
  return (
    <View style={styles.menuContainer}>
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => navigation.navigate('Home')}
      >
        <Icon name="home" size={24} color="#333" />
        <Text style={styles.menuText}>Accueil</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => navigation.navigate('Profile')}
      >
        <Icon name="person" size={24} color="#007AFF" />
        <Text style={[styles.menuText, styles.activeMenu]}>Profil</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => navigation.navigate('Settings')}
      >
        <Icon name="settings" size={24} color="#333" />
        <Text style={styles.menuText}>Réglages</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => navigation.navigate('Patients')}
      >
        <Icon name="supervised-user-circle" size={24} color="#333" />
        <Text style={styles.menuText}>Les Patients</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.menuItem}
        onPress={() => navigation.navigate('SejourList')}
      >
        <Icon name="local-hospital" size={24} color="#333" />
        <Text style={styles.menuText}>Les Séjours</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
    paddingVertical: 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  menuItem: {
    alignItems: 'center',
    padding: 10,
  },
  menuText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  activeMenu: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default Menu;