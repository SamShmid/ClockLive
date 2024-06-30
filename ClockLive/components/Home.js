// components/Home.js
import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import Clock from './Clock';

const Home = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.clock}>
        <Clock />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Add A Task" color="white" onPress={() => navigation.navigate('Task')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
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
    marginTop: '40%',
    overflow: 'hidden',
  },
});

export default Home;
