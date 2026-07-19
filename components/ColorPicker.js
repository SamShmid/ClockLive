import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const colors = [
  '#6874e7',
  '#b8304f',
  '#758E4F',
  '#fa3741',
  '#F26419',
  '#F6AE2D',
  '#DFAEB4',
  '#7A93AC',
  '#33658A',
  '#3d2b56',
  '#42273B',
  '#171A21',
];

const ColorPicker = ({ isVisible, onClose, onSelectColor, selectedColor }) => {
  const handleColorSelect = (color) => {
    onSelectColor(color);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Choose a color</Text>
            <Pressable onPress={onClose}>
              <MaterialIcons name="close" color="#fff" size={22} />
            </Pressable>
          </View>
          <View style={styles.colorContainer}>
            {colors.map((color, index) => (
              <Pressable
                key={index}
                onPress={() => handleColorSelect(color)}
                style={[
                  styles.colorCircle,
                  { backgroundColor: color },
                  selectedColor === color && styles.selected,
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  colorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: 'orange',
  },
});

export default ColorPicker;
