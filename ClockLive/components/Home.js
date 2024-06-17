// App.js
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, View, Button } from 'react-native';
import ClockProvider from './ClockContext';
import Clock from './Clock';

const Home = ({ navigation }) => {
  return (
    <ClockProvider>
      <View style={styles.container}>
        <View style={styles.clock}>
          <Clock />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Add A Task" color="white" onPress={() => navigation.navigate('Task')} />
        </View>
        <StatusBar style="auto" />
      </View>
    </ClockProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  clock: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderColor: 'gray',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    borderRadius: 5,
    borderWidth: 5,
    borderColor: 'orange',
    backgroundColor: 'orange',
    marginTop: 20,
    overflow: 'hidden',
  },
  text: {
    color: 'black',
  },
});

export {Home};
