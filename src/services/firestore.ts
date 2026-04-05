import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  increment,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  UserProfile,
  Task,
  Submission,
  LeaderboardEntry,
  AppSettings,
  Notification,
} from '../types';

// ─── Helpers ───
const tsToISO = (ts: any): string | null => {
  if (!ts) return null;
  if (ts.toDate) return ts.toDate().toISOString();
  return String(ts);
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

// ─── User Profile ───

// Creates a default profile for a new user (used when manually created in Firebase Auth)
export const createDefaultUserProfile = async (
  uid: string,
  email: string,
  displayName?: string
): Promise<UserProfile> => {
  // Extract studentId from email (e.g., STU001@tq.app -> STU001)
  const studentId = email.split('@')[0].toUpperCase();
  
  const profile: UserProfile = {
    uid,
    name: displayName || studentId,
    studentId,
    room: '',
    role: 'student',
    pointsThisMonth: 0,
    totalTasksDone: 0,
    streakDays: 0,
    badges: [],
    isActive: true,
    isSuspended: false,
    suspensionEnd: null,
  };

  await setDoc(doc(db, 'users', uid), profile);

  return profile;
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    uid: snap.id,
    name: d.name ?? '',
    studentId: d.studentId ?? '',
    room: d.room ?? '',
    role: d.role ?? 'student',
    pointsThisMonth: d.pointsThisMonth ?? 0,
    totalTasksDone: d.totalTasksDone ?? 0,
    streakDays: d.streakDays ?? 0,
    badges: d.badges ?? [],
    isActive: d.isActive ?? true,
    isSuspended: d.isSuspended ?? false,
    suspensionEnd: tsToISO(d.suspensionEnd),
  };
};

// Check if user is suspended
export const isUserSuspended = (profile: UserProfile): boolean => {
  if (!profile.isSuspended) return false;
  if (!profile.suspensionEnd) return true;
  return new Date() < new Date(profile.suspensionEnd);
};

// ─── Tasks ───
export const getAvailableTasks = async (): Promise<Task[]> => {
  const q = query(
    collection(db, 'tasks'),
    where('isActive', '==', true),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      title: data.title ?? '',
      description: data.description ?? '',
      category: data.category ?? 'Domestic',
      points: data.points ?? 10,
      deadline: tsToISO(data.deadline),
      assignedTo: data.assignedTo ?? 'all',
      isTeamTask: data.isTeamTask ?? false,
      isRepeatable: data.isRepeatable ?? false,
      isActive: data.isActive ?? true,
      createdAt: tsToISO(data.createdAt) ?? '',
    };
  });
};

// ─── Submissions ───
export const getStudentSubmissions = async (
  uid: string,
  status?: 'pending' | 'rejected',
): Promise<Submission[]> => {
  let q;
  if (status) {
    q = query(
      collection(db, 'submissions'),
      where('studentId', '==', uid),
      where('status', '==', status),
      orderBy('submittedAt', 'desc'),
    );
  } else {
    q = query(
      collection(db, 'submissions'),
      where('studentId', '==', uid),
      orderBy('submittedAt', 'desc'),
    );
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      taskId: data.taskId ?? undefined,
      studentId: data.studentId ?? '',
      type: data.type ?? 'task',
      title: data.title ?? '',
      description: data.description ?? '',
      photoUrl: data.photoUrl ?? '',
      notes: data.notes ?? '',
      status: data.status ?? 'pending',
      rejectionReason: data.rejectionReason ?? '',
      pointsAwarded: data.pointsAwarded ?? 0,
      submittedAt: tsToISO(data.submittedAt) ?? '',
      reviewedAt: tsToISO(data.reviewedAt),
    };
  });
};

export const getCompletedSubmissions = async (uid: string): Promise<Submission[]> => {
  const q = query(
    collection(db, 'submissions'),
    where('studentId', '==', uid),
    where('status', '==', 'approved'),
    orderBy('submittedAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      taskId: data.taskId ?? undefined,
      studentId: data.studentId ?? '',
      type: data.type ?? 'task',
      title: data.title ?? '',
      description: data.description ?? '',
      photoUrl: data.photoUrl ?? '',
      notes: data.notes ?? '',
      status: 'approved' as const,
      rejectionReason: '',
      pointsAwarded: data.pointsAwarded ?? 0,
      submittedAt: tsToISO(data.submittedAt) ?? '',
      reviewedAt: tsToISO(data.reviewedAt),
    };
  });
};

// Submit an assigned task
export const submitTask = async (
  taskId: string,
  uid: string,
  task: Task,
  photoUrl?: string,
  notes?: string,
) => {
  const submissionRef = await addDoc(collection(db, 'submissions'), {
    taskId,
    studentId: uid,
    type: 'task',
    title: task.title,
    description: task.description,
    photoUrl: photoUrl ?? '',
    notes: notes ?? '',
    status: 'pending',
    rejectionReason: '',
    pointsAwarded: 0,  // Set by admin on approval
    submittedAt: Timestamp.now(),
    reviewedAt: null,
  });

  return submissionRef;
};

// Submit a self-created task
export const submitSelfTask = async (
  uid: string,
  title: string,
  description: string,
  photoUrl?: string,
  notes?: string,
) => {
  const submissionRef = await addDoc(collection(db, 'submissions'), {
    taskId: null,
    studentId: uid,
    type: 'self',
    title,
    description,
    photoUrl: photoUrl ?? '',
    notes: notes ?? '',
    status: 'pending',
    rejectionReason: '',
    pointsAwarded: 0,  // Set by admin on approval
    submittedAt: Timestamp.now(),
    reviewedAt: null,
  });

  return submissionRef;
};

// ─── Admin: Approve/Reject Submissions ───
export const approveSubmission = async (
  submissionId: string,
  pointsAwarded: number
) => {
  const submissionRef = doc(db, 'submissions', submissionId);
  const submissionSnap = await getDoc(submissionRef);
  
  if (!submissionSnap.exists()) {
    throw new Error('Submission not found');
  }

  const submission = submissionSnap.data();
  const studentId = submission.studentId;

  // Update submission status
  await updateDoc(submissionRef, {
    status: 'approved',
    pointsAwarded,
    reviewedAt: Timestamp.now(),
  });

  // Award points to the student
  await updateDoc(doc(db, 'users', studentId), {
    pointsThisMonth: increment(pointsAwarded),
    totalTasksDone: increment(1),
  });

  // Create notification
  await addDoc(collection(db, 'notifications'), {
    toUserId: studentId,
    type: 'approved',
    message: `Task approved +${pointsAwarded} points`,
    isRead: false,
    createdAt: Timestamp.now(),
  });
};

export const rejectSubmission = async (
  submissionId: string,
  reason?: string
) => {
  const submissionRef = doc(db, 'submissions', submissionId);
  const submissionSnap = await getDoc(submissionRef);
  
  if (!submissionSnap.exists()) {
    throw new Error('Submission not found');
  }

  const studentId = submissionSnap.data().studentId;

  await updateDoc(submissionRef, {
    status: 'rejected',
    rejectionReason: reason ?? '',
    reviewedAt: Timestamp.now(),
  });

  // Create notification
  await addDoc(collection(db, 'notifications'), {
    toUserId: studentId,
    type: 'rejected',
    message: reason ? `Task rejected: ${reason}` : 'Task rejected',
    isRead: false,
    createdAt: Timestamp.now(),
  });
};

// ─── Leaderboard ───
export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const q = query(
    collection(db, 'users'),
    where('role', '==', 'student'),
    where('isActive', '==', true),
    orderBy('pointsThisMonth', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d, idx) => {
    const data = d.data();
    return {
      uid: d.id,
      name: data.name ?? '',
      initials: getInitials(data.name ?? ''),
      room: data.room ?? '',
      totalTasksDone: data.totalTasksDone ?? 0,
      points: data.pointsThisMonth ?? 0,
      rank: idx + 1,
    };
  });
};

// ─── Settings ───
export const getAppSettings = async (): Promise<AppSettings | null> => {
  const snap = await getDoc(doc(db, 'settings', 'global'));
  if (!snap.exists()) return null;
  const d = snap.data();
  return {
    currentMonth: d.currentMonth ?? '',
    announcement: d.announcement ?? '',
    announcementExpiry: tsToISO(d.announcementExpiry),
    reward1st: d.reward1st ?? '',
    reward2nd: d.reward2nd ?? '',
    reward3rd: d.reward3rd ?? '',
    lastResetAt: tsToISO(d.lastResetAt) ?? '',
  };
};

// ─── Notifications ───
export const getNotifications = async (uid: string): Promise<Notification[]> => {
  const q = query(
    collection(db, 'notifications'),
    where('toUserId', '==', uid),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      toUserId: data.toUserId ?? '',
      type: data.type ?? 'announcement',
      message: data.message ?? '',
      isRead: data.isRead ?? false,
      createdAt: tsToISO(data.createdAt) ?? '',
    };
  });
};

export const markNotificationRead = async (notificationId: string) => {
  await updateDoc(doc(db, 'notifications', notificationId), {
    isRead: true,
  });
};
