import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const About = () => {
  return (
    <View style={styles.container}>
      <Text style={{... styles.text, fontWeight: 'bold', fontSize: 20}}>Clock Live</Text>
      <Text style={styles.text}>
      The app I am going to make, Clock Live, will combine a simple analog clock with all your tasks, from alarm clocks in the morning to calendar appointments to create a complete picture of your day.
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
  },

  text:{
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    width: '80%',
  },
});

export {About};