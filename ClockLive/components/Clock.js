// Clock.js
import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { TimeContext } from './ClockContext';
import MinuteHand from './MinuteHand';
import HourHand from './HourHand';

const Clock = () => {
  const time = useContext(TimeContext);

  return (
    <View style={styles.analogClock}>
      {renderNotches()}
      <View style={styles.borderCircle} />
      <HourHand hour={time.hour} minute={time.minute} />
      <MinuteHand minute={time.minute} />
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
});

export default Clock;
