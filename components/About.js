// components/About.js
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const About = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clock Live</Text>
      <Text style={styles.description}>
      Clock Live combines a simple analog clock with all your tasks, from alarm clocks in the morning to calendar appointments. Our virtual daily planners get filled quickly, and it becomes hard not to look at all the tasks in a given month, week, or even day and not be paralyzed by the amount of work that needs to be done. Clock Live is an app meant to increase productivity by taking all these tasks that are across all these platforms and synthesizing that data into a simple-to-use UI which shows a concise picture of all the current tasks in appointments that need to be done in the next hour helping you stay on task and be more productive in your day.
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
