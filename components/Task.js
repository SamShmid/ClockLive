// components/Task.js
import React, { useContext, useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, Button, TouchableWithoutFeedback, Keyboard, ScrollView, Alert, TouchableOpacity, Modal
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Item } from './Item';
import { AppContext } from './Context';
import ColorPicker from './ColorPicker';
import { formatMinutes, minutesOfDay } from '../lib/time';

const defaultColor = '#6874e7';

const TaskComponent = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startHour, setStartHour] = useState(new Date());
  const [endHour, setEndHour] = useState(new Date());
  const [color, setColor] = useState(defaultColor);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { tasks, addTask, completeTask, clearTasks } = useContext(AppContext);

  const handleAddTask = async () => {
    const startMinutes = minutesOfDay(startHour);
    const endMinutes = minutesOfDay(endHour);

    if (endMinutes < startMinutes) {
      Alert.alert("Invalid Time", "End time cannot be before start time.");
      return;
    }

    await addTask({ name, description, startMinutes, endMinutes, color });
    setName('');
    setDescription('');
    setStartHour(new Date());
    setEndHour(new Date());
  };

  const handleTaskPress = (task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleCompleteTask = async () => {
    await completeTask(selectedTask.id);
    setModalVisible(false);
  };

  return (
    // accessible={false}: without it this wrapper collapses the whole form
    // into one opaque accessibility element (unusable with VoiceOver).
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <Text style={styles.title}>Task List</Text>
          <TextInput
            style={styles.input}
            placeholder="Task Name"
            placeholderTextColor="white"
            onChangeText={text => setName(text)}
            value={name}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            placeholderTextColor="white"
            onChangeText={text => setDescription(text)}
            value={description}
          />
          <Text style={[styles.text, { alignSelf: 'center' }]}>Start Time:</Text>
          <View style={styles.dateTimePickerContainer}>
            <DateTimePicker
              value={startHour}
              mode="time"
              display="default"
              onChange={(event, selectedDate) => setStartHour(selectedDate || startHour)}
              style={styles.dateTimePicker}
              textColor="white"
            />
          </View>
          <Text style={[styles.text, { alignSelf: 'center' }]}>End Time:</Text>
          <View style={styles.dateTimePickerContainer}>
            <DateTimePicker
              value={endHour}
              mode="time"
              display="default"
              onChange={(event, selectedDate) => setEndHour(selectedDate || endHour)}
              style={styles.dateTimePicker}
              textColor="white"
            />
          </View>
          <View style={styles.buttonRow}>
            <View style={styles.buttonContainer}>
              <Button
                title="Pick Color"
                color="white"
                onPress={() => setColorPickerVisible(true)}
              />
            </View>
            <View style={styles.buttonContainer}>
              <Button
                title="Add Task"
                color="white"
                onPress={handleAddTask}
              />
            </View>
            <View style={styles.buttonContainer}>
              <Button
                title="Clear"
                color="red"
                onPress={clearTasks}
              />
            </View>
          </View>
          <View style={styles.taskListContainer}>
            {tasks.map((item) => (
              !item.isCompleted && (
                <TouchableOpacity key={item.id} onPress={() => handleTaskPress(item)}>
                  <Item
                    task={item.name}
                    description={item.description}
                    startTime={formatMinutes(item.startMinutes)}
                    endTime={formatMinutes(item.endMinutes)}
                    color={item.color}
                  />
                </TouchableOpacity>
              )
            ))}
          </View>
        </View>

        <ColorPicker
          isVisible={colorPickerVisible}
          onClose={() => setColorPickerVisible(false)}
          onSelectColor={setColor}
          selectedColor={color}
        />

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalView, selectedTask && { backgroundColor: selectedTask.color }]}>
              {selectedTask && (
                <>
                  <Text style={styles.modalText}>Task: {selectedTask.name}</Text>
                  <Text style={styles.modalText}>Description: {selectedTask.description}</Text>
                  <Text style={styles.modalText}>Start Time: {formatMinutes(selectedTask.startMinutes)}</Text>
                  <Text style={styles.modalText}>End Time: {formatMinutes(selectedTask.endMinutes)}</Text>
                </>
              )}
              <TouchableOpacity style={styles.button} onPress={handleCompleteTask}>
                <Text style={styles.buttonText}>Complete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const Task = () => (
  <TaskComponent />
);

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    backgroundColor: 'black',
  },
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: 'black',
  },
  input: {
    height: 40,
    width: '100%',
    backgroundColor: 'orange',
    borderColor: 'orange',
    borderWidth: 2,
    borderRadius: 5,
    marginBottom: 10,
    paddingLeft: 10,
    color: 'white',
  },
  title: {
    fontSize: 24,
    color: 'white',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  dateTimePickerContainer: {
    width: '23%',
    height: 40,
    marginBottom: 10,
    borderColor: 'orange',
    borderWidth: 2,
    borderRadius: 5,
    overflow: 'hidden',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateTimePicker: {
    alignSelf: 'center',
    backgroundColor: 'orange',
    textColor: "white",
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  buttonContainer: {
    width: '30%',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'orange',
    backgroundColor: 'orange',
  },
  taskListContainer: {
    width: '100%',
    paddingBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'black',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'orange',
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: 'orange',
  },
  button: {
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'orange',
    backgroundColor: 'orange',
    padding: 10,
    marginVertical: 5,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default Task;
