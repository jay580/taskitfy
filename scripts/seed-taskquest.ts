/**
 * TaskQuest Seed Script — run with: npx ts-node scripts/seed-taskquest.ts
 *
 * Creates data matching the TaskQuest schema:
 *  - 2 students (STU001, STU002)
 *  - 2 tasks
 *  - Settings with announcement
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
  Timestamp,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAa2y0mBwSoD5p75zWlmrB2soegcI0qVes',
  authDomain: 'ssiapp-6e196.firebaseapp.com',
  projectId: 'ssiapp-6e196',
  storageBucket: 'ssiapp-6e196.firebasestorage.app',
  messagingSenderId: '1032701302415',
  appId: '1:1032701302415:web:b0f8be5dc12f598970c2fa',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createOrSignInUser(email: string, password: string): Promise<string> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    console.log(`✅ Created auth user: ${email}, UID: ${cred.user.uid}`);
    return cred.user.uid;
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') {
      console.log(`⚠️  ${email} already exists — signing in`);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      console.log(`  Signed in as existing user, UID: ${cred.user.uid}`);
      return cred.user.uid;
    }
    throw err;
  }
}

async function seed() {
  console.log('🌱 Seeding TaskQuest schema...\n');

  // ── 1. Create students in Auth ──
  // Note: Firebase requires password to be at least 6 characters
  const stu001Uid = await createOrSignInUser('STU001@tq.app', 'Student123');
  const stu002Uid = await createOrSignInUser('STU002@tq.app', 'Student123');

  // ── 2. Create student user profiles (TaskQuest schema) ──
  await setDoc(doc(db, 'users', stu001Uid), {
    uid: stu001Uid,
    name: 'Student 1',
    studentId: 'STU001',
    room: 'A1',
    role: 'student',
    pointsThisMonth: 0,
    totalTasksDone: 0,
    streakDays: 0,
    badges: [],
    isActive: true,
    isSuspended: false,
    suspensionEnd: null,
  });
  console.log('✅ Created user profile for Student 1 (STU001)');

  await setDoc(doc(db, 'users', stu002Uid), {
    uid: stu002Uid,
    name: 'Student 2',
    studentId: 'STU002',
    room: 'A2',
    role: 'student',
    pointsThisMonth: 0,
    totalTasksDone: 0,
    streakDays: 0,
    badges: [],
    isActive: true,
    isSuspended: false,
    suspensionEnd: null,
  });
  console.log('✅ Created user profile for Student 2 (STU002)');

  // ── 3. Create tasks (TaskQuest schema) ──
  const tasks = [
    {
      title: 'Clean Room',
      description: 'Clean your room before inspection',
      category: 'Domestic',
      points: 10,
      deadline: null,
      assignedTo: 'all',
      isTeamTask: false,
      isRepeatable: false,
      isActive: true,
      createdAt: Timestamp.now(),
    },
    {
      title: 'Complete Homework',
      description: 'Finish all assigned homework for today',
      category: 'Academic',
      points: 15,
      deadline: Timestamp.fromDate(new Date(Date.now() + 3 * 86400000)), // 3 days from now
      assignedTo: 'all',
      isTeamTask: false,
      isRepeatable: false,
      isActive: true,
      createdAt: Timestamp.now(),
    },
  ];

  for (const t of tasks) {
    await addDoc(collection(db, 'tasks'), t);
    console.log(`✅ Created task: ${t.title} (+${t.points} points)`);
  }

  // ── 4. Create global settings ──
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  await setDoc(doc(db, 'settings', 'global'), {
    currentMonth: monthKey,
    announcement: 'Welcome to Shelter Don Bosco TaskQuest!',
    announcementExpiry: null,
    reward1st: 'Prize 1',
    reward2nd: 'Prize 2',
    reward3rd: 'Prize 3',
    lastResetAt: Timestamp.now(),
  });
  console.log('✅ Created global settings with announcement');

  // ── 5. Initialize monthly results (optional, for leaderboard) ──
  await setDoc(doc(db, 'monthlyResults', `${monthKey}_${stu001Uid}`), {
    monthKey,
    studentId: stu001Uid,
    points: 0,
    rank: 0,
    tasksDone: 0,
    rewardGiven: false,
    rewardNote: '',
  });

  await setDoc(doc(db, 'monthlyResults', `${monthKey}_${stu002Uid}`), {
    monthKey,
    studentId: stu002Uid,
    points: 0,
    rank: 0,
    tasksDone: 0,
    rewardGiven: false,
    rewardNote: '',
  });
  console.log('✅ Initialized monthly results');

  console.log('\n🎉 TaskQuest seed complete!');
  console.log('   Login as STU001: STU001@tq.app / Student123');
  console.log('   Login as STU002: STU002@tq.app / Student123');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
