# Database Schema - TASKQUEST (Firestore)

This document outlines the collections and document structures used in the Firestore database for the TaskQuest application (NGO Edition).

## 1. `users` Collection
Stores profile information for all registered users (Students and Admins).

| Field | Type | Description |
|-------|------|-------------|
| `uid` | string | Unique User ID (matches Firebase Auth UID) |
| `name` | string | Full name of the user |
| `studentId` | string | Student identifier (e.g., "STU001") - students only |
| `room` | string | Assigned room/group identifier |
| `role` | string | Role of the user (`student` or `admin`) |
| `pointsThisMonth` | number | Points earned in the current month |
| `totalTasksDone` | number | Number of tasks successfully completed |
| `streakDays` | number | Current daily activity streak |
| `badges` | array | List of earned badge identifiers |
| `isActive` | boolean | Whether the user account is active |
| `isSuspended` | boolean | Whether the user is currently suspended |
| `suspensionEnd` | timestamp | When the suspension ends (null if not suspended) |

## 2. `tasks` Collection
Stores the tasks created by administrators.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique document ID |
| `title` | string | Task title |
| `description` | string | Detailed task requirements |
| `category` | string | Category (`Academic`, `Domestic`, `Sports`, `Special`) |
| `points` | number | Points awarded for completion (5, 10, 15, or 20) |
| `deadline` | timestamp | Task deadline (nullable) |
| `assignedTo` | string | Target users: "all" or specific UID |
| `isTeamTask` | boolean | Whether this is a team task |
| `isRepeatable` | boolean | Whether the task can be done multiple times |
| `isActive` | boolean | Whether the task is currently active |
| `createdAt` | timestamp | Timestamp of task creation |

## 3. `submissions` Collection
Stores task completions submitted by students.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique document ID |
| `taskId` | string | ID of the linked task (optional for self-created tasks) |
| `studentId` | string | UID of the student who submitted |
| `type` | string | Submission type: `task` (assigned) or `self` (student-created) |
| `title` | string | Task/submission title |
| `description` | string | Task/submission description |
| `photoUrl` | string | URL of proof photo |
| `notes` | string | Optional notes from student |
| `status` | string | Status: `pending`, `approved`, `rejected` |
| `rejectionReason` | string | Reason for rejection (if rejected) |
| `pointsAwarded` | number | Points awarded (set by admin on approval) |
| `submittedAt` | timestamp | Timestamp of submission |
| `reviewedAt` | timestamp | Timestamp of review (nullable) |

## 4. `monthlyResults` Collection
Stores monthly leaderboard and results data.

| Field | Type | Description |
|-------|------|-------------|
| `monthKey` | string | Month identifier (e.g., "2025-01") |
| `studentId` | string | UID of the student |
| `points` | number | Points earned this month |
| `rank` | number | Rank on the leaderboard |
| `tasksDone` | number | Number of tasks completed |
| `rewardGiven` | boolean | Whether the reward has been given |
| `rewardNote` | string | Notes about the reward |

## 5. `settings` Collection
Global configuration settings (single document: "global").

| Field | Type | Description |
|-------|------|-------------|
| `currentMonth` | string | Current month key (e.g., "2025-01") |
| `announcement` | string | Current announcement message |
| `announcementExpiry` | timestamp | When the announcement expires (nullable) |
| `reward1st` | string | Prize for 1st place |
| `reward2nd` | string | Prize for 2nd place |
| `reward3rd` | string | Prize for 3rd place |
| `lastResetAt` | timestamp | Last monthly reset timestamp |

## 6. `notifications` Collection
User notifications for approvals, rejections, announcements.

| Field | Type | Description |
|-------|------|-------------|
| `toUserId` | string | UID of the recipient |
| `type` | string | Notification type (e.g., "approved", "rejected") |
| `message` | string | Notification message |
| `isRead` | boolean | Whether the notification has been read |
| `createdAt` | timestamp | Timestamp of notification creation |

---

## Business Logic Rules

### Suspension Logic
- If `isSuspended === true` AND `currentTime < suspensionEnd`:
  - ❌ Cannot submit tasks
  - ❌ Cannot create self tasks

### Points Logic
- **Assigned Tasks**: Use `task.points`
- **Self Tasks**: Admin sets `pointsAwarded` manually on approval

### Approval Flow
When admin approves:
1. Update submission: `status: "approved"`, `pointsAwarded: X`
2. Update user: `pointsThisMonth += X`, `totalTasksDone += 1`

### Reject Flow
Update submission: `status: "rejected"`, `rejectionReason: "..."`
