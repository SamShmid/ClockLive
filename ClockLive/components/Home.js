import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Button, Dimensions } from 'react-native';

const Home = ({ navigation }) => {

  return (
    <View style={styles.container}>
      <View style={styles.clock}>
        {/* Placeholder for future Clock*/}
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Add A Task" color="white" onPress={() => navigation.navigate('Task')} />
      </View>
      <StatusBar style="auto" />
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
  clockContainer: {
    alignItems: 'left',
    justifyContent: 'center',
  },
  clock: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderColor: 'gray',
    borderWidth: 2,
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

export { Home };

