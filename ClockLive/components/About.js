// components/About.js
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const About = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clock Live</Text>
      <Text style={styles.description}>
        Clock Live combines a simple analog clock with all your tasks, from alarm clocks in the morning to calendar appointments, creating a complete picture of your day.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: 'orange',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  description: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    width: '90%',
  },
});

export default About;
