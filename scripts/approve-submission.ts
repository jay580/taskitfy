/**
 * Approve submission script
 * Run with: npx ts-node scripts/approve-submission.ts <submissionId>
 * 
 * This will:
 * 1. Update submission status to 'approved'
 * 2. Add points to the student's totalPoints and monthlyPoints
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  increment,
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
const db = getFirestore(app);

async function approveSubmission(submissionId: string) {
  console.log(`\n🔍 Looking up submission: ${submissionId}`);

  const submissionRef = doc(db, 'submissions', submissionId);
  const submissionSnap = await getDoc(submissionRef);

  if (!submissionSnap.exists()) {
    console.error('❌ Submission not found!');
    process.exit(1);
  }

  const submission = submissionSnap.data();
  console.log(`📋 Task: ${submission.taskTitle}`);
  console.log(`👤 Student ID: ${submission.studentId}`);
  console.log(`⭐ Points: ${submission.taskPoints}`);
  console.log(`📊 Current status: ${submission.status}`);

  if (submission.status === 'approved') {
    console.log('\n⚠️  This submission is already approved!');
    process.exit(0);
  }

  // Update submission status
  await updateDoc(submissionRef, {
    status: 'approved',
    reviewedBy: 'admin-script',
    reviewedAt: Timestamp.now(),
  });
  console.log('\n✅ Submission status updated to "approved"');

  // Award points to the student
  const studentRef = doc(db, 'users', submission.studentId);
  await updateDoc(studentRef, {
    totalPoints: increment(submission.taskPoints),
    monthlyPoints: increment(submission.taskPoints),
  });
  console.log(`✅ Added ${submission.taskPoints} points to student's account`);

  console.log('\n🎉 Approval complete!');
  process.exit(0);
}

// Get submission ID from command line
const submissionId = process.argv[2];

if (!submissionId) {
  console.log('Usage: npx ts-node scripts/approve-submission.ts <submissionId>');
  console.log('\nTo find submission IDs, check Firestore Console → submissions collection');
  process.exit(1);
}

approveSubmission(submissionId).catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
