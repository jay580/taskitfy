import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { submitTask } from '../../services/firestore';
import type { Task, TaskCategory } from '../../types';

const CATEGORY_COLORS: Record<TaskCategory, string> = {
  Academic: '#1976D2',
  Domestic: '#388E3C',
  Sports: '#F57C00',
  Special: '#6200EE',
};

const CATEGORY_ICONS: Record<TaskCategory, keyof typeof Ionicons.glyphMap> = {
  Academic: 'book',
  Domestic: 'home',
  Sports: 'football',
  Special: 'star',
};

interface Props {
  route: { params: { task: Task } };
  navigation: any;
}

export default function TaskDetail({ route, navigation }: Props) {
  const { task } = route.params;
  const { userProfile } = useAuth();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categoryColor = CATEGORY_COLORS[task.category];
  const categoryIcon = CATEGORY_ICONS[task.category];

  const formatDeadline = (isoString: string | null) => {
    if (!isoString) return 'No deadline';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow access to your camera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!userProfile) {
      Alert.alert('Error', 'You must be logged in to submit a task.');
      return;
    }

    if (!imageUri) {
      Alert.alert('Photo Required', 'Please upload a photo as proof of task completion.');
      return;
    }

    setSubmitting(true);
    try {
      await submitTask(
        task.id,
        userProfile.uid,
        task,
        imageUri,
        notes.trim() || undefined
      );

      Alert.alert(
        'Submitted!',
        'Your task has been submitted for approval. You can track its status in the Submissions tab.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Failed to submit task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Task Info Card */}
        <View style={styles.taskCard}>
          <View style={[styles.iconBox, { backgroundColor: categoryColor }]}>
            <Ionicons name={categoryIcon} size={28} color="#FFFFFF" />
          </View>
          
          <Text style={styles.taskTitle}>{task.title}</Text>
          
          <View style={styles.metaRow}>
            <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
              <Text style={[styles.categoryText, { color: categoryColor }]}>{task.category}</Text>
            </View>
            <Text style={styles.deadline}>{formatDeadline(task.deadline)}</Text>
          </View>

          <View style={styles.pointsRow}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.pointsText}>+{task.points} POINTS</Text>
          </View>

          <Text style={styles.descriptionLabel}>Description</Text>
          <Text style={styles.description}>{task.description}</Text>
        </View>

        {/* Submit Section */}
        <View style={styles.submitSection}>
          <Text style={styles.sectionTitle}>Submit Your Work</Text>

          {/* Photo Upload */}
          <Text style={styles.fieldLabel}>Photo Proof *</Text>
          <View style={styles.photoSection}>
            {imageUri ? (
              <View style={styles.previewContainer}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => setImageUri(null)}
                >
                  <Ionicons name="close-circle" size={28} color="#FF5252" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.uploadButtons}>
                <TouchableOpacity style={styles.uploadButton} onPress={takePhoto}>
                  <Ionicons name="camera" size={32} color="#6200EE" />
                  <Text style={styles.uploadText}>Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                  <Ionicons name="image" size={32} color="#6200EE" />
                  <Text style={styles.uploadText}>Gallery</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Notes */}
          <Text style={styles.fieldLabel}>Notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add any notes about your submission..."
            placeholderTextColor="#888"
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
            textAlignVertical="top"
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="paper-plane" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Submit for Approval</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#1E1E1E',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  taskCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  taskTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deadline: {
    fontSize: 13,
    color: '#888',
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  pointsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFD700',
    marginLeft: 6,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#CCCCCC',
    lineHeight: 22,
  },
  submitSection: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  photoSection: {
    marginBottom: 20,
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3C3C3E',
    borderStyle: 'dashed',
  },
  uploadText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 8,
  },
  previewContainer: {
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#1E1E1E',
    borderRadius: 14,
  },
  notesInput: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 15,
    minHeight: 100,
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#6200EE',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
