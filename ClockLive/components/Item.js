import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Item = ({ count, task, date }) => (
  <View style={styles.item}>
    <Text style={styles.text}>#{count}</Text>
    <Text style={styles.text}>Task: {task}</Text>
    <Text style={styles.text}>Time: {date}</Text>
  </View>
);

const styles = StyleSheet.create({
  item: {
    backgroundColor: 'orange',
    padding: 20,
    alignSelf: 'center',
    width: '90%',
    marginVertical: 8,
    marginHorizontal: 16,
  },
  text: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
});

export {Item};
