import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

const Home = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.clockContainer}>
        <View style={styles.clock}>
          {[...Array(60)].map((_, index) => (
            <View
              key={index}
              style={[
                styles.notch,
                {
                  height: index % 5 === 0 ? 20 : 10, // longer notches for hours
                  transform: [
                    { rotate: `${index * 6}deg` },
                    { translateY: index % 5 === 0 ? -90 : -95 }, //If you want to change this make it half the notches length and width (must be the same value) -10 : -5 ie length = 200 than its 90: 95 length = 300 140 : 145 etc
                  ],
                },
              ]}
            />
          ))}
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <Button 
          title="Add A Task" 
          color="white" 
          onPress={() => navigation.navigate('Task')} 
        />
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const Task = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Task Component</Text>
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
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notch: {
    width: 2,
    backgroundColor: 'gray',
    position: 'absolute',
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

export { Home, Task };
