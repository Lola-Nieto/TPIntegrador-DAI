import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function ProfileScreen({ navigation }) {
  // Aquí deberías obtener los datos reales del usuario autenticado
  const user = {
    first_name: 'Usuario',
    last_name: 'Demo',
    username: 'demo@email.com',
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <Text style={styles.label}>Nombre:</Text>
      <Text style={styles.value}>{user.first_name} {user.last_name}</Text>
      <Text style={styles.label}>Email:</Text>
      <Text style={styles.value}>{user.username}</Text>
      <Button title="Cerrar sesión" onPress={() => navigation.replace('Login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    color: '#0ff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    color: '#0ff',
    fontWeight: 'bold',
    marginTop: 10,
  },
  value: {
    color: '#fff',
    marginBottom: 5,
    fontSize: 16,
  },
}); 