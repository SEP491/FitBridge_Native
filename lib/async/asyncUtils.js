import { getUserData } from "../storage/storageUtils";

export const fetchUserFromStorage = async () => {
  try {
    const userData = await getUserData();
    return userData;
  } catch (error) {
    console.error("Error fetching user from storage:", error);
    return null;
  }
};

export const handleRefresh = async (refreshFunction, setRefreshing) => {
  setRefreshing(true);
  try {
    await refreshFunction();
  } catch (error) {
    console.error("Error during refresh:", error);
  } finally {
    setRefreshing(false);
  }
};
