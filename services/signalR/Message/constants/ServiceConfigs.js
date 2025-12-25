export const ServiceName = Object.freeze({
  MESSAGING: "MESSAGING",
  NOTIFICATION: "NOTIFICATION",
});

export const SERVICE_CONFIGS = Object.freeze({
  [ServiceName.MESSAGING]: {
    urlEnvVar: "EXPO_PUBLIC_API_CHAT_MESSAGE_URL",
    hubName: "messagingHub",
  },
  [ServiceName.NOTIFICATION]: {
    urlEnvVar: "EXPO_PUBLIC_NOTIFICATION_URL",
    hubName: "notificationHub",
  },
});

export const isValidServiceName = (serviceName) => {
  console.log(
    `SignalR isValidServiceName: Checking if service name ${serviceName} is valid`
  );
  return Object.values(ServiceName).includes(serviceName);
};

export const getServiceConfig = (serviceName) => {
  if (!isValidServiceName(serviceName)) {
    throw new Error(
      `Invalid service name: ${serviceName}. Valid names: ${Object.values(
        ServiceName
      ).join(", ")}`
    );
  }
  return SERVICE_CONFIGS[serviceName];
};
