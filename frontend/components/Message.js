import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function Message({ type = 'info', message, loading }) {
  let color = '#0ff';
  if (type === 'error') color = '#f55';
  if (type === 'success') color = '#0f0';

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color={color} />
      ) : (
        <Text style={[styles.text, { color }]}>{message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  text: {
    fontSize: 20,
    textAlign: 'center',
  },
}); 