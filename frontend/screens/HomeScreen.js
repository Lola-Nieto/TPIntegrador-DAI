import React, { useEffect, useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import Message from '../components/Message';
import api from '../services/api';

export default function HomeScreen({ navigation }) {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/hello')
      .then(res => {
        setMessage(res.data.message);
        setError('');
      })
      .catch(() => {
        setError('Error al conectar con la API 😭');
        setMessage('');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <Message
        loading={loading}
        type={error ? 'error' : 'info'}
        message={error || message}
      />
      <Button title="Acerca de" onPress={() => navigation.navigate('About')} />
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
}); 