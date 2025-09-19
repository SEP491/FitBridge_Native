import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import fitnessTrackingService from "../services/fitnessTrackingService";

const FitnessContext = createContext();

export const useFitnessContext = () => {
  const context = useContext(FitnessContext);
  if (!context) {
    throw new Error("useFitnessContext must be used within a FitnessProvider");
  }
  return context;
};

export const FitnessProvider = ({ children }) => {
  const [fitnessData, setFitnessData] = useState({
    steps: 0,
    distance: 0,
    calories: 0,
    isTracking: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  // Initialize fitness tracking
  useEffect(() => {
    initializeFitnessTracking();

    // Cleanup on unmount
    return () => {
      fitnessTrackingService.stopTracking();
    };
  }, []);

  const initializeFitnessTracking = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize the service
      const success = await fitnessTrackingService.initialize();
      if (!success) {
        throw new Error("Failed to initialize fitness tracking service");
      }

      // Start tracking
      const trackingStarted = await fitnessTrackingService.startTracking();
      if (!trackingStarted) {
        console.warn(
          "Step tracking could not be started, but service is initialized"
        );
      }

      // Get initial data
      const initialData = fitnessTrackingService.getCurrentFitnessData();
      setFitnessData(initialData);

      // Load weekly and monthly data
      await loadHistoricalData();

      // Listen for updates
      const unsubscribe = fitnessTrackingService.addListener((newData) => {
        setFitnessData(newData);
      });

      setIsLoading(false);

      // Return cleanup function
      return unsubscribe;
    } catch (err) {
      console.error("Error initializing fitness tracking:", err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  const loadHistoricalData = async () => {
    try {
      const [weekly, monthly] = await Promise.all([
        fitnessTrackingService.getWeeklySummary(),
        fitnessTrackingService.getMonthlySummary(),
      ]);

      setWeeklyData(weekly);
      setMonthlyData(monthly);
    } catch (err) {
      console.error("Error loading historical data:", err);
    }
  };

  const refreshData = useCallback(async () => {
    try {
      setError(null);
      const currentData = fitnessTrackingService.getCurrentFitnessData();
      setFitnessData(currentData);
      await loadHistoricalData();
    } catch (err) {
      console.error("Error refreshing fitness data:", err);
      setError(err.message);
    }
  }, []);

  const updateUserProfile = async (profile) => {
    try {
      await fitnessTrackingService.updateUserProfile(profile);
      // Refresh data to recalculate calories with new profile
      await refreshData();
    } catch (err) {
      console.error("Error updating user profile:", err);
      setError(err.message);
    }
  };

  const startTracking = async () => {
    try {
      setError(null);
      const success = await fitnessTrackingService.startTracking();
      if (success) {
        const updatedData = fitnessTrackingService.getCurrentFitnessData();
        setFitnessData(updatedData);
      }
      return success;
    } catch (err) {
      console.error("Error starting tracking:", err);
      setError(err.message);
      return false;
    }
  };

  const stopTracking = () => {
    try {
      fitnessTrackingService.stopTracking();
      const updatedData = fitnessTrackingService.getCurrentFitnessData();
      setFitnessData(updatedData);
    } catch (err) {
      console.error("Error stopping tracking:", err);
      setError(err.message);
    }
  };

  // Calculate weekly totals
  const getWeeklyTotals = useCallback(() => {
    if (!weeklyData || weeklyData.length === 0) {
      return { steps: 0, distance: 0, calories: 0 };
    }

    return weeklyData.reduce(
      (totals, day) => ({
        steps: totals.steps + (day.steps || 0),
        distance: totals.distance + (day.distance || 0),
        calories: totals.calories + (day.calories || 0),
      }),
      { steps: 0, distance: 0, calories: 0 }
    );
  }, [weeklyData]);

  // Calculate monthly totals
  const getMonthlyTotals = useCallback(() => {
    if (!monthlyData || monthlyData.length === 0) {
      return { steps: 0, distance: 0, calories: 0 };
    }

    return monthlyData.reduce(
      (totals, day) => ({
        steps: totals.steps + (day.steps || 0),
        distance: totals.distance + (day.distance || 0),
        calories: totals.calories + (day.calories || 0),
      }),
      { steps: 0, distance: 0, calories: 0 }
    );
  }, [monthlyData]);

  // Get daily average for the week
  const getWeeklyAverage = useCallback(() => {
    const totals = getWeeklyTotals();
    const daysWithData = weeklyData.filter((day) => day.steps > 0).length || 1;

    return {
      steps: Math.round(totals.steps / daysWithData),
      distance: parseFloat((totals.distance / daysWithData).toFixed(2)),
      calories: Math.round(totals.calories / daysWithData),
    };
  }, [weeklyData, getWeeklyTotals]);

  // Get daily average for the month
  const getMonthlyAverage = useCallback(() => {
    const totals = getMonthlyTotals();
    const daysWithData = monthlyData.filter((day) => day.steps > 0).length || 1;

    return {
      steps: Math.round(totals.steps / daysWithData),
      distance: parseFloat((totals.distance / daysWithData).toFixed(2)),
      calories: Math.round(totals.calories / daysWithData),
    };
  }, [monthlyData, getMonthlyTotals]);

  // Get step goal progress (default goal: 10,000 steps)
  const getStepGoalProgress = useCallback(
    (goal = 10000) => {
      const progress = Math.min((fitnessData.steps / goal) * 100, 100);
      return {
        current: fitnessData.steps,
        goal,
        progress: parseFloat(progress.toFixed(1)),
        achieved: fitnessData.steps >= goal,
      };
    },
    [fitnessData.steps]
  );

  const value = {
    // Current data
    fitnessData,
    isLoading,
    error,

    // Historical data
    weeklyData,
    monthlyData,

    // Calculated values
    weeklyTotals: getWeeklyTotals(),
    monthlyTotals: getMonthlyTotals(),
    weeklyAverage: getWeeklyAverage(),
    monthlyAverage: getMonthlyAverage(),
    stepGoalProgress: getStepGoalProgress(),

    // Actions
    refreshData,
    updateUserProfile,
    startTracking,
    stopTracking,

    // Utilities
    getStepGoalProgress,
    loadHistoricalData,
  };

  return (
    <FitnessContext.Provider value={value}>{children}</FitnessContext.Provider>
  );
};

export default FitnessContext;
