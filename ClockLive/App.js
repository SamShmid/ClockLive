import * as React from 'react';
import { Button, View } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { Home } from './components/Home';
import { About } from './components/About';
import { Task } from './components/Task';

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Home"
        screenOptions={{
          drawerStyle: {
            backgroundColor: 'black', // Set the background color of the drawer to black
          },
          drawerActiveTintColor: 'white', // Set the color of the active item to white
          drawerInactiveTintColor: 'gray', // Set the color of inactive items to gray
          drawerLabelStyle: {
            fontWeight: 'bold', // Customize the label style
          },
          headerStyle: {
            backgroundColor: 'black', // Set the background color of the header to black
            elevation: 0, // Remove shadow on Android
            shadowOpacity: 0, // Remove shadow on iOS
            borderBottomWidth: 0, // Remove border at the bottom
          },
          headerTintColor: 'white', // Set the color of the header text to white
          headerTitleStyle: {
            fontWeight: 'bold', // Customize the header title style
          },
        }}
      >
        <Drawer.Screen 
          name="Home" 
          component={Home} 
          options={{ 
            title: 'Home', // Customize the title for the Home screen
          }} 
        />
        <Drawer.Screen 
          name="Task" 
          component={Task} 
          options={{ 
            title: 'Task', // Customize the title for the Task screen
          }} 
        />
        <Drawer.Screen 
          name="About" 
          component={About} 
          options={{ 
            title: 'About', // Customize the title for the About screen
          }} 
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
