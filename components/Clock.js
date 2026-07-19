// Clock.js
import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, Modal, Text, TouchableOpacity } from 'react-native';
import { AppContext } from './Context';
import MinuteHand from './MinuteHand';
import HourHand from './HourHand';
import TaskBlock from './TaskBlock';
import { formatMinutes } from '../lib/time';

const ClockComponent = () => {
  const { tasks, completeTask, time } = useContext(AppContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    console.log('Current time:', time);
    console.log('Tasks:', tasks);
  }, [time, tasks]);

  // Works on copies of the context tasks: layout fields (duration,
  // startDegree, endDegree, overlapRing) are view state, not task state.
  const tasklistAdderChecker = (task, currentHour, list) => {
    if (task.isCompleted) return;

    const startHour = Math.floor(task.startMinutes / 60);
    const startMinute = task.startMinutes % 60;
    const endHour = Math.floor(task.endMinutes / 60);
    const endMinute = task.endMinutes % 60;

    const entry = { ...task, duration: task.endMinutes - task.startMinutes };

    if (startHour === currentHour && endHour > currentHour) {
      entry.duration = 60 - startMinute;
      entry.endDegree = 360;
      list.push(entry);
    } else if (startHour === currentHour) {
      list.push(entry);
    } else if (startHour < currentHour && endHour > currentHour) {
      entry.startDegree = 0;
      entry.endDegree = 360;
      list.push(entry);
    } else if (startHour < currentHour && endHour === currentHour) {
      entry.duration = endMinute;
      entry.startDegree = 0;
      list.push(entry);
    }
  };

  const assignOverlapRings = (allTasks) => {
    const currentHour = time.hour;
    const list = [];

    allTasks.forEach(task => tasklistAdderChecker(task, currentHour, list));

    list.sort((a, b) => b.duration - a.duration || (a.id < b.id ? -1 : 1));

    const overlapRing = Array.from({ length: 61 }, () => Array(list.length).fill(null));

    list.forEach(task => {
      const startHour = Math.floor(task.startMinutes / 60);
      const startMinute = task.startMinutes % 60;
      const endHour = Math.floor(task.endMinutes / 60);
      const endMinute = task.endMinutes % 60;

      const startDegree = task.startDegree ?? (startHour === currentHour ? startMinute * 6 : 0);
      const endDegree = task.endDegree ?? (endHour === currentHour ? endMinute * 6 : 360);
      const startMinuteCalc = Math.floor(startDegree / 6);
      const endMinuteCalc = Math.ceil(endDegree / 6);

      let ring = 0;
      let foundRing = false;

      while (!foundRing) {
        let overlap = false;

        for (let minute = startMinuteCalc; minute <= endMinuteCalc; minute++) {
          if (overlapRing[minute][ring]) {
            overlap = true;
            break;
          }
        }

        if (!overlap) {
          for (let minute = startMinuteCalc; minute <= endMinuteCalc; minute++) {
            overlapRing[minute][ring] = true;
          }
          task.overlapRing = ring;
          foundRing = true;
        } else {
          ring++;
        }
      }
    });

    return list;
  };

  const renderTaskBlocks = () => {
    const tasksWithRings = assignOverlapRings(tasks);
    const currentHour = time.hour;

    return tasksWithRings.map((task) => {
      const startHour = Math.floor(task.startMinutes / 60);
      const startMinute = task.startMinutes % 60;
      const endHour = Math.floor(task.endMinutes / 60);
      const endMinute = task.endMinutes % 60;

      if (startHour === currentHour || endHour === currentHour || (startHour < currentHour && endHour > currentHour)) {
        const startDegree = task.startDegree ?? (startHour === currentHour ? startMinute * 6 : 0);
        const endDegree = task.endDegree ?? (endHour === currentHour ? endMinute * 6 : 360);

        return (
          <TaskBlock
            key={task.id}
            startDegree={startDegree}
            endDegree={endDegree}
            color={task.color || 'purple'}
            onPress={() => handleTaskBlockPress(task)}
            overlapRing={task.overlapRing}
          />
        );
      }
      return null;
    });
  };

  const handleTaskBlockPress = (task) => {
    setSelectedTask(task);
    setModalVisible(true);
  };

  const handleCompleteTask = async () => {
    await completeTask(selectedTask.id);
    setModalVisible(false);
  };

  return (
    <View style={styles.analogClock}>
      {renderNotches()}
      {renderTaskBlocks()}
      <View style={styles.borderCircle} />
      <HourHand hour={time.hour} minute={time.minute} />
      <MinuteHand minute={time.minute} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
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
            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(!modalVisible)}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const renderNotches = () => {
  const notches = [];
  for (let i = 0; i < 60; i++) {
    const angle = i * 6; // 6 degrees per minute
    const length = i % 5 === 0 ? 15 : 7; // Longer notch for each 5-minute interval
    const notchStyle = {
      position: 'absolute',
      width: 2,
      height: length,
      backgroundColor: 'gray',
      top: '50%',
      left: '50%',
      transform: [
        { translateX: -1 },
        { rotate: `${angle}deg` },
        { translateY: -95 + length / 2 }, // Adjust the notch position for space between the border
      ],
      transformOrigin: 'center top',
    };
    notches.push(<View key={i} style={notchStyle} />);
  }
  return notches;
};

const Clock = () => (
  <ClockComponent />
);

const styles = StyleSheet.create({
  analogClock: {
    width: 200,
    height: 200,
    position: 'relative',
  },
  borderCircle: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#000',
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

export default Clock;
