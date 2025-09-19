import { Pedometer } from "expo-sensors";
import * as BackgroundFetch from "expo-background-fetch";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BACKGROUND_FETCH_TASK = "background-fitness-fetch";
const STORAGE_KEYS = {
  DAILY_STEPS: "daily_steps",
  FITNESS_DATA: "fitness_data",
  LAST_RESET_DATE: "last_reset_date",
  USER_PROFILE: "user_profile", // For weight, height, age to calculate calories
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
    this.todayDistance = 0;
    this.todayCalories = 0;
    this.userProfile = DEFAULT_USER_PROFILE;
  }

  // Initialize the service
  async initialize() {
    try {
      await this.loadUserProfile();
      await this.loadTodayData();
      await this.checkAndResetDailyData();
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
        // New day, reset daily data
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
      this.todaySteps = 0;
      this.todayDistance = 0;
      this.todayCalories = 0;
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_STEPS, "0");

      // Save yesterday's data to history if there was any
      const fitnessData = await this.getFitnessHistory();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = yesterday.toDateString();

      if (this.todaySteps > 0) {
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
      }
    } catch (error) {
      console.error("Error resetting daily data:", error);
    }
  }

  // Load today's data from storage
  async loadTodayData() {
    try {
      const steps = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_STEPS);
      this.todaySteps = steps ? parseInt(steps) : 0;
      this.todayDistance = this.calculateDistance(this.todaySteps);
      this.todayCalories = this.calculateCalories(
        this.todaySteps,
        this.todayDistance
      );
    } catch (error) {
      console.error("Error loading today data:", error);
    }
  }

  // Start step tracking
  async startTracking() {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        throw new Error("Pedometer is not available on this device");
      }

      // Get permission
      const permission = await Pedometer.requestPermissionsAsync();
      if (!permission.granted) {
        throw new Error("Pedometer permission not granted");
      }

      // Start listening to step updates
      this.stepSubscription = Pedometer.watchStepCount((result) => {
        this.updateStepCount(result.steps);
      });

      this.isTracking = true;
      return true;
    } catch (error) {
      console.error("Error starting step tracking:", error);
      return false;
    }
  }

  // Stop step tracking
  stopTracking() {
    if (this.stepSubscription) {
      this.stepSubscription.remove();
      this.stepSubscription = null;
    }
    this.isTracking = false;
  }

  // Update step count and calculate derived metrics
  async updateStepCount(newSteps) {
    try {
      this.todaySteps = newSteps;
      this.todayDistance = this.calculateDistance(newSteps);
      this.todayCalories = this.calculateCalories(newSteps, this.todayDistance);

      // Save to storage
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_STEPS, newSteps.toString());

      // Notify listeners (if any)
      this.notifyListeners();
    } catch (error) {
      console.error("Error updating step count:", error);
    }
  }

  // Calculate walking distance based on steps
  calculateDistance(steps) {
    // Average step length: 0.762 meters for men, 0.67 meters for women
    const stepLength = this.userProfile.gender === "female" ? 0.67 : 0.762;
    return (steps * stepLength) / 1000; // Return in kilometers
  }

  // Calculate calories burned
  calculateCalories(steps, distance) {
    // More accurate calorie calculation
    // Based on research: approximately 0.04-0.05 calories per step for average person
    // Formula accounts for weight: (steps × 0.04 × weight) / 70 (normalized to 70kg person)
    const weight = this.userProfile.weight;
    const baseCaloriesPerStep = 0.045; // More realistic base rate
    const weightFactor = weight / 70; // Normalize to 70kg baseline
    const totalCalories = steps * baseCaloriesPerStep * weightFactor;
    return Math.round(totalCalories);
  }

  // Get current fitness data
  getCurrentFitnessData() {
    return {
      steps: this.todaySteps,
      distance: parseFloat(this.todayDistance.toFixed(2)),
      calories: this.todayCalories,
      date: new Date().toISOString(),
      isTracking: this.isTracking,
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
        minimumInterval: 15000, // 15 seconds (minimum allowed)
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
      console.log("Background fetch task unregistered");
    } catch (error) {
      console.error("Error unregistering background task:", error);
    }
  }

  // Listener management
  listeners = [];

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

    // Create a temporary instance to update data
    const service = new FitnessTrackingService();
    await service.initialize();

    // Check if it's a new day and reset if needed
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
