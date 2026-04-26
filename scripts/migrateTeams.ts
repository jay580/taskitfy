import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';

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

const validTeams = ['earth', 'water', 'fire', 'wind'];

const mapTeamName = (teamName: string | undefined): string | null => {
  if (!teamName) return null;
  const normalized = teamName.trim().toLowerCase();
  if (validTeams.includes(normalized)) return normalized;
  
  // Custom mapping rules (if any exist)
  if (normalized === 'team earth') return 'earth';
  if (normalized === 'team water') return 'water';
  if (normalized === 'team fire') return 'fire';
  if (normalized === 'team wind') return 'wind';

  return null; // Unmatched
};

async function run() {
  console.log("Fetching users...");
  const usersSnap = await getDocs(collection(db, 'users'));
  const users = usersSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

  const validMappings: any[] = [];
  const unmatchedUsers: any[] = [];

  for (const user of users) {
    if (user.role === 'admin') continue; // Skip admins

    const oldName = user.teamName || '';
    const newId = mapTeamName(oldName);

    if (newId) {
      validMappings.push({
        uid: user.id,
        name: user.name,
        oldTeamName: oldName,
        newTeamId: newId
      });
    } else {
      unmatchedUsers.push({
        uid: user.id,
        name: user.name,
        oldTeamName: oldName,
      });
    }
  }

  console.log("\n================ DRY RUN RESULTS ================");
  console.log(`Total students processed: ${validMappings.length + unmatchedUsers.length}`);
  console.log(`Valid mappings: ${validMappings.length}`);
  console.log(`Unmatched users: ${unmatchedUsers.length}`);

  console.log("\n--- VALID MAPPINGS ---");
  validMappings.forEach(m => console.log(`${m.name} (${m.uid}): "${m.oldTeamName}" -> "${m.newTeamId}"`));

  console.log("\n--- UNMATCHED USERS (Requires Manual Review) ---");
  unmatchedUsers.forEach(m => console.log(`${m.name} (${m.uid}): "${m.oldTeamName}" -> NO MATCH`));
  console.log("=================================================");

  console.log("\n================ MIGRATION START ================");
  
  // 1. Initialize static teams
  console.log("Initializing static teams...");
  for (const teamId of validTeams) {
    const teamRef = doc(db, 'teams', teamId);
    const teamDoc = await getDocs(collection(db, 'teams'));
    let exists = false;
    teamDoc.forEach(d => { if (d.id === teamId) exists = true; });
    
    if (!exists) {
      await setDoc(teamRef, {
        id: teamId,
        name: teamId.charAt(0).toUpperCase() + teamId.slice(1),
        totalPoints: 0,
        members: []
      });
      console.log(`Created team: ${teamId}`);
    } else {
      console.log(`Team ${teamId} already exists`);
    }
  }

  // 2. Migrate Users
  let migratedCount = 0;
  for (const m of validMappings) {
    const userRef = doc(db, 'users', m.uid);
    await updateDoc(userRef, {
      teamId: m.newTeamId
    });
    console.log(`Migrated user ${m.name} to teamId: ${m.newTeamId}`);
    migratedCount++;
  }

  console.log(`\n================ MIGRATION COMPLETE ================`);
  console.log(`Successfully migrated ${migratedCount} users.`);
  console.log("Note: teamName field was retained for verification. Unmatched users were skipped.");

  process.exit(0);
}

run().catch(console.error);
