import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

/**
 * Opens the device gallery and lets the user pick a single image.
 * Requests permission first. Returns the local URI or null.
 */
export const pickImage = async (): Promise<string | null> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission Required',
      'Please allow access to your photo library to select an image.'
    );
    return null;
  }

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.[0]?.uri) {
      return null;
    }

    return result.assets[0].uri;
  } catch (error) {
    Alert.alert('Error', 'Failed to pick image from gallery.');
    return null;
  }
};

/**
 * Opens the device camera and lets the user take a photo.
 * Requests permission first. Returns the local URI or null.
 */
export const takePhoto = async (): Promise<string | null> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      'Permission Required',
      'Please allow access to your camera to take a photo.'
    );
    return null;
  }

  try {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.[0]?.uri) {
      return null;
    }

    return result.assets[0].uri;
  } catch (error) {
    Alert.alert('Error', 'Failed to take photo.');
    return null;
  }
};
