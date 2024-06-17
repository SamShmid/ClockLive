// MinuteHand.js
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Easing } from 'react-native';

const MinuteHand = ({ minute }) => {
  const angle = minute * 6; // 6 degrees per minute
  const animatedValue = useRef(new Animated.Value(angle)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: angle,
      duration: 1000, // 1 second for smooth transition
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();
  }, [minute]);

  const animatedStyle = {
    transform: [
      { translateX: -1 },
      { translateY: -70 },
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
    width: 2,
    height: 70,
    backgroundColor: 'gray',
    top: '50%',
    left: '50%',
    transformOrigin: 'center bottom',
  },
});

export default MinuteHand;
