import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList } from 'react-native';
import { Item } from './Item'; // Import the named export Item

const Task = () => {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState('');
  const [count, setCount] = useState(1);

  const getCurrentDate = () => {
    const date = new Date();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <View style={styles.container}>
      <Text>Task List</Text>
      <TextInput 
        style={styles.input}
        placeholder='Task Name'
        placeholderTextColor={'white'}
        onChangeText={text => setTask(text)}
        value={task} />
      <View style={styles.buttonContainer}>
        <Button 
          title="Add Task" 
          color="white" 
          onPress={() => {
            const currentDate = getCurrentDate();
            const newTask = {
              count,
              task,
              date: currentDate
            };
            setTasks([...tasks, newTask]);
            setTask('');
            setCount(count + 1);
          }}
        />
      </View>
      <FlatList
        data={tasks}
        renderItem={({ item }) => <Item count={item.count} task={item.task} date={item.date} />}
        keyExtractor={item => item.count.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 40, 
    width: '40%', 
    backgroundColor: 'orange',
    borderColor: 'orange', 
    borderWidth: 5,
    borderRadius: 5,
  },
  text: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  buttonContainer: {
    borderRadius: 5,
    borderWidth: 5,
    borderColor: 'orange',
    backgroundColor: 'orange',
    marginTop: 20,
    overflow: 'hidden',
  },
});
export {Task};