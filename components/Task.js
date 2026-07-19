// components/Task.js
import React, { useContext, useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, Button, TouchableWithoutFeedback, Keyboard, ScrollView, Alert, TouchableOpacity, Modal
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Item } from './Item';
import { AppContext } from './Context';
import ColorPicker from './ColorPicker';
import regeneratorRuntime from "regenerator-runtime";
import storage from './Storage';

const defaultColor = '#6874e7';

storage.sync = {
  async tasks(params) {
    try {
      console.log('in storage.sync.tasks');
    } catch (err) {
      console.log('error in tasks.sync');
    }
  }
}

const TaskComponent = () => {
  const [task, setTask] = useState('');
  const [description, setDescription] = useState('');
  const [startHour, setStartHour] = useState(new Date());
  const [endHour, setEndHour] = useState(new Date());
  const [color, setColor] = useState(defaultColor);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { tasks, setTasks } = useContext(AppContext);

  useEffect(() => {
    setColor(defaultColor); // Set default color to the first color in the color picker
  }, []);

  const storeData = async (value) => {
    try {
      await storage.save({
        key: 'tasks',
        id: '1',
        data: value,
        expires: 1000 * 60,  // 1 minute
      });
      console.log('just stored ' + JSON.stringify(value));
    } catch (e) {
      console.log("error in storeData ");
      console.dir(e);
    }
  }

  const clearAll = async () => {
    try {
      console.log('in clearData');
      await storage.clearMapForKey('tasks');
      setTasks([]); // Clear the tasks in the context
    } catch (e) {
      console.log("error in clearAll ");
      console.dir(e);
    }
  }

  const getLastKey = () => {
    if (tasks.length === 0) return 0;
    return Math.max(...tasks.map(task => task.count));
  }

  const addTask = () => {
    if (endHour < startHour) {
      Alert.alert("Invalid Time", "End time cannot be before start time.");
      return;
    }

    const newTask = {
      count: getLastKey() + 1,
      task,
      description,
      startTime: startHour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      endTime: endHour.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCompleted: false,
      color,
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    storeData(updatedTasks);
    setTask('');
    setDescription('');
    setStartHour(new Date());
    setEndHour(new Date());
  };

  const handleTaskPress = (task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleCompleteTask = () => {
    const updatedTasks = tasks.map(t =>
      t.count === selectedTask.count ? { ...t, isCompleted: true } : t
    );
    setTasks(updatedTasks);
    setModalVisible(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.container}>
          <Text style={styles.title}>Task List</Text>
          <TextInput
            style={styles.input}
            placeholder="Task Name"
            placeholderTextColor="white"
            onChangeText={text => setTask(text)}
            value={task}
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
                onPress={addTask}
              />
            </View>
            <View style={styles.buttonContainer}>
              <Button
                title="Clear"
                color="red"
                onPress={clearAll}
              />
            </View>
          </View>
          <View style={styles.taskListContainer}>
            {tasks.map((item) => (
              !item.isCompleted && (
                <TouchableOpacity key={item.count} onPress={() => handleTaskPress(item)}>
                  <Item
                    task={item.task}
                    description={item.description}
                    startTime={item.startTime}
                    endTime={item.endTime}
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
                  <Text style={styles.modalText}>Task: {selectedTask.task}</Text>
                  <Text style={styles.modalText}>Description: {selectedTask.description}</Text>
                  <Text style={styles.modalText}>Start Time: {selectedTask.startTime}</Text>
                  <Text style={styles.modalText}>End Time: {selectedTask.endTime}</Text>
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
