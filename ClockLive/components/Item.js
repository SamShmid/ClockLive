// Item.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Item = ({ count, task, description, startTime, endTime, isCompleted, color }) => (
  <View style={[styles.item, { backgroundColor: color }]}>
    <Text style={styles.text}>Task: {task}</Text>
    <Text style={styles.text}>Description: {description}</Text>
    <Text style={styles.text}>Start Time: {startTime}</Text>
    <Text style={styles.text}>End Time: {endTime}</Text>
  </View>
);

const styles = StyleSheet.create({
  item: {
    padding: 20,
    alignSelf: 'center',
    width: '90%',
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 2,
    borderColor: 'blue',
  },
  text: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
});

export { Item };
