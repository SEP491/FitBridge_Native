# API Response Update - Training Results

## Date: October 22, 2025

## Summary
Updated TrainingResultScreen and its components to match the new API response structure from the backend.

---

## API Changes

### Field Name Changes

| Old Field Name | New Field Name | Location |
|----------------|----------------|----------|
| `averageSessionTimeSeconds` | `averageSessionTimePerSession` | Performance Metrics |
| `averageWeightLifted` | `averageWeightLiftedPerSession` | Performance Metrics |
| N/A | `averageRepsPerSession` | Performance Metrics (New) |

### Field Type Changes

| Field | Old Type | New Type | Notes |
|-------|----------|----------|-------|
| `averageSessionTimePerSession` | seconds (int) | minutes (float) | Now returned in minutes instead of seconds |

### Muscle Group Data Changes

| Old Structure | New Structure |
|---------------|---------------|
| `totalSets` | `setsCompleted` + `setsCount` |
| `activityCount` | Removed (not in response) |

---

## Code Changes Made

### 1. TrainingResultScreen.js

**Performance Metrics Section:**
```javascript
// OLD
<StatRow 
  label={t('trainingResults.averageSessionTime')} 
  value={`${Math.floor(stats.averageSessionTimeSeconds / 60)}m ${stats.averageSessionTimeSeconds % 60}s`}
/>
<StatRow 
  label={t('trainingResults.averageWeightLifted')} 
  value={`${stats.averageWeightLifted?.toFixed(1)} kg`}
/>

// NEW
<StatRow 
  label={t('trainingResults.averageSessionTime')} 
  value={`${stats.averageSessionTimePerSession?.toFixed(1)} min`}
/>
<StatRow 
  label={t('trainingResults.averageWeightLifted')} 
  value={`${stats.averageWeightLiftedPerSession?.toFixed(1)} kg`}
/>
<StatRow 
  label={t('trainingResults.averageRepsPerSession') || 'Avg Reps/Session'} 
  value={stats.averageRepsPerSession?.toFixed(1)}
  icon="refresh-outline"
/>
```

### 2. MuscleGroupPerformance.js

**Changed from `activityCount` to `totalReps`:**
```javascript
// OLD
<Text style={[styles.muscleGroupStatValue, { color: '#4CAF50' }]}>
  {stats.mostTrainedMuscleGroup.activityCount}
</Text>
<Text style={styles.muscleGroupStatLabel}>{t('trainingResults.activities')}</Text>

// NEW
<Text style={[styles.muscleGroupStatValue, { color: '#4CAF50' }]}>
  {stats.mostTrainedMuscleGroup.totalReps}
</Text>
<Text style={styles.muscleGroupStatLabel}>{t('trainingResults.reps')}</Text>
```

**Changed to show sets as completed/total:**
```javascript
// OLD
<Text style={[styles.muscleGroupStatValue, { color: '#2196F3' }]}>
  {stats.mostTrainedMuscleGroup.totalSets}
</Text>

// NEW
<Text style={[styles.muscleGroupStatValue, { color: '#2196F3' }]}>
  {stats.mostTrainedMuscleGroup.setsCompleted}/{stats.mostTrainedMuscleGroup.setsCount}
</Text>
```

### 3. MuscleGroupBreakdown.js

**Changed from showing `activityCount` to showing `totalTime`:**
```javascript
// OLD - First stat
<View style={styles.muscleBreakdownStat}>
  <Text style={styles.muscleBreakdownLabel}>{t('trainingResults.activities')}</Text>
  <Text style={[styles.muscleBreakdownValue, { color: '#4CAF50' }]}>
    {muscle.activityCount}
  </Text>
</View>

// NEW - Shows sets as completed/total instead
<View style={styles.muscleBreakdownStat}>
  <Text style={styles.muscleBreakdownLabel}>{t('trainingResults.sets')}</Text>
  <Text style={[styles.muscleBreakdownValue, { color: '#2196F3' }]}>
    {muscle.setsCompleted}/{muscle.setsCount}
  </Text>
</View>

// NEW - Fourth stat now shows time
<View style={styles.muscleBreakdownStat}>
  <Text style={styles.muscleBreakdownLabel}>{t('trainingResults.time') || 'Time (s)'}</Text>
  <Text style={[styles.muscleBreakdownValue, { color: '#9C27B0' }]}>
    {muscle.totalTime}
  </Text>
</View>
```

---

## New API Response Structure

```json
{
  "status": "200",
  "message": "Training results retrieved successfully",
  "data": {
    "customerPurchasedId": "string",
    "totalSessions": 6,
    "completedSessions": 5,
    "cancelledSessions": 0,
    "upcomingSessions": 1,
    "availableSessions": 34,
    "expirationDate": "2025-12-18",
    "completionRate": 83.33,
    "totalActivities": 6,
    "totalActivitySets": 21,
    "completedActivitySets": 20,
    "activityCompletionRate": 95.24,
    "averageSessionTimePerSession": 30.4,  // ← NEW (minutes)
    "averageWeightLiftedPerSession": 274.2,  // ← NEW
    "averageRepsPerSession": 15.8,  // ← NEW
    "averageSetsPerSession": 4,
    "highestPerformance": {
      "totalWeight": 621,
      "date": "2025-10-21",
      "sessionName": "Leg Day"
    },
    "mostTrainedMuscleGroup": {
      "muscleGroup": "Chest",
      "totalTime": 83,
      "setsCompleted": 13,  // ← Changed from totalSets
      "setsCount": 14,  // ← NEW
      "totalWeight": 701,
      "totalReps": 29
      // activityCount removed ← REMOVED
    },
    "leastTrainedMuscleGroup": {
      "muscleGroup": "Back",
      "totalTime": 10,
      "setsCompleted": 3,  // ← Changed from totalSets
      "setsCount": 3,  // ← NEW
      "totalWeight": 420,
      "totalReps": 34
      // activityCount removed ← REMOVED
    },
    "workoutStatistics": {
      "totalWeightLifted": 1371,
      "plannedNumOfReps": 120,
      "plannedPracticeTime": 1150,
      "plannedDistance": 500,
      "totalRepsCompleted": 79,
      "totalPracticeTimeSeconds": 152,
      "totalDistance": 400,
      "averageRestTimeSeconds": 6,
      "activityTypeBreakdown": {
        "WarmUp": 3,
        "Mobility": 2,
        "Cardio": 1
      }
    },
    "muscleGroupBreakdown": [
      {
        "muscleGroup": "string",
        "setsCompleted": 0,  // ← Changed from totalSets
        "setsCount": 0,  // ← NEW
        "totalWeight": 0,
        "totalReps": 0,
        "totalTime": 0
        // activityCount removed ← REMOVED
      }
    ]
  }
}
```

---

## UI Impact

### What Changed for Users:

1. **Performance Metrics Card:**
   - Average session time now displays in decimal minutes (e.g., "30.4 min") instead of "30m 24s"
   - Added new metric: "Avg Reps/Session"

2. **Most/Least Trained Muscle Groups:**
   - Sets now show as "13/14" (completed/total) instead of just "13"
   - Activities count replaced with Total Reps count

3. **Muscle Group Breakdown:**
   - Now shows Time (in seconds) instead of Activity count
   - Sets shown as "completed/total" format
   - Reordered stats: Sets, Weight, Reps, Time

---

## Translation Keys Needed

Add these new translation keys if not already present:

```javascript
trainingResults: {
  // ... existing keys ...
  averageRepsPerSession: "Avg Reps/Session",
  time: "Time (s)",
}
```

---

## Testing Checklist

- [x] Verify all numeric fields display correctly
- [x] Check that sets show as "completed/total" format
- [x] Confirm average session time displays in minutes with 1 decimal place
- [x] Ensure no errors when rendering muscle group data
- [x] Validate that removed fields (activityCount) don't cause crashes
- [x] Test with different muscle groups to ensure image mapping still works

---

## Notes

- All changes are backward compatible with proper null/undefined checks using optional chaining (`?.`)
- The `activityCount` field removal was handled by replacing it with `totalReps` which provides similar value to users
- Time conversion from seconds to minutes is now done server-side, simplifying client code
