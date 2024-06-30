// Clock.js
import React, { useContext, useState, useEffect } from 'react';
import { View, StyleSheet, Modal, Text, TouchableOpacity } from 'react-native';
import { AppContext } from './Context';
import MinuteHand from './MinuteHand';
import HourHand from './HourHand';
import TaskBlock from './TaskBlock';

const ClockComponent = () => {
  const { tasks, setTasks, time } = useContext(AppContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    console.log('Current time:', time);
    console.log('Tasks:', tasks);
  }, [time, tasks]);

  const calculateDuration = (task) => {
    const startParts = task.startTime.split(':');
    const endParts = task.endTime.split(':');

    let startHour = parseInt(startParts[0]);
    const startMinute = parseInt(startParts[1].slice(0, 2));
    const startPeriod = startParts[1].slice(3).toLowerCase();

    let endHour = parseInt(endParts[0]);
    const endMinute = parseInt(endParts[1].slice(0, 2));
    const endPeriod = endParts[1].slice(3).toLowerCase();

    if (startPeriod === 'pm' && startHour !== 12) {
      startHour += 12;
    }
    if (startPeriod === 'am' && startHour === 12) {
      startHour = 0;
    }
    if (endPeriod === 'pm' && endHour !== 12) {
      endHour += 12;
    }
    if (endPeriod === 'am' && endHour === 12) {
      endHour = 0;
    }

    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;

    return end - start;
  };

  const tasklistAdderChecker = (task, currentHour, list) => {
    if (task.isCompleted) return;

    const startParts = task.startTime.split(':');
    const endParts = task.endTime.split(':');

    let startHour = parseInt(startParts[0]);
    const startMinute = parseInt(startParts[1].slice(0, 2));
    const startPeriod = startParts[1].slice(3).toLowerCase();

    let endHour = parseInt(endParts[0]);
    const endMinute = parseInt(endParts[1].slice(0, 2));
    const endPeriod = endParts[1].slice(3).toLowerCase();

    if (startPeriod === 'pm' && startHour !== 12) {
      startHour += 12;
    }
    if (startPeriod === 'am' && startHour === 12) {
      startHour = 0;
    }
    if (endPeriod === 'pm' && endHour !== 12) {
      endHour += 12;
    }
    if (endPeriod === 'am' && endHour === 12) {
      endHour = 0;
    }

    task.duration = calculateDuration(task);

    if (startHour === currentHour) {
      list.push(task);
    } else if (startHour < currentHour && endHour > currentHour) {
      task.startDegree = 0;
      task.endDegree = 360;
      list.push(task);
    } else if (startHour < currentHour && endHour === currentHour) {
      task.duration = endMinute;
      task.startDegree = 0;
      list.push(task);
    } else if (startHour === currentHour && endHour > currentHour) {
      task.duration = 60 - startMinute;
      task.endDegree = 360;
      list.push(task);
    }
  };

  const assignOverlapRings = (tasks) => {
    const currentHour = time.hour;
    const list = [];

    tasks.forEach(task => tasklistAdderChecker(task, currentHour, list));

    list.sort((a, b) => b.duration - a.duration || a.count - b.count);

    const overlapRing = Array.from({ length: 61 }, () => Array(list.length).fill(null));

    list.forEach(task => {
      const startParts = task.startTime.split(':');
      const endParts = task.endTime.split(':');

      let startHour = parseInt(startParts[0]);
      const startMinute = parseInt(startParts[1].slice(0, 2));
      const startPeriod = startParts[1].slice(3).toLowerCase();

      let endHour = parseInt(endParts[0]);
      const endMinute = parseInt(endParts[1].slice(0, 2));
      const endPeriod = endParts[1].slice(3).toLowerCase();

      if (startPeriod === 'pm' && startHour !== 12) {
        startHour += 12;
      }
      if (startPeriod === 'am' && startHour === 12) {
        startHour = 0;
      }
      if (endPeriod === 'pm' && endHour !== 12) {
        endHour += 12;
      }
      if (endPeriod === 'am' && endHour === 12) {
        endHour = 0;
      }

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

    return tasksWithRings.map((task) => {
      const startParts = task.startTime.split(':');
      const endParts = task.endTime.split(':');

      let startHour = parseInt(startParts[0]);
      const startMinute = parseInt(startParts[1].slice(0, 2));
      const startPeriod = startParts[1].slice(3).toLowerCase();

      let endHour = parseInt(endParts[0]);
      const endMinute = parseInt(endParts[1].slice(0, 2));
      const endPeriod = endParts[1].slice(3).toLowerCase();

      if (startPeriod === 'pm' && startHour !== 12) {
        startHour += 12;
      }
      if (startPeriod === 'am' && startHour === 12) {
        startHour = 0;
      }
      if (endPeriod === 'pm' && endHour !== 12) {
        endHour += 12;
      }
      if (endPeriod === 'am' && endHour === 12) {
        endHour = 0;
      }

      const currentHour = time.hour;

      if (startHour === currentHour || endHour === currentHour || (startHour < currentHour && endHour > currentHour)) {
        const startDegree = task.startDegree ?? (startHour === currentHour ? startMinute * 6 : 0);
        const endDegree = task.endDegree ?? (endHour === currentHour ? endMinute * 6 : 360);

        return (
          <TaskBlock
            key={task.count}
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

  const handleCompleteTask = () => {
    const updatedTasks = tasks.map(task =>
      task.count === selectedTask.count ? { ...task, isCompleted: true } : task
    );
    setTasks(updatedTasks);
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
                <Text style={styles.modalText}>Task: {selectedTask.task}</Text>
                <Text style={styles.modalText}>Description: {selectedTask.description}</Text>
                <Text style={styles.modalText}>Start Time: {selectedTask.startTime}</Text>
                <Text style={styles.modalText}>End Time: {selectedTask.endTime}</Text>
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
