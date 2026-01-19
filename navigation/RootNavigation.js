// navigation/RootNavigation.js
import * as React from 'react';
import { CommonActions } from '@react-navigation/native';

// This is where we will store the navigation container ref
export const navigationRef = React.createRef();

// Function to navigate globally
export function navigate(name, params) {
  navigationRef.current?.navigate(name, params);
}

// Function to reset the navigation state globally
export function reset(routeName, index = 0) {
  navigationRef.current?.dispatch(
    CommonActions.reset({
      index,
      routes: [{ name: routeName }],
    })
  );
}