import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TasksScreen from '../screens/Student/Tasks';
import TaskDetail from '../screens/Student/TaskDetail';
import type { Task } from '../types';

export type QuestsStackParamList = {
  TasksList: undefined;
  TaskDetail: { task: Task };
};

const Stack = createNativeStackNavigator<QuestsStackParamList>();

export default function QuestsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TasksList" component={TasksScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetail} />
    </Stack.Navigator>
  );
}
