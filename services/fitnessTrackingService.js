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
  TODAY_DATA: "today_data", // Complete today's fitness data
  WEEKLY_CACHE: "weekly_cache", // Cached weekly data
  MONTHLY_CACHE: "monthly_cache", // Cached monthly data
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
      console.error("Error initializing fitness service:", error.message);
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
      console.error("Error loading profile:", error.message);
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
      console.error("Error updating profile:", error.message);
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
        console.log("New day detected");
        await this.resetDailyData();
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_RESET_DATE, today);
      }
    } catch (error) {
      console.error("Error checking daily data:", error.message);
    }
  }

  // Reset daily data for new day
  async resetDailyData() {
    try {
      // Save yesterday's data to history first
      if (this.todaySteps > 0) {
        await this.saveYesterdayData();
        console.log(`Saved yesterday's data: ${this.todaySteps} steps`);
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
      await AsyncStorage.removeItem(STORAGE_KEYS.TODAY_DATA);

      // Clear cached weekly/monthly data to force refresh
      await AsyncStorage.removeItem(STORAGE_KEYS.WEEKLY_CACHE);
      await AsyncStorage.removeItem(STORAGE_KEYS.MONTHLY_CACHE);

      // Update last reset date
      const today = new Date().toDateString();
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_RESET_DATE, today);

      console.log("Daily data reset");
    } catch (error) {
      console.error("Error resetting daily data:", error.message);
    }
  }

  // Save yesterday's data to history
  async saveYesterdayData() {
    try {
      const fitnessData = await this.getFitnessHistory();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = yesterday.toDateString();

      const dataToSave = {
        steps: this.todaySteps,
        distance: this.todayDistance,
        calories: this.todayCalories,
        date: yesterday.toISOString(),
      };

      fitnessData[yesterdayKey] = dataToSave;

      await AsyncStorage.setItem(
        STORAGE_KEYS.FITNESS_DATA,
        JSON.stringify(fitnessData)
      );
    } catch (error) {
      console.error("Error saving yesterday data:", error.message);
    }
  }

  // Load today's data from storage
  async loadTodayData() {
    try {
      // Try to load complete today's data first
      const todayDataStr = await AsyncStorage.getItem(STORAGE_KEYS.TODAY_DATA);

      if (todayDataStr) {
        const todayData = JSON.parse(todayDataStr);
        const today = new Date().toDateString();

        // Check if the stored data is from today
        if (todayData.date === today) {
          this.todaySteps = todayData.steps || 0;
          this.baseStepsToday = todayData.baseSteps || 0;
          this.todayDistance = todayData.distance || 0;
          this.todayCalories = todayData.calories || 0;

          console.log(`Loaded today's data: ${this.todaySteps} steps`);
          return;
        }
      }

      // Fallback to old method if complete data not available
      const steps = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_STEPS);
      const baseSteps = await AsyncStorage.getItem(
        STORAGE_KEYS.TODAY_BASE_STEPS
      );

      this.todaySteps = steps ? parseInt(steps) : 0;
      this.baseStepsToday = baseSteps ? parseInt(baseSteps) : 0;

      // Calculate derived metrics
      this.updateDerivedMetrics();

      console.log(`Today's data loaded: ${this.todaySteps} steps`);
    } catch (error) {
      console.error("Error loading today data:", error.message);
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
        console.log(
          `First time today - Base steps set to: ${this.baseStepsToday}`
        );
      } else if (this.baseStepsToday > 0) {
        // We have base steps, use device steps directly (no need to add base again)
        this.todaySteps = Math.max(deviceStepsToday, this.baseStepsToday);
        console.log(
          `Existing session - Device steps: ${deviceStepsToday}, Using: ${this.todaySteps}`
        );
      }

      // Store the step count when we start tracking (as baseline for real-time)
      const startingSteps = this.todaySteps;

      // Start real-time step watching
      this.stepSubscription = Pedometer.watchStepCount((result) => {
        // result.steps are incremental steps since watchStepCount started
        this.realTimeSteps = result.steps;

        // Calculate total steps: starting steps + new incremental steps
        const newTotalSteps = startingSteps + this.realTimeSteps;

        console.log(
          `Real-time update: Starting: ${startingSteps}, +${result.steps} new steps, total: ${newTotalSteps}`
        );

        // Update immediately for real-time UI
        this.updateStepCount(newTotalSteps, true);
      });

      this.isTracking = true;

      // Update derived metrics and notify
      this.updateDerivedMetrics();
      this.notifyListeners();

      console.log(`Started tracking: ${this.todaySteps} steps`);
      return true;
    } catch (error) {
      console.error("Error starting step tracking:", error.message);
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
      console.error("Error getting device steps:", error.message);
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

      // Also save complete today's data for better persistence
      const todayData = {
        steps: steps,
        distance: this.todayDistance,
        calories: this.todayCalories,
        baseSteps: this.baseStepsToday,
        lastUpdated: new Date().toISOString(),
        date: new Date().toDateString(),
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.TODAY_DATA,
        JSON.stringify(todayData)
      );
    } catch (error) {
      console.error("Error saving step count:", error.message);
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

      // Use device steps directly if we have base steps (no double counting)
      if (this.baseStepsToday > 0) {
        // Use the maximum of device steps or current steps to prevent going backwards
        const calculatedSteps = Math.max(deviceStepsToday, this.todaySteps);
        if (calculatedSteps !== this.todaySteps) {
          console.log(
            `Manual refresh updating steps from ${this.todaySteps} to ${calculatedSteps}`
          );
          this.updateStepCount(calculatedSteps, true);
        }
      } else {
        // If no base steps, set current device steps as our steps
        if (deviceStepsToday !== this.todaySteps) {
          console.log(
            `Manual refresh setting initial steps to ${deviceStepsToday}`
          );
          this.updateStepCount(deviceStepsToday, true);
        }
      }

      return this.getCurrentFitnessData();
    } catch (error) {
      console.error("Error in manual refresh:", error.message);
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
      userProfile: this.userProfile,
      hasStepSubscription: !!this.stepSubscription,
      listenerCount: this.listeners.length,
      timestamp: new Date().toISOString(),
    };
  }

  // Debug method to check stored fitness history
  async getDebugFitnessHistory() {
    try {
      const history = await this.getFitnessHistory();
      const keys = Object.keys(history);
      console.log("Fitness history keys:", keys);
      console.log("Fitness history data:", history);
      return history;
    } catch (error) {
      console.error("Error getting debug fitness history:", error);
      return {};
    }
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

  // Get weekly summary with caching
  async getWeeklySummary() {
    try {
      // Check if we have cached weekly data
      const cached = await this.getCachedWeeklyData();
      if (cached) {
        return cached;
      }

      const history = await this.getFitnessHistory();
      const today = new Date();
      const weekData = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toDateString();

        if (i === 0) {
          // Today's data (always fresh)
          weekData.push({
            date: date.toISOString(),
            day: date.toLocaleDateString("en-US", { weekday: "short" }),
            steps: this.todaySteps,
            distance: parseFloat(this.todayDistance.toFixed(2)),
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
            day: date.toLocaleDateString("en-US", { weekday: "short" }),
            steps: dayData.steps || 0,
            distance: parseFloat((dayData.distance || 0).toFixed(2)),
            calories: dayData.calories || 0,
          });
        }
      }

      // Cache the result (excluding today's data which changes frequently)
      await this.cacheWeeklyData(weekData);

      return weekData;
    } catch (error) {
      console.error("Error getting weekly summary:", error);
      return [];
    }
  }

  // Get monthly summary with caching
  async getMonthlySummary() {
    try {
      // Check if we have cached monthly data
      const cached = await this.getCachedMonthlyData();
      if (cached) {
        return cached;
      }

      const history = await this.getFitnessHistory();
      const today = new Date();
      const monthData = [];

      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toDateString();

        if (i === 0) {
          // Today's data (always fresh)
          monthData.push({
            date: date.toISOString(),
            day: date.getDate(),
            steps: this.todaySteps,
            distance: parseFloat(this.todayDistance.toFixed(2)),
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
            day: date.getDate(),
            steps: dayData.steps || 0,
            distance: parseFloat((dayData.distance || 0).toFixed(2)),
            calories: dayData.calories || 0,
          });
        }
      }

      // Cache the result (excluding today's data)
      await this.cacheMonthlyData(monthData);

      return monthData;
    } catch (error) {
      console.error("Error getting monthly summary:", error);
      return [];
    }
  }

  // Cache management methods
  async getCachedWeeklyData() {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.WEEKLY_CACHE);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const today = new Date().toDateString();

      // Check if cache is from today or yesterday (allow some flexibility)
      const cacheDate = new Date(cacheData.date);
      const currentDate = new Date();
      const timeDiff = Math.abs(currentDate.getTime() - cacheDate.getTime());
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      // Use cache if it's from today or yesterday, but update today's data
      if (daysDiff <= 1 && cacheData.data) {
        console.log("Using cached weekly data, updating today's values");
        const weekData = [...cacheData.data];
        const todayIndex = weekData.length - 1; // Today is last item

        weekData[todayIndex] = {
          ...weekData[todayIndex],
          steps: this.todaySteps,
          distance: parseFloat(this.todayDistance.toFixed(2)),
          calories: this.todayCalories,
        };

        return weekData;
      }

      console.log("Weekly cache expired, will fetch fresh data");
      return null;
    } catch (error) {
      console.error("Error getting cached weekly data:", error);
      return null;
    }
  }

  async cacheWeeklyData(weekData) {
    try {
      const cacheData = {
        date: new Date().toDateString(),
        data: weekData,
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.WEEKLY_CACHE,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error("Error caching weekly data:", error);
    }
  }

  async getCachedMonthlyData() {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.MONTHLY_CACHE);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const today = new Date().toDateString();

      // Check if cache is from today or yesterday (allow some flexibility)
      const cacheDate = new Date(cacheData.date);
      const currentDate = new Date();
      const timeDiff = Math.abs(currentDate.getTime() - cacheDate.getTime());
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      // Use cache if it's from today or yesterday, but update today's data
      if (daysDiff <= 1 && cacheData.data) {
        console.log("Using cached monthly data, updating today's values");
        const monthData = [...cacheData.data];
        const todayIndex = monthData.length - 1; // Today is last item

        monthData[todayIndex] = {
          ...monthData[todayIndex],
          steps: this.todaySteps,
          distance: parseFloat(this.todayDistance.toFixed(2)),
          calories: this.todayCalories,
        };

        return monthData;
      }

      console.log("Monthly cache expired, will fetch fresh data");
      return null;
    } catch (error) {
      console.error("Error getting cached monthly data:", error);
      return null;
    }
  }

  async cacheMonthlyData(monthData) {
    try {
      const cacheData = {
        date: new Date().toDateString(),
        data: monthData,
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(
        STORAGE_KEYS.MONTHLY_CACHE,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error("Error caching monthly data:", error);
    }
  }

  // Clear all caches (useful for force refresh)
  async clearCaches() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.WEEKLY_CACHE);
      await AsyncStorage.removeItem(STORAGE_KEYS.MONTHLY_CACHE);
      console.log("Caches cleared");
    } catch (error) {
      console.error("Error clearing caches:", error);
    }
  }

  // Get comprehensive statistics for FitnessDetailScreen
  async getFitnessStatistics() {
    try {
      const [weeklyData, monthlyData] = await Promise.all([
        this.getWeeklySummary(),
        this.getMonthlySummary(),
      ]);

      // Calculate weekly statistics
      const weeklyTotals = weeklyData.reduce(
        (totals, day) => ({
          steps: totals.steps + (day.steps || 0),
          distance: totals.distance + (day.distance || 0),
          calories: totals.calories + (day.calories || 0),
        }),
        { steps: 0, distance: 0, calories: 0 }
      );

      const weeklyAverage = {
        steps: Math.round(weeklyTotals.steps / 7),
        distance: parseFloat((weeklyTotals.distance / 7).toFixed(2)),
        calories: Math.round(weeklyTotals.calories / 7),
      };

      // Calculate monthly statistics
      const monthlyTotals = monthlyData.reduce(
        (totals, day) => ({
          steps: totals.steps + (day.steps || 0),
          distance: totals.distance + (day.distance || 0),
          calories: totals.calories + (day.calories || 0),
        }),
        { steps: 0, distance: 0, calories: 0 }
      );

      const monthlyAverage = {
        steps: Math.round(monthlyTotals.steps / 30),
        distance: parseFloat((monthlyTotals.distance / 30).toFixed(2)),
        calories: Math.round(monthlyTotals.calories / 30),
      };

      // Find best day in each period
      const bestWeekDay = weeklyData.reduce(
        (best, day) => (day.steps > best.steps ? day : best),
        weeklyData[0] || { steps: 0, distance: 0, calories: 0 }
      );

      const bestMonthDay = monthlyData.reduce(
        (best, day) => (day.steps > best.steps ? day : best),
        monthlyData[0] || { steps: 0, distance: 0, calories: 0 }
      );

      // Calculate streaks
      const currentStreak = this.calculateCurrentStreak(monthlyData);
      const longestStreak = this.calculateLongestStreak(monthlyData);

      return {
        today: {
          steps: this.todaySteps,
          distance: parseFloat(this.todayDistance.toFixed(2)),
          calories: this.todayCalories,
        },
        weekly: {
          data: weeklyData,
          totals: weeklyTotals,
          average: weeklyAverage,
          best: bestWeekDay,
        },
        monthly: {
          data: monthlyData,
          totals: monthlyTotals,
          average: monthlyAverage,
          best: bestMonthDay,
        },
        streaks: {
          current: currentStreak,
          longest: longestStreak,
        },
        goals: {
          dailyStepGoal: 10000,
          progress: Math.min((this.todaySteps / 10000) * 100, 100),
          achieved: this.todaySteps >= 10000,
        },
      };
    } catch (error) {
      console.error("Error getting fitness statistics:", error);
      return null;
    }
  }

  // Calculate current active streak (consecutive days with steps >= goal)
  calculateCurrentStreak(monthlyData, stepGoal = 5000) {
    let streak = 0;

    // Start from today and go backwards
    for (let i = monthlyData.length - 1; i >= 0; i--) {
      if (monthlyData[i].steps >= stepGoal) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  // Calculate longest streak in the monthly data
  calculateLongestStreak(monthlyData, stepGoal = 5000) {
    let longestStreak = 0;
    let currentStreak = 0;

    for (const day of monthlyData) {
      if (day.steps >= stepGoal) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return longestStreak;
  }

  // Force refresh all data and clear caches
  async forceRefresh() {
    try {
      console.log("Force refresh initiated");

      await this.clearCaches();
      await this.manualRefresh();

      // Pre-load fresh data
      await Promise.all([this.getWeeklySummary(), this.getMonthlySummary()]);

      console.log("Force refresh completed");
      return this.getCurrentFitnessData();
    } catch (error) {
      console.error("Error in force refresh:", error);
      throw error;
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
