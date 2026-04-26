import React, { useState, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { submitTask } from '../../services/firestore';
import { uploadMultipleToCloudinary } from '../../services/uploadImage';
import { pickImage, takePhoto } from '../../utils/imagePicker';
import type { Task, TaskCategory } from '../../types';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../../theme';
import { getTaskStatusLabel } from '../../utils/taskStatus';
import Card from '../../components/Card';
import { Platform } from 'react-native';

const MAX_IMAGES = 5;

const CATEGORY_COLORS: Record<TaskCategory, string> = {
  Academic: COLORS.link,
  Domestic: COLORS.success,
  Sports: COLORS.warning,
  Special: COLORS.secondary,
};

const CATEGORY_ICONS: Record<TaskCategory, keyof typeof MaterialCommunityIcons.glyphMap> = {
  Academic: 'book-open-page-variant',
  Domestic: 'home-variant-outline',
  Sports: 'basketball',
  Special: 'star-shooting-outline',
};

interface Props {
  route: { params: { task: Task } };
  navigation: any;
}

export default function TaskDetail({ route, navigation }: Props) {
  const { task } = route.params;
  const { userProfile } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [images, setImages] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFailed, setUploadFailed] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const categoryColor = CATEGORY_COLORS[task.category] || COLORS.secondary;
  const categoryIcon = CATEGORY_ICONS[task.category] || 'flag';
  const timeStatus = getTaskStatusLabel(task);

  // ─── Image Handlers ───

  const handlePickImage = async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert('Limit Reached', `Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }
    const uri = await pickImage();
    if (uri) setImages(prev => [...prev, uri]);
  };

  const handleTakePhoto = async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert('Limit Reached', `Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }
    const uri = await takePhoto();
    if (uri) setImages(prev => [...prev, uri]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // ─── Submit Handler ───

  const handleSubmit = async () => {
    if (!userProfile) return;

    // 1. Validate at least 1 image
    if (!images.length) {
      Alert.alert('Photo Required', 'Please upload at least one photo as proof of task completion.');
      return;
    }

    // 2. Lock submit — prevent double submission
    if (uploading || submitting) return;
    setUploading(true);
    setUploadFailed(false);

    try {
      // 3. Upload ALL images to Cloudinary
      const imageUrls = await uploadMultipleToCloudinary(images);

      // 4. Switch to Firestore write phase
      setUploading(false);
      setSubmitting(true);

      // 5. Save submission in Firestore with photoUrls + photoUrl (backward compat)
      await submitTask(task.id, userProfile.uid, task, imageUrls, notes.trim() || undefined);

      // 6. Success
      Alert.alert('Submitted!', 'Your task has been submitted for approval.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      // Show specific error — no silent failures
      const message = error.message || 'Something went wrong. Please try again.';
      Alert.alert('Submission Failed', message);
      setUploadFailed(true);
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  };

  const isLocked = uploading || submitting;

  const getButtonLabel = () => {
    if (uploading) return `Uploading ${images.length} photo${images.length > 1 ? 's' : ''}...`;
    if (submitting) return 'Submitting...';
    if (uploadFailed) return 'Retry Upload';
    return 'Submit for Review';
  };

  return (
    <LinearGradient colors={[COLORS.gradientBgStart, COLORS.gradientBgEnd]} style={styles.container}>
      {/* Background Hero Layer */}
      <View style={[styles.heroBg, { backgroundColor: categoryColor }]} />
      <LinearGradient colors={['rgba(0,0,0,0.3)', COLORS.gradientBgStart]} style={styles.heroGradientOverlay} />

      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="close" size={26} color={COLORS.white} />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Sheet Content Group */}
      <View style={styles.sheetContainer}>
        {/* Drag handle hint */}
        <View style={styles.dragHandle} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.headerArea}>
            <View style={[styles.iconFloat, { backgroundColor: categoryColor }]}>
              <MaterialCommunityIcons name={categoryIcon} size={32} color={COLORS.white} />
            </View>
            <View style={styles.titleWrap}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <View style={styles.tagRow}>
                <View style={[styles.badge, { backgroundColor: `${categoryColor}20` }]}>
                  <Text style={[styles.badgeText, { color: categoryColor }]}>{task.category}</Text>
                </View>
                {timeStatus ? <Text style={styles.deadline}>⏳ {timeStatus}</Text> : null}
              </View>
            </View>
          </View>

          <Card style={styles.glassCard}>
            <View style={styles.pointsRow}>
              <MaterialCommunityIcons name="star-circle" size={28} color={COLORS.gold} />
              <Text style={styles.pointsText}>+{task.points} Power Points</Text>
            </View>
            <Text style={styles.descriptionLabel}>Description</Text>
            <Text style={styles.description}>{task.description || "No specific details provided."}</Text>
          </Card>

          <Card style={styles.glassCard}>
            <View style={styles.proofHeader}>
              <Text style={styles.descriptionLabel}>Proof of Work *</Text>
              <Text style={styles.imageCount}>{images.length}/{MAX_IMAGES}</Text>
            </View>

            {/* ─── Image Previews (Horizontal Scroll) ─── */}
            {images.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoList}>
                {images.map((uri, index) => (
                  <View key={`${uri}-${index}`} style={styles.previewContainer}>
                    <Image source={{ uri }} style={styles.previewImage} />
                    <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(index)}>
                      <Ionicons name="close-circle" size={24} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                ))}
                {/* Add more button inline */}
                {images.length < MAX_IMAGES && (
                  <TouchableOpacity style={styles.addMoreBtn} onPress={handlePickImage}>
                    <MaterialCommunityIcons name="plus" size={30} color={COLORS.white} />
                    <Text style={styles.addMoreText}>Add</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}

            {/* ─── Camera / Gallery Buttons (when no images yet) ─── */}
            {images.length === 0 && (
              <View style={styles.uploadButtons}>
                <TouchableOpacity style={styles.uploadButton} onPress={handleTakePhoto}>
                  <MaterialCommunityIcons name="camera-outline" size={30} color={categoryColor} />
                  <Text style={styles.uploadText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.uploadButton} onPress={handlePickImage}>
                  <MaterialCommunityIcons name="image-outline" size={30} color={categoryColor} />
                  <Text style={styles.uploadText}>Gallery</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Camera/Gallery row when images exist but under limit */}
            {images.length > 0 && images.length < MAX_IMAGES && (
              <View style={styles.addActionRow}>
                <TouchableOpacity style={styles.addActionBtn} onPress={handleTakePhoto}>
                  <MaterialCommunityIcons name="camera-outline" size={18} color={COLORS.white} />
                  <Text style={styles.addActionText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addActionBtn} onPress={handlePickImage}>
                  <MaterialCommunityIcons name="image-outline" size={18} color={COLORS.white} />
                  <Text style={styles.addActionText}>Gallery</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={[styles.descriptionLabel, { marginTop: SPACING.md }]}>Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Add short notes here..."
              placeholderTextColor={COLORS.mutedText}
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
              textAlignVertical="top"
            />
          </Card>
          
          <View style={{height: 100}} />
        </ScrollView>
      </View>

      {/* Floating CTA fixed at bottom, above Navbar */}
      <View style={[styles.fixedBottom, { paddingBottom: Platform.OS === 'ios' ? 110 : 90 }]}>
        <LinearGradient
          colors={[COLORS.glassBackgroundLv1, COLORS.gradientBgEnd]}
          style={StyleSheet.absoluteFillObject}
        />
        <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%', paddingHorizontal: SPACING.lg, zIndex: 10 }}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              isLocked && styles.submitButtonDisabled,
              uploadFailed && !isLocked && styles.submitButtonRetry,
            ]}
            activeOpacity={0.9}
            onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start()}
            onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start()}
            onPress={handleSubmit}
            disabled={isLocked}
          >
            {isLocked ? (
              <View style={styles.uploadingRow}>
                <ActivityIndicator color={COLORS.white} />
                <Text style={styles.submitButtonText}>{getButtonLabel()}</Text>
              </View>
            ) : (
              <>
                <MaterialCommunityIcons
                  name={uploadFailed ? 'refresh' : 'upload'}
                  size={22}
                  color={COLORS.white}
                />
                <Text style={styles.submitButtonText}>{getButtonLabel()}</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroBg: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 250, opacity: 0.4,
  },
  heroGradientOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 250,
  },
  header: {
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, alignItems: 'flex-end',
  },
  backButton: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.glassBackgroundLv2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  sheetContainer: {
    flex: 1,
    backgroundColor: COLORS.glassBackgroundLv2,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    marginTop: SPACING.xl,
    overflow: 'hidden',
  },
  dragHandle: {
    width: 40, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)', alignSelf: 'center', marginTop: SPACING.md, marginBottom: SPACING.lg,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: 220, // Clear the fixed CTA + Navbar
  },
  headerArea: {
    flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg,
  },
  iconFloat: {
    width: 64, height: 64, borderRadius: RADIUS.xl, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  titleWrap: { flex: 1 },
  taskTitle: {
    ...TYPOGRAPHY.header, fontSize: 24, color: COLORS.white, marginBottom: 8,
  },
  tagRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  badge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 8,
  },
  badgeText: { ...TYPOGRAPHY.small, fontWeight: '700' },
  deadline: { ...TYPOGRAPHY.small, color: COLORS.error, fontWeight: '600' },
  glassCard: {
    padding: SPACING.lg,
  },
  pointsRow: {
    flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg, backgroundColor: 'rgba(0,0,0,0.2)', paddingVertical: 10, paddingHorizontal: 14, borderRadius: RADIUS.md, alignSelf: 'flex-start', borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  pointsText: {
    ...TYPOGRAPHY.body, fontWeight: '800', color: COLORS.gold, marginLeft: 8,
  },
  descriptionLabel: {
    ...TYPOGRAPHY.small, fontWeight: '800', color: COLORS.mutedText, textTransform: 'uppercase', marginBottom: SPACING.sm, letterSpacing: 0.5,
  },
  description: {
    ...TYPOGRAPHY.body, color: COLORS.textSecondary, lineHeight: 24,
  },

  // ─── Proof of Work Header ───
  proofHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  imageCount: {
    ...TYPOGRAPHY.small,
    fontWeight: '700',
    color: COLORS.mutedText,
  },

  // ─── Upload Buttons (no images) ───
  uploadButtons: {
    flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.sm,
  },
  uploadButton: {
    flex: 1, backgroundColor: COLORS.glassBackgroundLv3, borderRadius: RADIUS.md, padding: SPACING.lg, alignItems: 'center', borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  uploadText: {
    ...TYPOGRAPHY.small, fontWeight: '600', color: COLORS.white, marginTop: 8,
  },

  // ─── Multi-Image Preview ───
  photoList: { marginVertical: SPACING.sm },
  previewContainer: {
    position: 'relative', marginRight: SPACING.md,
  },
  previewImage: {
    width: 110, height: 110, borderRadius: RADIUS.md, backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  addMoreBtn: {
    width: 110, height: 110, borderRadius: RADIUS.md, backgroundColor: COLORS.glassBackgroundLv3, borderWidth: 1, borderColor: COLORS.glassBorder, alignItems: 'center', justifyContent: 'center',
  },
  addMoreText: {
    ...TYPOGRAPHY.small, fontWeight: '600', color: COLORS.mutedText, marginTop: 4,
  },

  // ─── Add Action Row (when images exist) ───
  addActionRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  addActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.glassBackgroundLv3,
    borderRadius: RADIUS.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  addActionText: {
    ...TYPOGRAPHY.small,
    fontWeight: '600',
    color: COLORS.white,
  },

  notesInput: {
    backgroundColor: COLORS.glassBackgroundLv3, borderRadius: RADIUS.md, padding: SPACING.md, color: COLORS.white, ...TYPOGRAPHY.body, minHeight: 80, borderWidth: 1, borderColor: COLORS.glassBorder,
  },
  fixedBottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0, paddingTop: SPACING.md, alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', zIndex: 50,
  },
  submitButton: {
    backgroundColor: COLORS.secondary, paddingVertical: 18, borderRadius: RADIUS.xl, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', shadowColor: COLORS.secondary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10,
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonRetry: {
    backgroundColor: COLORS.warning,
    shadowColor: COLORS.warning,
  },
  submitButtonText: { ...TYPOGRAPHY.body, fontWeight: '800', color: COLORS.white, fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 },
  uploadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});