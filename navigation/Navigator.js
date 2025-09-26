import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTranslation } from "../hooks/useTranslation";
import HomeScreen from "../screens/HomeScreen/HomeScreen";
import Icon from "react-native-vector-icons/FontAwesome";
import SplashScreen from "../screens/SplashSreen/SplashSreen";
import UserMenuScreen from "../screens/UserMenuScreen/UserMenuScreen";
import LoginScreen from "../screens/LoginScreen/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen/RegisterScreen";
import { Platform } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import SettingScreen from "../screens/SettingScreen/SettingScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import GymDetailScreen from "../screens/GymDetailScreen/GymDetailScreen";
import GymPTScreen from "../screens/GymPTScreen/GymPTScreen";
import CartScreen from "../screens/CartScreen/CartScreen";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import MapScreen from "../screens/MapScreen/MapScreen";
import TransactionHistoryScreen from "../screens/TransactionHistoryScreen/TransactionHistoryScreen";
import VoucherScreen from "../screens/VoucherScreen/VoucherScreen";
import FAQScreen from "../screens/FAQScreen/FAQScreen";
import ProfileScreen from "../screens/ProfileScreen/ProfileScreen";
import AccountScreen from "../screens/AccountScreen/AccountScreen";
import UpdatePasswordScreen from "../screens/UpdatePasswordScreen/UpdatePasswordScreen";
import PTProfileScreen from "../screens/PTProfileScreen/PTProfileScreen";
import SchedulePTScreen from "../screens/SchedulePTScreen/SchedulePTScreen";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import SlotsPTScreen from "../screens/SlotsPTScreen/SlotsPTScreen";
import ForgotPasswordScreen1 from "../screens/ForgotPasswordScreen/ForgotPasswordScreen1";
import ForgotPasswordScreen2 from "../screens/ForgotPasswordScreen/ForgotPasswordScreen2";
import ForgotPasswordScreen3 from "../screens/ForgotPasswordScreen/ForgotPasswordScreen3";
import PTinCourseScreen from "../screens/PTinCourseScreen/PTinCourseScreen";
import BlogScreen from "../screens/BlogScreen/BlogScreen";
import BlogDetailScreen from "../screens/BlogDetailScreen/BlogDetailScreen";
import PaymentScreen from "../screens/PaymentScreen/PaymentScreen";
import SubscriptionScreen from "../screens/SubscriptionScreen/SubscriptionScreen";
import PTBookingHistoryScreen from "../screens/PTBookingHistoryScreen/PTBookingHistoryScreen";
import OrderSuccessScreen from "../screens/OrderSuccessScreen/OrderSuccessScreen";
import ChatScreen from "../screens/ChatScreen/ChatScreen";
import SearchGymScreen from "../screens/SearchGymScreen/SearchGymScreen";
import * as Linking from "expo-linking";
import authService from "../services/authService";
import ChoosingCourseScreen from "../screens/ChoosingCourseScreen/ChoosingCourseScreen";
import ScheduleScreen from "../screens/ScheduleScreen/ScheduleScreen";
import BookingHistoryScreen from "../screens/BookingHistoryScreen/BookingHistoryScreen";
import LanguageSelectScreen from "../screens/SettingScreen/LanguageSelectScreen/LanguageSelectScreen";
import FitnessDetailScreen from "../screens/FitnessDetailScreen/FitnessDetailScreen";
import CalendarScheduleScreen from "../screens/CalendarScheduleScreen/CalendarScheduleScreen";

export default function Navigator() {
  const { t } = useTranslation();
  const Tab = createBottomTabNavigator();
  const Stack = createNativeStackNavigator();
  const TopTab = createMaterialTopTabNavigator();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const linking = {
    prefixes: [
      Linking.createURL("/"),
      "fitbridge://", // Thêm scheme custom của bạn
    ],
    config: {
      screens: {
        MainApp: {
          screens: {
            [t("navigation.home")]: {
              screens: {
                PaymentScreen: "payment",
                OrderSuccessScreen: "orderprocess",
                GymDetailScreen: "gym/:gymId",
                SearchGymScreen: "search",
              },
            },
            [t("navigation.map")]: {
              screens: {
                MapScreen: "map/user",
              },
            },
          },
        },
        // PaymentScreen: "payment",
        // OrderSuccessScreen: "orderprocess",
        Login: "login",
        Register: "register",
        Splash: "splash",

        // Thêm các màn khác nếu cần
      },
    },
  };

  // Check authentication on app start
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        setIsLoading(true);
        const authResult = await authService.validateToken();

        if (authResult.isValid) {
          setIsAuthenticated(true);
          setUser(authResult.user);
          console.log("Authentication successful - user:", authResult.user);
          // Update AsyncStorage with fresh user data
          await AsyncStorage.setItem("user", JSON.stringify(authResult.user));
        } else {
          setIsAuthenticated(false);
          setUser(null);
          console.log("Authentication failed - clearing data");
          // Clear any invalid stored data
          await AsyncStorage.multiRemove(["token", "user"]);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsAuthenticated(false);
        setUser(null);
        await AsyncStorage.multiRemove(["token", "user"]);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  // Expose a method to update navigation when auth state changes
  React.useEffect(() => {
    if (global.updateNavigationUser === undefined) {
      global.updateNavigationUser = async () => {
        try {
          const authResult = await authService.validateToken();

          if (authResult.isValid) {
            setIsAuthenticated(true);
            setUser(authResult.user);
            console.log(
              "updateNavigationUser - user updated:",
              authResult.user
            );
            await AsyncStorage.setItem("user", JSON.stringify(authResult.user));

            // Avatar will be automatically updated when screens refresh
          } else {
            setIsAuthenticated(false);
            setUser(null);
            console.log("updateNavigationUser - user cleared");
            await AsyncStorage.multiRemove(["token", "user"]);
          }
        } catch (error) {
          console.error("Error updating navigation user:", error);
          setIsAuthenticated(false);
          setUser(null);
          await AsyncStorage.multiRemove(["token", "user"]);
        }
      };
    }

    return () => {
      delete global.updateNavigationUser;
    };
  }, []);

  const HomeStack = () => {
    return (
      <Stack.Navigator
        screenOptions={({ navigation, route }) => ({
          headerTitleAlign: "center",
          headerShown: false,
          headerTintColor: "#ED2A46",
          headerLeft: (props) =>
            navigation.canGoBack() ? (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="caret-back" size={30} color="#ED2A46" />
              </TouchableOpacity>
            ) : null,
        })}
      >
        <Stack.Screen
          name="HomeMain"
          component={HomeScreen}
          options={{
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="GymDetailScreen"
          component={GymDetailScreen}
          options={{
            headerTitleAlign: "center",
          }}
        />
        <Stack.Screen
          name="GymPTScreen"
          component={GymPTScreen}
          options={{
            headerTitleAlign: "center",
            headerShown: true,
            title: t("screenTitles.ptList"),
          }}
        />
        <Stack.Screen
          name="BlogScreen"
          component={BlogScreen}
          options={{
            headerTitleAlign: "center",
            headerShown: true,
            title: t("screenTitles.blog"),
          }}
        />
        <Stack.Screen
          name="BlogDetailScreen"
          component={BlogDetailScreen}
          options={{
            headerTitleAlign: "center",
            headerShown: true,
            title: t("screenTitles.blog"),
          }}
        />
        <Stack.Screen
          name="SearchGymScreen"
          component={SearchGymScreen}
          options={{
            headerTitleAlign: "center",
            headerShown: true,
            title: t("screenTitles.searchGym"),
          }}
        />
        <Stack.Screen
          name="PTProfileScreen"
          component={PTProfileScreen}
          options={{
            headerTitleAlign: "center",
            headerShown: true,
            title: t("screenTitles.ptInfo"),
          }}
        />
        <Stack.Screen
          name="CartScreen"
          component={CartScreen}
          options={{
            headerTitleAlign: "center",
            headerShown: true,
            title: t("screenTitles.cart"),
          }}
        />
        <Stack.Screen
          name="PTinCourseScreen"
          component={PTinCourseScreen}
          options={{
            headerTitleAlign: "center",
            headerShown: true,
            title: t("screenTitles.choosePTForPackage"),
          }}
        />
        <Stack.Screen
          name="PaymentScreen"
          component={PaymentScreen}
          options={{
            headerTitleAlign: "center",
            headerShown: true,
            title: t("screenTitles.payment"),
          }}
        />
        <Stack.Screen
          name="OrderSuccessScreen"
          component={OrderSuccessScreen}
          options={{
            headerTitleAlign: "center",
            headerShown: true,
            title: t("screenTitles.paymentSuccess"),
          }}
        />
        <Stack.Screen
          name="FitnessDetail"
          component={FitnessDetailScreen}
          options={{
            headerTitleAlign: "center",
            headerShown: true,
            title: t("screenTitles.fitnessDetail"),
          }}
        />
      </Stack.Navigator>
    );
  };

  const MapStack = () => {
    return (
      <Stack.Navigator
        screenOptions={({ navigation, route }) => ({
          headerTitleAlign: "center",
          headerShown: false,
          headerTintColor: "#ED2A46",
          headerLeft: (props) =>
            navigation.canGoBack() ? (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="caret-back" size={30} color="#ED2A46" />
              </TouchableOpacity>
            ) : null,
        })}
      >
        <Stack.Screen
          name="MapScreen"
          component={MapScreen}
          options={{
            headerTitleAlign: "center",
            headerShown: true,
            title: t("screenTitles.map"),
          }}
        />
      </Stack.Navigator>
    );
  };

  const ScheduleStack = () => {
    return (
      <Stack.Navigator
        screenOptions={({ navigation, route }) => ({
          headerTitleAlign: "center",
          headerShown: false,
          headerTintColor: "#ED2A46",
          headerLeft: (props) =>
            navigation.canGoBack() ? (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="caret-back" size={30} color="#ED2A46" />
              </TouchableOpacity>
            ) : null,
        })}
      >
        {/* <Stack.Screen
          name="ScheduleTabs"
          options={{
            headerShown: true,
            title: t("screenTitles.schedule"),
          }}
        >
          {() => (
            <TopTab.Navigator
              screenOptions={{
                tabBarIndicatorStyle: {
                  backgroundColor: "#ED2A46",
                  height: 3,
                },
                tabBarStyle: {
                  backgroundColor: "#FFFFFF",
                  elevation: 0,
                  shadowOpacity: 0,
                  borderBottomWidth: 1,
                  borderBottomColor: "#E0E0E0",
                },
                tabBarActiveTintColor: "#ED2A46",
                tabBarInactiveTintColor: "#666",
                tabBarLabelStyle: {
                  fontWeight: "bold",
                  fontSize: 14,
                },
                swipeEnabled: false,
              }}
            >
              <TopTab.Screen
                name="CalendarScheduleScreen"
                component={CalendarScheduleScreen}
                options={{
                  title: t("screenTitles.calendarSchedule"),
                }}
              />
              <TopTab.Screen
                name="ChoosingCourseScreen"
                component={ChoosingCourseScreen}
                options={{
                  title: t("screenTitles.bookSession"),
                }}
              />
            </TopTab.Navigator>
          )}
        </Stack.Screen> */}

        <Stack.Screen
          name="CalendarScheduleScreen"
          component={CalendarScheduleScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.calendarSchedule"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />

        <Stack.Screen
          name="ChoosingCourseScreen"
          component={ChoosingCourseScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.bookSession"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />

        <Stack.Screen
          name="ScheduleScreen"
          component={ScheduleScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.schedule"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="BookingHistoryScreen"
          component={BookingHistoryScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.bookingHistory"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
      </Stack.Navigator>
    );
  };

  const SchedulePTStack = () => {
    return (
      <Stack.Navigator
        screenOptions={({ navigation, route }) => ({
          headerTitleAlign: "center",
          headerShown: false,
          headerTintColor: "#ED2A46",
          headerLeft: (props) =>
            navigation.canGoBack() ? (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="caret-back" size={30} color="#ED2A46" />
              </TouchableOpacity>
            ) : null,
        })}
      >
        <Stack.Screen
          name="SchedulePTTabs"
          options={{
            headerShown: true,
            title: t("screenTitles.ptScheduleRegistration"),
          }}
        >
          {() => (
            <TopTab.Navigator
              screenOptions={{
                tabBarIndicatorStyle: {
                  backgroundColor: "#ED2A46",
                  height: 3,
                },
                tabBarStyle: {
                  backgroundColor: "#FFFFFF",
                  elevation: 0,
                  shadowOpacity: 0,
                  borderBottomWidth: 1,
                  borderBottomColor: "#E0E0E0",
                },
                tabBarActiveTintColor: "#ED2A46",
                tabBarInactiveTintColor: "#666",
                tabBarLabelStyle: {
                  fontWeight: "bold",
                  fontSize: 14,
                },
                swipeEnabled: false,
              }}
            >
              <TopTab.Screen
                name="SchedulePTScreen"
                component={SchedulePTScreen}
                options={{
                  title: t("screenTitles.registerSlot"),
                }}
              />
              <TopTab.Screen
                name="SlotsPTScreen"
                component={SlotsPTScreen}
                options={{
                  title: t("screenTitles.viewBookedSlots"),
                }}
              />
              {/* <TopTab.Screen
                name="PTBookingHistoryScreen"
                component={PTBookingHistoryScreen}
                options={{
                  title: "Slot với khách",
                }}
              /> */}
            </TopTab.Navigator>
          )}
        </Stack.Screen>
        <Stack.Screen
          name="PTBookingHistoryScreen"
          component={PTBookingHistoryScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.ptBookingHistory"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
      </Stack.Navigator>
    );
  };

  const ChatStack = () => {
    return (
      <Stack.Navigator
        screenOptions={({ navigation, route }) => ({
          headerTitleAlign: "center",
          headerShown: false,
          headerTintColor: "#ED2A46",
        })}
      >
        <Stack.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.aiChatbox"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
      </Stack.Navigator>
    );
  };

  const ProfileStack = () => {
    return (
      <Stack.Navigator
        screenOptions={({ navigation, route }) => ({
          headerTitleAlign: "center",
          headerShown: false,
          headerTintColor: "#ED2A46",
          headerLeft: (props) =>
            navigation.canGoBack() ? (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="caret-back" size={30} color="#ED2A46" />
              </TouchableOpacity>
            ) : null,
        })}
      >
        <Stack.Screen
          name="User Menu"
          component={UserMenuScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SettingScreen"
          component={SettingScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.settings"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />

        <Stack.Screen
          name="LanguageSelectScreen"
          component={LanguageSelectScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.chooseLanguage"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="ProfileScreen"
          component={ProfileScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.profile"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="AccountScreen"
          component={AccountScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.account"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="UpdatePasswordScreen"
          component={UpdatePasswordScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.changePassword"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="SubscriptionScreen"
          component={SubscriptionScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.upgradePackage"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="TransactionHistoryScreen"
          component={TransactionHistoryScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.transactionHistory"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="VoucherScreen"
          component={VoucherScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.offers"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="FAQScreen"
          component={FAQScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.faq"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
      </Stack.Navigator>
    );
  };

  const MainTab = () => {
    // Debug log to check user role
    console.log("MainTab rendering with user:", user);
    console.log("User role:", user?.role);

    return (
      <Tab.Navigator
        key={user?.role || "guest"}
        screenOptions={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? "";
          const shouldHideTabBar =
            routeName === "ChatScreen" ||
            routeName === "CartScreen" ||
            routeName === "PaymentScreen" ||
            routeName === "OrderSuccessScreen";
          return {
            tabBarStyle: shouldHideTabBar
              ? { display: "none" }
              : {
                  backgroundColor: "#ED2A46",
                },
            tabBarActiveTintColor: "#FFFFFF",
            tabBarInactiveTintColor: "rgba(255, 255, 255, 0.6)",
            tabBarLabelStyle: {
              fontSize: 10,
              fontWeight: "bold",
            },
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === t("navigation.home")) {
                iconName = "home";
              } else if (route.name === t("navigation.map")) {
                iconName = "map-marker";
              } else if (route.name === t("navigation.schedule")) {
                iconName = "calendar";
              } else if (route.name === t("navigation.aiChatbox")) {
                iconName = "wechat";
              } else if (route.name === t("navigation.me")) {
                iconName = "user";
              } else if (route.name === t("navigation.ptSchedule")) {
                iconName = "calendar";
              }

              return (
                <View>
                  <Icon name={iconName} size={25} color={color} />
                </View>
              );
            },
          };
        }}
      >
        {/* Common tabs for all users */}
        <Tab.Screen
          name={t("navigation.home")}
          component={HomeStack}
          options={{
            headerShown: false,
          }}
        />
        <Tab.Screen
          name={t("navigation.map")}
          component={MapStack}
          options={{
            headerShown: false,
          }}
        />

        {/* Role-specific tabs */}
        {user?.role === "Customer" && (
          <Tab.Screen
            name={t("navigation.schedule")}
            component={ScheduleStack}
            options={{
              headerShown: false,
            }}
          />
        )}

        {user?.role === "PT" && (
          <Tab.Screen
            name={t("navigation.ptSchedule")}
            component={SchedulePTStack}
            options={{
              headerShown: false,
            }}
          />
        )}

        {user?.role === "Customer" && (
          <Tab.Screen
            name={t("navigation.aiChatbox")}
            component={ChatStack}
            options={{
              headerShown: false,
            }}
          />
        )}

        {/* Profile tab - available for all authenticated users */}
        <Tab.Screen
          name={t("navigation.me")}
          component={ProfileStack}
          options={{
            headerShown: false,
          }}
        />
      </Tab.Navigator>
    );
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f8f9fa",
        }}
      >
        <ActivityIndicator size="large" color="#FF914D" />
        <Text style={{ marginTop: 16, fontSize: 16, color: "#666" }}>
          {t("screenTitles.checkingLogin")}
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        screenOptions={({ navigation, route }) => ({
          headerTitleAlign: "center",
          headerShown: false,
          headerTintColor: "#ED2A46",
          headerLeft: (props) =>
            navigation.canGoBack() ? (
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="caret-back" size={30} color="#ED2A46" />
              </TouchableOpacity>
            ) : null,
        })}
        initialRouteName={isAuthenticated ? "MainApp" : "Login"}
      >
        {isAuthenticated ? (
          // User is authenticated - show main app
          <Stack.Screen name="MainApp" component={MainTab} />
        ) : (
          // User is not authenticated - show auth screens
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                headerShown: true,
                title: t("screenTitles.login"),
                headerTitleAlign: "center",
                headerTitleStyle: {
                  fontWeight: "bold",
                  fontSize: 20,
                  color: "#ED2A46",
                },
              }}
            />
            <Stack.Screen
              name="ForgotPasswordScreen1"
              component={ForgotPasswordScreen1}
              options={{
                headerShown: true,
                title: t("screenTitles.forgotPassword"),
                headerTitleAlign: "center",
                headerTitleStyle: {
                  fontWeight: "bold",
                  fontSize: 20,
                  color: "#ED2A46",
                },
              }}
            />
            <Stack.Screen
              name="ForgotPasswordScreen2"
              component={ForgotPasswordScreen2}
              options={{
                headerShown: true,
                title: t("screenTitles.forgotPassword"),
                headerTitleAlign: "center",
                headerTitleStyle: {
                  fontWeight: "bold",
                  fontSize: 20,
                  color: "#ED2A46",
                },
              }}
            />
            <Stack.Screen
              name="ForgotPasswordScreen3"
              component={ForgotPasswordScreen3}
              options={{
                headerShown: true,
                title: t("screenTitles.forgotPassword"),
                headerTitleAlign: "center",
                headerTitleStyle: {
                  fontWeight: "bold",
                  fontSize: 20,
                  color: "#ED2A46",
                },
              }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{
                headerShown: true,
                title: t("screenTitles.register"),
                headerTitleAlign: "center",
                headerTitleStyle: {
                  fontWeight: "bold",
                  fontSize: 20,
                  color: "#ED2A46",
                },
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
