// HourHand.js
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Easing } from 'react-native';

const HourHand = ({ hour, minute }) => {
  const angle = (hour % 12) * 30 + (minute / 60) * 30; // 30 degrees per hour
  const animatedValue = useRef(new Animated.Value(angle)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: angle,
      duration: 1000, // 1 second for smooth transition
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [hour, minute]);

  const animatedStyle = {
    transform: [
      { translateX: -1 },
      { translateY: -50 },
      {
        rotate: animatedValue.interpolate({
          inputRange: [0, 360],
          outputRange: ['0deg', '360deg'],
        }),
      },
    ],
  };

  return <Animated.View style={[styles.hand, animatedStyle]} />;
};

const styles = StyleSheet.create({
  hand: {
    position: 'absolute',
    width: 4,
    height: 50,
    backgroundColor: 'orange',
    top: '50%',
    left: '50%',
    transformOrigin: 'center bottom',
  },
});

export default HourHand;
