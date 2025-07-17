import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import Message from '../components/Message';
import api from '../services/api';

export default function EventDetailScreen({ route, navigation }) {
  const { eventId } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/event/${eventId}`)
      .then(res => {
        setEvent(res.data);
        setError('');
      })
      .catch(() => {
        setError('No se pudo cargar el evento');
      })
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading || error) {
    return <Message loading={loading} type={error ? 'error' : 'info'} message={error} />;
  }

  if (!event) return null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{event.name}</Text>
      <Text style={styles.desc}>{event.description}</Text>
      <Text style={styles.label}>Fecha:</Text>
      <Text style={styles.value}>{event.start_date}</Text>
      <Text style={styles.label}>Precio:</Text>
      <Text style={styles.value}>{event.price}</Text>
      <Text style={styles.label}>Ubicación:</Text>
      <Text style={styles.value}>{event.event_location?.name} - {event.event_location?.full_address}</Text>
      <Text style={styles.label}>Tags:</Text>
      <Text style={styles.value}>{event.tags?.map(t => t.name).join(', ')}</Text>
      <Button title="Volver" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
    padding: 16,
  },
  title: {
    color: '#0ff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  desc: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  label: {
    color: '#0ff',
    fontWeight: 'bold',
    marginTop: 10,
  },
  value: {
    color: '#fff',
    marginBottom: 5,
  },
}); 