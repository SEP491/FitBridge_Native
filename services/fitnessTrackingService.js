import { Pedometer } from "expo-sensors";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BACKGROUND_FETCH_TASK = "background-fitness-fetch";
const STORAGE_KEYS = {
  DAILY_STEPS: "daily_steps",
  FITNESS_DATA: "fitness_data",
  LAST_RESET_DATE: "last_reset_date",
  USER_PROFILE: "user_profile",
  TODAY_BASE_STEPS: "today_base_steps", // Steps from device at start of day
};

// Default user profile for calorie calculation
const DEFAULT_USER_PROFILE = {
  weight: 70, // kg
  height: 170, // cm
  age: 25,
  gender: "male", // male or female
};

class FitnessTrackingService {
  constructor() {
    this.stepSubscription = null;
    this.isTracking = false;
    this.todaySteps = 0;
    this.baseStepsToday = 0; // Device steps count at start of day
    this.realTimeSteps = 0; // Real-time incremental steps from watchStepCount
    this.todayDistance = 0;
    this.todayCalories = 0;
    this.userProfile = DEFAULT_USER_PROFILE;
    this.listeners = [];
  }

  // Initialize the service
  async initialize() {
    try {
      await this.loadUserProfile();
      await this.checkAndResetDailyData();
      await this.loadTodayData();
      await this.registerBackgroundTask();
      return true;
    } catch (error) {
      console.error("Error initializing fitness tracking service:", error);
      return false;
    }
  }

  // Load user profile for calorie calculation
  async loadUserProfile() {
    try {
      const profileData = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (profileData) {
        this.userProfile = {
          ...DEFAULT_USER_PROFILE,
          ...JSON.parse(profileData),
        };
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  }

  // Update user profile
  async updateUserProfile(profile) {
    try {
      this.userProfile = { ...this.userProfile, ...profile };
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(this.userProfile)
      );
      // Recalculate metrics with new profile
      this.updateDerivedMetrics();
      this.notifyListeners();
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
  }

  // Check if we need to reset daily data (new day)
  async checkAndResetDailyData() {
    try {
      const today = new Date().toDateString();
      const lastResetDate = await AsyncStorage.getItem(
        STORAGE_KEYS.LAST_RESET_DATE
      );

      if (lastResetDate !== today) {
        console.log("New day detected, resetting daily data");
        await this.resetDailyData();
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_RESET_DATE, today);
      }
    } catch (error) {
      console.error("Error checking daily data:", error);
    }
  }

  // Reset daily data for new day
  async resetDailyData() {
    try {
      // Save yesterday's data to history first
      if (this.todaySteps > 0) {
        await this.saveYesterdayData();
      }

      // Reset all counters
      this.todaySteps = 0;
      this.baseStepsToday = 0;
      this.realTimeSteps = 0;
      this.todayDistance = 0;
      this.todayCalories = 0;

      // Clear storage
      await AsyncStorage.removeItem(STORAGE_KEYS.DAILY_STEPS);
      await AsyncStorage.removeItem(STORAGE_KEYS.TODAY_BASE_STEPS);

      console.log("Daily data reset complete");
    } catch (error) {
      console.error("Error resetting daily data:", error);
    }
  }

  // Save yesterday's data to history
  async saveYesterdayData() {
    try {
      const fitnessData = await this.getFitnessHistory();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = yesterday.toDateString();

      fitnessData[yesterdayKey] = {
        steps: this.todaySteps,
        distance: this.todayDistance,
        calories: this.todayCalories,
        date: yesterday.toISOString(),
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.FITNESS_DATA,
        JSON.stringify(fitnessData)
      );
      console.log(`Saved yesterday's data: ${this.todaySteps} steps`);
    } catch (error) {
      console.error("Error saving yesterday data:", error);
    }
  }

  // Load today's data from storage
  async loadTodayData() {
    try {
      // Load stored step count and base steps
      const steps = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_STEPS);
      const baseSteps = await AsyncStorage.getItem(
        STORAGE_KEYS.TODAY_BASE_STEPS
      );

      this.todaySteps = steps ? parseInt(steps) : 0;
      this.baseStepsToday = baseSteps ? parseInt(baseSteps) : 0;

      // Calculate derived metrics
      this.updateDerivedMetrics();

      console.log(
        `Loaded today's data: ${this.todaySteps} steps (base: ${this.baseStepsToday})`
      );
    } catch (error) {
      console.error("Error loading today data:", error);
    }
  }

  // Start step tracking with real-time updates
  async startTracking() {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        throw new Error("Pedometer is not available on this device");
      }

      const permission = await Pedometer.requestPermissionsAsync();
      if (!permission.granted) {
        throw new Error("Pedometer permission not granted");
      }

      // Get today's total steps from device
      const deviceStepsToday = await this.getDeviceStepsToday();

      // If this is first time today or we don't have base steps, set them
      if (this.baseStepsToday === 0 && this.todaySteps === 0) {
        this.baseStepsToday = deviceStepsToday;
        this.todaySteps = deviceStepsToday;
        await AsyncStorage.setItem(
          STORAGE_KEYS.TODAY_BASE_STEPS,
          this.baseStepsToday.toString()
        );
        await this.saveStepCount(this.todaySteps);
      } else if (this.baseStepsToday > 0) {
        // We have base steps, calculate current steps
        this.todaySteps =
          this.baseStepsToday + (deviceStepsToday - this.baseStepsToday);
      }

      // Start real-time step watching
      this.stepSubscription = Pedometer.watchStepCount((result) => {
        // result.steps are incremental steps since watchStepCount started
        this.realTimeSteps = result.steps;

        // Calculate total steps: base steps for today + real-time incremental steps
        const newTotalSteps = this.todaySteps + this.realTimeSteps;

        console.log(
          `Real-time update: +${result.steps} new steps, total: ${newTotalSteps}`
        );

        // Update immediately for real-time UI
        this.updateStepCount(newTotalSteps, true);
      });

      this.isTracking = true;

      // Update derived metrics and notify
      this.updateDerivedMetrics();
      this.notifyListeners();

      console.log(`Started real-time tracking: ${this.todaySteps} steps`);
      return true;
    } catch (error) {
      console.error("Error starting step tracking:", error);
      return false;
    }
  }

  // Get device steps for today
  async getDeviceStepsToday() {
    try {
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      const result = await Pedometer.getStepCountAsync(startOfDay, today);
      return result ? result.steps : 0;
    } catch (error) {
      console.error("Error getting device steps:", error);
      return 0;
    }
  }

  // Stop step tracking
  stopTracking() {
    if (this.stepSubscription) {
      this.stepSubscription.remove();
      this.stepSubscription = null;
    }

    this.isTracking = false;
    this.realTimeSteps = 0;
    console.log("Stopped tracking");
  }

  // Update step count (internal method)
  updateStepCount(newSteps, shouldSave = true) {
    if (this.todaySteps !== newSteps) {
      this.todaySteps = newSteps;

      if (shouldSave) {
        this.saveStepCount(newSteps);
      }

      this.updateDerivedMetrics();
      this.notifyListeners();
    }
  }

  // Save step count to storage
  async saveStepCount(steps) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_STEPS, steps.toString());
    } catch (error) {
      console.error("Error saving step count:", error);
    }
  }

  // Update derived metrics (distance, calories)
  updateDerivedMetrics() {
    this.todayDistance = this.calculateDistance(this.todaySteps);
    this.todayCalories = this.calculateCalories(
      this.todaySteps,
      this.todayDistance
    );
  }

  // Calculate walking distance based on steps
  calculateDistance(steps) {
    // More accurate step length calculation based on height
    const heightInMeters = this.userProfile.height / 100;
    let stepLength;

    if (this.userProfile.gender === "female") {
      stepLength = heightInMeters * 0.413; // Slightly shorter for women
    } else {
      stepLength = heightInMeters * 0.415; // Standard for men
    }

    // Safety bounds for step length
    stepLength = Math.max(stepLength, 0.6);
    stepLength = Math.min(stepLength, 0.85);

    return (steps * stepLength) / 1000; // Return in kilometers
  }

  // Calculate calories burned
  calculateCalories(steps, distance) {
    const weight = this.userProfile.weight;
    const timeInMinutes = steps / 100; // Rough estimate: 100 steps per minute

    // MET formula for walking
    const metValue = 3.5; // Walking MET value
    const timeInHours = timeInMinutes / 60;
    const caloriesFromMET = metValue * weight * timeInHours;

    // Alternative step-based calculation
    const caloriesPerStep = (weight * 0.04) / 70; // Normalized to 70kg person
    const caloriesFromSteps = steps * caloriesPerStep;

    // Use average of both methods
    const totalCalories = (caloriesFromMET + caloriesFromSteps) / 2;

    return Math.round(Math.max(totalCalories, 0));
  }

  // Get current fitness data
  getCurrentFitnessData() {
    return {
      steps: this.todaySteps,
      distance: parseFloat(this.todayDistance.toFixed(2)),
      calories: this.todayCalories,
      date: new Date().toISOString(),
      isTracking: this.isTracking,
      realTimeSteps: this.realTimeSteps, // For debugging
    };
  }

  // Manual refresh method
  async manualRefresh() {
    try {
      console.log("Manual refresh requested");

      // Get latest device steps and update if needed
      const deviceStepsToday = await this.getDeviceStepsToday();

      // If we have base steps, calculate total
      if (this.baseStepsToday > 0) {
        const calculatedSteps =
          this.baseStepsToday +
          (deviceStepsToday - this.baseStepsToday) +
          this.realTimeSteps;
        if (calculatedSteps !== this.todaySteps) {
          this.updateStepCount(calculatedSteps, true);
        }
      }

      return this.getCurrentFitnessData();
    } catch (error) {
      console.error("Error in manual refresh:", error);
      return this.getCurrentFitnessData();
    }
  }

  // Debug info
  getDebugInfo() {
    return {
      todaySteps: this.todaySteps,
      baseStepsToday: this.baseStepsToday,
      realTimeSteps: this.realTimeSteps,
      isTracking: this.isTracking,
      distance: this.todayDistance,
      calories: this.todayCalories,
    };
  }

  // Get fitness history
  async getFitnessHistory() {
    try {
      const historyData = await AsyncStorage.getItem(STORAGE_KEYS.FITNESS_DATA);
      return historyData ? JSON.parse(historyData) : {};
    } catch (error) {
      console.error("Error getting fitness history:", error);
      return {};
    }
  }

  // Get weekly summary
  async getWeeklySummary() {
    try {
      const history = await this.getFitnessHistory();
      const today = new Date();
      const weekData = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toDateString();

        if (i === 0) {
          // Today's data
          weekData.push({
            date: date.toISOString(),
            steps: this.todaySteps,
            distance: this.todayDistance,
            calories: this.todayCalories,
          });
        } else {
          // Historical data
          const dayData = history[dateKey] || {
            steps: 0,
            distance: 0,
            calories: 0,
          };
          weekData.push({
            date: date.toISOString(),
            ...dayData,
          });
        }
      }

      return weekData;
    } catch (error) {
      console.error("Error getting weekly summary:", error);
      return [];
    }
  }

  // Get monthly summary
  async getMonthlySummary() {
    try {
      const history = await this.getFitnessHistory();
      const today = new Date();
      const monthData = [];

      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toDateString();

        if (i === 0) {
          // Today's data
          monthData.push({
            date: date.toISOString(),
            steps: this.todaySteps,
            distance: this.todayDistance,
            calories: this.todayCalories,
          });
        } else {
          // Historical data
          const dayData = history[dateKey] || {
            steps: 0,
            distance: 0,
            calories: 0,
          };
          monthData.push({
            date: date.toISOString(),
            ...dayData,
          });
        }
      }

      return monthData;
    } catch (error) {
      console.error("Error getting monthly summary:", error);
      return [];
    }
  }

  // Register background task
  async registerBackgroundTask() {
    try {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 15000, // 15 seconds
        stopOnTerminate: false,
        startOnBoot: true,
      });
      console.log("Background fetch task registered");
    } catch (error) {
      console.error("Error registering background task:", error);
    }
  }

  // Unregister background task
  async unregisterBackgroundTask() {
    try {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    } catch (error) {
      console.error("Error unregistering background task:", error);
    }
  }

  // Listener management
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(
        (listener) => listener !== callback
      );
    };
  }

  notifyListeners() {
    this.listeners.forEach((callback) => {
      try {
        callback(this.getCurrentFitnessData());
      } catch (error) {
        console.error("Error notifying fitness listener:", error);
      }
    });
  }
}

// Background task definition
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    console.log("Background fitness tracking task running");

    const service = new FitnessTrackingService();
    await service.initialize();
    await service.checkAndResetDailyData();

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error("Background fetch task error:", error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Singleton instance
const fitnessTrackingService = new FitnessTrackingService();

export default fitnessTrackingService;
export { BACKGROUND_FETCH_TASK };
