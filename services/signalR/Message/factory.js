import {
  getServiceConfig,
  isValidServiceName,
} from "./constants/ServiceConfigs";
import SignalRService from "./service";

export class SignalRServiceFactory {
  static #instances = new Map();
  static #isCreating = new Set(); // concurrency control - prevent race conditions

  static async getInstance(serviceName) {
    console.log("Getting instance for", serviceName);
    if (!isValidServiceName(serviceName)) {
      throw new Error(
        `Invalid service name: ${serviceName}. Valid names: ${Object.values(
          serviceName
        ).join(", ")}`
      );
    }
    if (this.#instances.has(serviceName)) {
      const instance = this.#instances.get(serviceName);
      if (!instance.isDisposed) {
        console.log(
          `SignalR Factory: Returning existing connection for ${serviceName}`
        );
        return instance;
      } else {
        this.#instances.delete(serviceName);
      }
    }

    if (this.#isCreating.has(serviceName)) {
      return await this.#waitForCreation(serviceName);
    }

    try {
      this.#isCreating.add(serviceName);
      console.log(
        `SignalR Factory: Creating new connection for ${serviceName}`
      );
      const config = getServiceConfig(serviceName);

      const url = process.env.EXPO_PUBLIC_API_CHAT_MESSAGE_URL;
      console.log("url Message", url);
      if (!url) {
        throw new Error(
          `Environment variable ${config.urlEnvVar} not configured. ` +
            `Please set ${config.urlEnvVar} in your environment variables.`
        );
      }

      const connection = new SignalRService(url, config.hubName);
      await connection.startConnection();
      this.#instances.set(serviceName, connection);

      console.log(`SignalR Factory: Created new connection for ${serviceName}`);
      return connection;
    } catch (error) {
      console.error("SignalR Factory: Error creating connection", error);
      throw error;
    } finally {
      this.#isCreating.delete(serviceName);
    }
  }

  static #waitForCreation(serviceName) {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (this.#instances.has(serviceName)) {
          const instance = this.#instances.get(serviceName);
          if (!instance.isDisposed) {
            clearInterval(interval);
            resolve(this.#instances.get(serviceName));
          }
        }
      }, 100);
    });
  }

  /**
   * Dispose a specific connection instance
   * @param {string} serviceName - The service name to dispose
   */
  static dispose(serviceName) {
    if (!isValidServiceName(serviceName)) {
      console.warn(
        `SignalR Factory: Invalid service name for disposal: ${serviceName}`
      );
      return;
    }

    const connection = this.#instances.get(serviceName);
    if (connection) {
      console.log(`SignalR Factory: Disposing connection for ${serviceName}`);
      connection.dispose();
      this.#instances.delete(serviceName);
    }
  }

  /**
   * Dispose all connection instances
   */
  static disposeAll() {
    console.log(
      `SignalR Factory: Disposing all connections (${
        this.#instances.size
      } instances)`
    );

    for (const [clientType, connection] of this.#instances) {
      try {
        connection.dispose();
      } catch (error) {
        console.error(
          `SignalR Factory: Error disposing ${clientType} connection:`,
          error
        );
      }
    }

    this.#instances.clear();
    this.#isCreating.clear();
  }
}

export default SignalRServiceFactory;
