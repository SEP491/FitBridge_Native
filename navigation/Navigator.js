import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTranslation } from "../hooks/useTranslation";
import Icon from "react-native-vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import * as Linking from "expo-linking";
import authService from "../services/authService";
import HomeScreen from "../screens/CommonScreen/HomeScreen/HomeScreen";
import GymDetailScreen from "../screens/CommonScreen/GymDetailScreen/GymDetailScreen";
import PTInGymScreen from "../screens/CommonScreen/PTInGymScreen/PTInGymScreen";
import BlogScreen from "../screens/CommonScreen/BlogScreen/BlogScreen";
import BlogDetailScreen from "../screens/CommonScreen/BlogDetailScreen/BlogDetailScreen";
import SearchGymScreen from "../screens/CommonScreen/SearchGymScreen/SearchGymScreen";
import PTProfileScreen from "../screens/CommonScreen/PTProfileScreen/PTProfileScreen";
import CartScreen from "../screens/CommonScreen/CartScreen/CartScreen";
import PTinCourseScreen from "../screens/CustomerScreen/PTinCourseScreen/PTinCourseScreen";
import PaymentScreen from "../screens/CommonScreen/PaymentScreen/PaymentScreen";
import OrderSuccessScreen from "../screens/CommonScreen/OrderSuccessScreen/OrderSuccessScreen";
import FitnessDetailScreen from "../screens/CustomerScreen/FitnessDetailScreen/FitnessDetailScreen";
import MapScreen from "../screens/CommonScreen/MapScreen/MapScreen";
import CalendarScheduleScreen from "../screens/CustomerScreen/CalendarScheduleScreen/CalendarScheduleScreen";
import ChoosingCourseScreen from "../screens/CustomerScreen/ChoosingCourseScreen/ChoosingCourseScreen";
import ScheduleScreen from "../screens/CustomerScreen/ScheduleScreen/ScheduleScreen";
import BookingHistoryScreen from "../screens/CustomerScreen/BookingHistoryScreen/BookingHistoryScreen";
import SchedulePTScreen from "../screens/GymPTScreen/SchedulePTScreen/SchedulePTScreen";
import SlotsPTScreen from "../screens/GymPTScreen/SlotsPTScreen/SlotsPTScreen";
import PTBookingHistoryScreen from "../screens/GymPTScreen/PTBookingHistoryScreen/PTBookingHistoryScreen";
import ChatScreen from "../screens/CommonScreen/ChatScreen/ChatScreen";
import WithdrawalScreen from "../screens/FreelancePTScreen/WithdrawalScreen/WithdrawalScreen";
import FreelancePTDashboard from "./../screens/FreelancePTScreen/FreelancePTDashboard/FreelancePTDashboard";
import FreelancePTSchedule from "./../screens/FreelancePTScreen/FreelancePTSchedule/FreelancePTSchedule";
import FreelancePTChatScreen from "./../screens/FreelancePTScreen/FreelancePTChatScreen/FreelancePTChatScreen";
import UserMenuScreen from "../screens/CommonScreen/UserMenuScreen/UserMenuScreen";
import SettingScreen from "../screens/CommonScreen/SettingScreen/SettingScreen";
import LanguageSelectScreen from "../screens/CommonScreen/SettingScreen/LanguageSelectScreen/LanguageSelectScreen";
import ProfileScreen from "../screens/CustomerScreen/ProfileScreen/ProfileScreen";
import AccountScreen from "../screens/CustomerScreen/AccountScreen/AccountScreen";
import UpdatePasswordScreen from "../screens/AuthenticationScreen/UpdatePasswordScreen/UpdatePasswordScreen";
import SubscriptionScreen from "../screens/CustomerScreen/SubscriptionScreen/SubscriptionScreen";
import TransactionHistoryScreen from "../screens/CustomerScreen/TransactionHistoryScreen/TransactionHistoryScreen";
import MyPackageScreen from "../screens/CustomerScreen/MyPackageScreen/MyPackageScreen";
import VoucherScreen from "../screens/CustomerScreen/VoucherScreen/VoucherScreen";
import FAQScreen from "../screens/CommonScreen/FAQScreen/FAQScreen";
import ManageVoucherScreen from "./../screens/FreelancePTScreen/ManageVoucherScreen/ManageVoucherScreen";
import ManagePackageScreen from "./../screens/FreelancePTScreen/ManagePackageScreen/ManagePackageScreen";
import ManageTransactionScreen from "./../screens/FreelancePTScreen/ManageTransactionScreen/ManageTransactionScreen";
import MyCustomerScreen from "./../screens/FreelancePTScreen/MyCustomerScreen/MyCustomerScreen";
import LoginScreen from "../screens/AuthenticationScreen/LoginScreen/LoginScreen";
import ForgotPasswordScreen1 from "../screens/AuthenticationScreen/ForgotPasswordScreen/ForgotPasswordScreen1";
import ForgotPasswordScreen2 from "../screens/AuthenticationScreen/ForgotPasswordScreen/ForgotPasswordScreen2";
import ForgotPasswordScreen3 from "../screens/AuthenticationScreen/ForgotPasswordScreen/ForgotPasswordScreen3";
import RegisterScreen from "../screens/AuthenticationScreen/RegisterScreen/RegisterScreen";
import VoucherDetailScreen from "../screens/FreelancePTScreen/VoucherDetailScreen/VoucherDetailScreen";
import VideoCallScreen from "../screens/CommonScreen/VideoCallScreen/VideoCallScreen";

export default function Navigator({
  isAuthenticated: propIsAuthenticated,
  user: propUser,
}) {
  const { t } = useTranslation();
  const Tab = createBottomTabNavigator();
  const Stack = createNativeStackNavigator();

  // Use authentication state from App.js props
  const [user, setUser] = useState(propUser);
  const [isAuthenticated, setIsAuthenticated] = useState(propIsAuthenticated);
  const [isLoading, setIsLoading] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setUser(propUser);
    setIsAuthenticated(propIsAuthenticated);
  }, [propUser, propIsAuthenticated]);

  const linking = {
    prefixes: [
      Linking.createURL("/"),
      "fitbridge://", // Thêm scheme custom của bạn
      "https://fitbridge.shop",
      "http://fitbridge.shop",
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
                VoucherDetailScreen: "voucherDetails/:voucherId",
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
        VoucherDetailScreen: "voucherDetails/:voucherId",

        // Thêm các màn khác nếu cần
      },
    },
  };

  // Expose a method to update navigation when auth state changes
  React.useEffect(() => {
    if (global.updateNavigationUser === undefined) {
      global.updateNavigationUser = async () => {
        try {
          const authResult = await authService.validateToken();

          if (authResult.isValid) {
            setIsAuthenticated(true);
            setUser(authResult.user);
            await AsyncStorage.setItem("user", JSON.stringify(authResult.user));

            // Avatar will be automatically updated when screens refresh
          } else {
            setIsAuthenticated(false);
            setUser(null);
            console.log("User cleared");
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
          name="PTInGymScreen"
          component={PTInGymScreen}
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
        <Stack.Screen
          name="JoinCallVideoScreen"
          component={VideoCallScreen}
          options={{
            headerShown: false,
            orientation: 'portrait',
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
          name="SchedulePTScreen"
          component={SchedulePTScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.registerSlot"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="SlotsPTScreen"
          component={SlotsPTScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.viewBookedSlots"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
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

  const WithdrawalStack = () => {
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
          name="WithdrawalScreen"
          component={WithdrawalScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.withdrawal"),
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

  const FreelancePTHomeStack = () => {
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
          name="FreelancePTDashboard"
          component={FreelancePTDashboard}
          options={{
            headerTitleAlign: "center",
            headerShown: true,
            title: "Dashboard",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="JoinCallVideoScreen"
          component={VideoCallScreen}
          options={{
            headerShown: false,
            orientation: 'portrait',
          }}
        />
      </Stack.Navigator>
    );
  };

  const FreelancePTScheduleStack = () => {
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
          name="FreelancePTSchedule"
          component={FreelancePTSchedule}
          options={{
            headerShown: true,
            title: t("screenTitles.freelancePTSchedule"),
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

  const FreelancePTChatStack = () => {
    return (
      <Stack.Navigator
        screenOptions={({ navigation, route }) => ({
          headerTitleAlign: "center",
          headerShown: false,
          headerTintColor: "#ED2A46",
        })}
      >
        <Stack.Screen
          name="FreelancePTChatScreen"
          component={FreelancePTChatScreen}
          options={{
            headerShown: true,
            title: "Messages",
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
          name="MyPackageScreen"
          component={MyPackageScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.myPackage"),
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

         <Stack.Screen
          name="ManageVoucherScreen"
          component={ManageVoucherScreen}
          options={{
            headerShown: true,
            title: t("userMenu.manageVoucher"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />

        <Stack.Screen
          name="VoucherDetailScreen"
          component={VoucherDetailScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.voucherDetails"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />

        <Stack.Screen
          name="ManagePackageScreen"
          component={ManagePackageScreen}
          options={{
            headerShown: true,
            title: t("userMenu.managePackage"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="ManageTransactionScreen"
          component={ManageTransactionScreen}
          options={{
            headerShown: true,
            title: t("userMenu.manageTransaction"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="MyCustomerScreen"
          component={MyCustomerScreen}
          options={{
            headerShown: true,
            title: t("userMenu.myCustomer"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />

        <Stack.Screen
          name="JoinCallVideoScreen"
          component={VideoCallScreen}
          options={{
            headerShown: false,
            orientation: 'portrait',
          }}
        />
      
      </Stack.Navigator>
    );
  };

  const MainTab = () => {
    // Debug log to check user role

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
              } else if (route.name === t("navigation.freelancePTSchedule")) {
                iconName = "calendar";
              } else if (route.name === t("navigation.withdrawal")) {
                iconName = "money";
              } else if (route.name === t("navigation.freelancePTHome")) {
                iconName = "home";
              } else if (route.name === t("navigation.freelancePTChat")) {
                iconName = "comments";
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
        {/* Home tabs - different for FreelancePT */}
        {user?.role === "FreelancePT" ? (
          <Tab.Screen
            name={t("navigation.freelancePTHome")}
            component={FreelancePTHomeStack}
            options={{
              headerShown: false,
            }}
          />
        ) : (
          <Tab.Screen
            name={t("navigation.home")}
            component={HomeStack}
            options={{
              headerShown: false,
            }}
          />
        )}

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

        {user?.role === "Customer" && (
          <Tab.Screen
            name={t("navigation.map")}
            component={MapStack}
            options={{
              headerShown: false,
            }}
          />
        )}

        {user?.role === "GymPT" && (
          <Tab.Screen
            name={t("navigation.ptSchedule")}
            component={SchedulePTStack}
            options={{
              headerShown: false,
            }}
          />
        )}

        {user?.role === "FreelancePT" && (
          <Tab.Screen
            name={t("navigation.freelancePTSchedule")}
            component={FreelancePTScheduleStack}
            options={{
              headerShown: false,
            }}
          />
        )}

        {user?.role === "FreelancePT" && (
          <Tab.Screen
            name={t("navigation.withdrawal")}
            component={WithdrawalStack}
            options={{
              headerShown: false,
            }}
          />
        )}

        {user?.role === "FreelancePT" && (
          <Tab.Screen
            name={t("navigation.freelancePTChat")}
            component={FreelancePTChatStack}
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
