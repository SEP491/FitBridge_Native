import { requestBodyGram } from "./requestBodyGram";

const ORG_ID = process.env.EXPO_PUBLIC_BODYGRAM_ORG_ID;
const BodygramService = {
  createEstimate: async (data) => {
    console.log("Creating Bodygram estimate with data:", data);
    const createResponse = await requestBodyGram(
      "POST",
      `orgs/${ORG_ID}/scans`,
      JSON.stringify(data),
      {
        "Content-Type": "application/json",
      }
    );

    return createResponse;
  },

  formatMeasurementsForBackend: (bodygramResponse, customerPurchasedId) => {
    // Extract measurements array from the response
    const measurements = bodygramResponse?.entry?.measurements || [];
    const input = bodygramResponse?.entry?.input?.photoScan || {};

    // Helper function to find measurement value by name and convert from mm to cm
    const findMeasurement = (name) => {
      const measurement = measurements.find((m) => m.name === name);
      // Convert from mm to cm by dividing by 10, default to 0 if not found
      return measurement ? Math.round(measurement.value / 10) : 0;
    };

    return {
      biceps: findMeasurement("upperArmGirthR"), // Upper arm girth
      foreArm: findMeasurement("forearmGirthR"), // Forearm girth
      thigh: findMeasurement("thighGirthR"), // Thigh girth
      calf: findMeasurement("calfGirthR"), // Calf girth
      chest: findMeasurement("bustGirth"), // Chest/Bust girth
      waist: findMeasurement("waistGirth"), // Waist girth
      hip: findMeasurement("hipGirth"), // Hip girth
      shoulder: findMeasurement("acrossBackShoulderWidth"), // Shoulder width
      height: input.height ? Math.round(input.height / 10) : 0, // Convert mm to cm
      weight: input.weight ? Math.round(input.weight / 1000) : 0, // Convert grams to kg
      customerPurchasedId: customerPurchasedId,
    };
  },
};

export default BodygramService;
