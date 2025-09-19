import fitnessTrackingService from "../services/fitnessTrackingService";

class FitnessInitService {
  static async initialize() {
    try {
      console.log("Initializing fitness tracking service...");

      // Initialize the fitness tracking service
      const success = await fitnessTrackingService.initialize();

      if (success) {
        console.log("Fitness tracking service initialized successfully");

        // Start step tracking
        const trackingStarted = await fitnessTrackingService.startTracking();

        if (trackingStarted) {
          console.log("Step tracking started successfully");
        } else {
          console.warn(
            "Step tracking could not be started, but service is initialized"
          );
        }

        return true;
      } else {
        console.error("Failed to initialize fitness tracking service");
        return false;
      }
    } catch (error) {
      console.error("Error initializing fitness tracking:", error);
      return false;
    }
  }

  static async testFunctionality() {
    try {
      console.log("Testing fitness tracking functionality...");

      // Get current data
      const currentData = fitnessTrackingService.getCurrentFitnessData();
      console.log("Current fitness data:", currentData);

      // Test data persistence
      const historyData = await fitnessTrackingService.getFitnessHistory();
      console.log("Fitness history:", historyData);

      // Test weekly summary
      const weeklyData = await fitnessTrackingService.getWeeklySummary();
      console.log("Weekly summary:", weeklyData);

      // Test monthly summary
      const monthlyData = await fitnessTrackingService.getMonthlySummary();
      console.log("Monthly summary:", monthlyData);

      console.log("Fitness tracking functionality test completed");
      return true;
    } catch (error) {
      console.error("Error testing fitness tracking functionality:", error);
      return false;
    }
  }
}

export default FitnessInitService;
