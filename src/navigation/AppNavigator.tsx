import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { HomeScreen } from '../screens/HomeScreen';
import { SavedPalettesScreen } from '../screens/SavedPalettesScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { DatabaseManagementScreen } from '../screens/DatabaseManagementScreen';

const Tab = createBottomTabNavigator();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Saved') {
              iconName = focused ? 'folder' : 'folder-outline';
            } else if (route.name === 'Favorites') {
              iconName = focused ? 'heart' : 'heart-outline';
            } else if (route.name === 'Database') {
              iconName = focused ? 'server' : 'server-outline';
            } else {
              iconName = 'help-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#6c5ce7',
          tabBarInactiveTintColor: '#666666',
          tabBarStyle: {
            backgroundColor: '#1e1e1e',
            borderTopWidth: 1,
            borderTopColor: '#2a2a2a',
            height: 65,
            paddingBottom: 10,
            paddingTop: 8,
          },
          headerStyle: {
            backgroundColor: '#1e1e1e',
            borderBottomWidth: 1,
            borderBottomColor: '#2a2a2a',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 20,
            letterSpacing: 0.5,
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Inicio',
            headerTitle: 'Generador de Paletas',
          }}
        />
        <Tab.Screen
          name="Saved"
          component={SavedPalettesScreen}
          options={{
            title: 'Guardadas',
            headerTitle: 'Paletas Guardadas',
          }}
        />
        <Tab.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{
            title: 'Favoritas',
            headerTitle: 'Paletas Favoritas',
          }}
        />
        <Tab.Screen
          name="Database"
          component={DatabaseManagementScreen}
          options={{
            title: 'BD',
            headerTitle: 'Base de Datos',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};
