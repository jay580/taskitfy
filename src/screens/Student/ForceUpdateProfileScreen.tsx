import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Text, TextInput as PaperInput } from 'react-native-paper';
import { verifyBeforeUpdateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY, RADIUS, SHADOWS } from '../../theme';
import Button from '../../components/Button';
import Card from '../../components/Card';
import FadeInView from '../../components/FadeInView';
import { useToast } from '../../contexts/ToastContext';
import Logo from '../../components/Logo';

export default function ForceUpdateProfileScreen() {
  const { firebaseUser, refreshProfile, logout } = useAuth();
  const { showToast } = useToast();
  
  const [newEmail, setNewEmail] = useState(firebaseUser?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [changingEmail, setChangingEmail] = useState(false);
  const [emailUpdated, setEmailUpdated] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');

  const handleChangeEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) return showToast("⚠️ Valid email required", "error");
    if (newEmail === firebaseUser?.email) return showToast("⚠️ Email is the same", "error");
    if (!currentPassword) return showToast("⚠️ Enter your current password", "error");

    setChangingEmail(true);
    try {
      if (!firebaseUser || !firebaseUser.email) throw new Error("No user found");
      
      // Reauthenticate first
      const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
      await reauthenticateWithCredential(firebaseUser, credential);
      
      // Send verification to the NEW email with explicit settings
      const actionCodeSettings = {
        url: `https://ssiapp-6e196.firebaseapp.com`,
        handleCodeInApp: false,
      };
      await verifyBeforeUpdateEmail(firebaseUser, newEmail, actionCodeSettings);
      
      // Update Firestore immediately
      await updateDoc(doc(db, 'users', firebaseUser.uid), { email: newEmail });
      
      setEmailUpdated(true);
      showToast("✉️ Verification link sent to " + newEmail + ". Check inbox & spam!", "success");
    } catch (e: any) {
      console.error('Email change error:', e.code, e.message);
      if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        showToast("❌ Incorrect password.", "error");
      } else if (e.code === 'auth/email-already-in-use') {
        showToast("❌ This email is already in use.", "error");
      } else {
        showToast(`❌ ${e.message}`, "error");
      }
    } finally {
      setChangingEmail(false);
    }
  };

  const handleUpdate = async () => {
    if (!newPassword) return showToast("⚠️ New password is required.", "error");
    if (newPassword !== confirmPassword) return showToast("⚠️ Passwords do not match.", "error");
    if (newPassword.length < 6) return showToast("⚠️ Password must be at least 6 characters.", "error");
    if (newEmail !== firebaseUser?.email && !emailUpdated) {
      return showToast("⚠️ Please update your email first using the button above.", "error");
    }
    
    setLoading(true);
    try {
      if (!firebaseUser || !firebaseUser.email) throw new Error("No user found.");

      // Email was already updated via handleChangeEmail if needed
      const currentEmail = emailUpdated ? newEmail : firebaseUser.email!;

      // 3. Update Password
      if (newPassword) {
         await updatePassword(firebaseUser, newPassword);
      }

      // 4. Mark profile update complete in Firestore
      // Also sync the verified email back to Firestore
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        needsProfileUpdate: false,
        email: currentEmail
      });

      if (emailUpdated) {
        showToast("✅ Profile updated with new email!", "success");
      } else {
        showToast("✅ Profile updated successfully!", "success");
      }
      
      await refreshProfile();
      
    } catch (e: any) {
      console.error(e);
      let msg = e.message;
      if (e.code === 'auth/requires-recent-login') {
        msg = "Session expired. Please log out and back in to set your new password.";
      } else if (e.code === 'auth/email-already-in-use') {
        msg = "This email is already taken.";
      }
      showToast(`❌ ${msg}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <FadeInView delay={100} style={styles.cardContainer}>
          <Card style={styles.card}>
            <View style={styles.header}>
              <Logo size={80} style={{ marginBottom: SPACING.lg }} />
              <Text style={styles.title}>Welcome to TASK BUZZ! 🎉</Text>

              <Text style={styles.subtitle}>
                You are logging in for the first time. For security reasons, you must update your email and password to continue.
              </Text>
            </View>

            <PaperInput
              label="New Email Address"
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              mode="outlined"
              outlineColor={COLORS.border}
              activeOutlineColor={COLORS.accent}
              textColor={COLORS.textDark}
              style={styles.input}
            />

            {newEmail !== (firebaseUser?.email || '') && !emailUpdated && (
              <>
                <PaperInput
                  label="Current Password (to confirm email change)"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                  mode="outlined"
                  outlineColor={COLORS.border}
                  activeOutlineColor={COLORS.accent}
                  textColor={COLORS.textDark}
                  style={styles.input}
                />
                <Button
                  title={changingEmail ? "Updating Email..." : "Update Email"}
                  onPress={handleChangeEmail}
                  loading={changingEmail}
                  disabled={changingEmail}
                  variant="secondary"
                  style={{ marginBottom: SPACING.md }}
                />
              </>
            )}
            
            {emailUpdated && (
              <Text style={{ color: COLORS.success, fontSize: 13, marginBottom: SPACING.md, textAlign: 'center', fontWeight: 'bold' }}>
                ✅ Email Updated to {newEmail}!
              </Text>
            )}

            <PaperInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              mode="outlined"
              outlineColor={COLORS.border}
              activeOutlineColor={COLORS.accent}
              textColor={COLORS.textDark}
              style={styles.input}
            />

            <PaperInput
              label="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              mode="outlined"
              outlineColor={COLORS.border}
              activeOutlineColor={COLORS.accent}
              textColor={COLORS.textDark}
              style={[styles.input, { marginBottom: SPACING.xl }]}
            />

            <Button
              title={loading ? "Updating..." : "Update Profile"}
              onPress={handleUpdate}
              loading={loading}
              disabled={loading}
            />
            
            <Button
              title="Logout"
              variant="secondary"
              onPress={logout}
              style={{ marginTop: SPACING.md }}
              disabled={loading}
            />
          </Card>
        </FadeInView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundPrimary,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  card: {
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textDark,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.mutedText,
    textAlign: 'center',
    lineHeight: 22,
  },
  input: {
    backgroundColor: COLORS.surfaceAlt,
    marginBottom: SPACING.md,
  },
});
