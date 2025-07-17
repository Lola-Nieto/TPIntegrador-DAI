import React, { useEffect, useState } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet, Button } from 'react-native';
import Message from '../components/Message';
import api from '../services/api';

export default function EventsListScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchEvents = async (name = '') => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/event', { params: name ? { name } : {} });
      setEvents(res.data.collection || []);
    } catch (err) {
      setError('Error al obtener eventos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Buscar evento por nombre"
        value={search}
        onChangeText={setSearch}
        onSubmitEditing={() => fetchEvents(search)}
      />
      <Button title="Buscar" onPress={() => fetchEvents(search)} />
      <Message loading={loading} type={error ? 'error' : 'info'} message={error} />
      <FlatList
        data={events}
        keyExtractor={item => item.id?.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.eventItem} onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}>
            <Text style={styles.eventName}>{item.name}</Text>
            <Text style={styles.eventDesc}>{item.description}</Text>
          </TouchableOpacity>
        )}
        refreshing={loading}
        onRefresh={() => fetchEvents(search)}
        ListEmptyComponent={!loading && <Text style={{ color: '#fff', textAlign: 'center' }}>No hay eventos</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
    padding: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  eventItem: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
  },
  eventName: {
    color: '#0ff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventDesc: {
    color: '#fff',
    fontSize: 14,
  },
}); 