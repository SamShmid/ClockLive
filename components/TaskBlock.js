// TaskBlock.js
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

const TaskBlock = ({ startDegree, endDegree, color, onPress, overlapRing }) => {
  const notches = [];
  for (let i = startDegree; i <= endDegree; i += 1) {
    const angle = i;
    const length = 20; // Length of the task block notch
    const width = (i === startDegree || i === endDegree) ? 2 : 5; // Width 2 for start/end, 5 otherwise
    const notchStyle = {
      position: 'absolute',
      width: width,
      height: length,
      backgroundColor: color,
      top: '50%',
      left: '50%',
      transform: [
        { translateX: -width / 2 }, // Adjust translateX to center the notch
        { rotate: `${angle}deg` },
        { translateY: -140 + (-25 * overlapRing) + length / 2 }, // Adjust the notch position for space between the border
      ],
      transformOrigin: 'center top',
    };
    notches.push(<View key={angle} style={notchStyle} />);
  }

  return (
    <TouchableOpacity onPress={onPress} style={styles.taskBlockContainer}>
      {notches}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  taskBlockContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 200,
    height: 200,
  },
});

export default TaskBlock;
