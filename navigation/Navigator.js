import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useTranslation } from "../hooks/useTranslation";
import Ionicons from "@expo/vector-icons/Ionicons";
import TabBarIcon from "../components/TabBarIcon/TabBarIcon";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import * as Linking from "expo-linking";
import authService from "../services/authService";
import FloatingVideoCall from "../components/FloatingVideoCall/FloatingVideoCall";
import HomeScreen from "../screens/CommonScreen/HomeScreen/HomeScreen";
import GymDetailScreen from "../screens/CommonScreen/GymDetailScreen/GymDetailScreen";
import PTInGymScreen from "../screens/CommonScreen/PTInGymScreen/PTInGymScreen";
import FeaturedFreelancePTScreen from "../screens/CommonScreen/FeaturedFreelancePTScreen/FeaturedFreelancePTScreen";
import FeaturedGymsScreen from "../screens/CommonScreen/FeaturedGymsScreen/FeaturedGymsScreen";
import BlogScreen from "../screens/CommonScreen/BlogScreen/BlogScreen";
import BlogDetailScreen from "../screens/CommonScreen/BlogDetailScreen/BlogDetailScreen";
import PTProfileScreen from "../screens/CommonScreen/PTProfileScreen/PTProfileScreen";
import CartScreen from "../screens/CommonScreen/CartScreen/CartScreen";
import FreelancePTPackageDetailScreen from "../screens/CommonScreen/FreelancePTPackageDetailScreen/FreelancePTPackageDetailScreen";
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
import PTBookingHistoryScreen from "../screens/GymPTScreen/PTBookingHistoryScreen/PTBookingHistoryScreen";
import ChatbotScreen from "../screens/CommonScreen/ChatScreen/ChatbotScreen";
import WithdrawalScreen from "../screens/FreelancePTScreen/WithdrawalScreen/WithdrawalScreen";
import FreelancePTDashboard from "./../screens/FreelancePTScreen/FreelancePTDashboard/FreelancePTDashboard";
import BalanceDetailScreen from "../screens/FreelancePTScreen/BalanceDetailScreen/BalanceDetailScreen";
import FreelancePTSchedule from "./../screens/FreelancePTScreen/FreelancePTSchedule/FreelancePTSchedule";
import UserMenuScreen from "../screens/CommonScreen/UserMenuScreen/UserMenuScreen";
import SettingScreen from "../screens/CommonScreen/SettingScreen/SettingScreen";
import LanguageSelectScreen from "../screens/CommonScreen/SettingScreen/LanguageSelectScreen/LanguageSelectScreen";
import ProfileScreen from "../screens/CustomerScreen/ProfileScreen/ProfileScreen";
import FreelancePTMyProfile from "../screens/FreelancePTScreen/FreelancePTMyProfile/FreelancePTMyProfile";
import GymPTMyProfile from "../screens/GymPTScreen/GymPTMyProfile/GymPTMyProfile";
import AccountScreen from "../screens/CustomerScreen/AccountScreen/AccountScreen";
import UpdatePasswordScreen from "../screens/AuthenticationScreen/UpdatePasswordScreen/UpdatePasswordScreen";
import SubscriptionScreen from "../screens/CustomerScreen/SubscriptionScreen/SubscriptionScreen";
import TransactionHistoryScreen from "../screens/CustomerScreen/TransactionHistoryScreen/TransactionHistoryScreen";
import MyPackageScreen from "../screens/CustomerScreen/MyPackageScreen/MyPackageScreen";
import MyReportsScreen from "../screens/CustomerScreen/MyReportsScreen/MyReportsScreen";
import ReportDetailScreen from "../screens/CustomerScreen/ReportDetailScreen/ReportDetailScreen";
import VoucherScreen from "../screens/CustomerScreen/VoucherScreen/VoucherScreen";
import ManageOrderScreen from "../screens/CustomerScreen/ManageOrderScreen/ManageOrderScreen";
import OrderDetailScreen from "../screens/CustomerScreen/OrderDetailScreen/OrderDetailScreen";
import FAQScreen from "../screens/CommonScreen/FAQScreen/FAQScreen";
import ManageVoucherScreen from "./../screens/FreelancePTScreen/ManageVoucherScreen/ManageVoucherScreen";
import ManagePackageScreen from "./../screens/FreelancePTScreen/ManagePackageScreen/ManagePackageScreen";
import ManageTransactionScreen from "./../screens/FreelancePTScreen/ManageTransactionScreen/ManageTransactionScreen";
import MyCustomerScreen from "./../screens/FreelancePTScreen/MyCustomerScreen/MyCustomerScreen";
import CustomerDetailScreen from "../screens/FreelancePTScreen/CustomerDetailScreen/CustomerDetailScreen";
import TrainingResultScreen from "../screens/FreelancePTScreen/TrainingResultScreen/TrainingResultScreen";
import LoginScreen from "../screens/AuthenticationScreen/LoginScreen/LoginScreen";
import ForgotPasswordScreen1 from "../screens/AuthenticationScreen/ForgotPasswordScreen/ForgotPasswordScreen1";
import ForgotPasswordScreen2 from "../screens/AuthenticationScreen/ForgotPasswordScreen/ForgotPasswordScreen2";
import ForgotPasswordScreen3 from "../screens/AuthenticationScreen/ForgotPasswordScreen/ForgotPasswordScreen3";
import RegisterScreen from "../screens/AuthenticationScreen/RegisterScreen/RegisterScreen";
import VoucherDetailScreen from "../screens/FreelancePTScreen/VoucherDetailScreen/VoucherDetailScreen";
import FloatingVideoCallScreen from "../screens/CommonScreen/FloatingVideoCallScreen/FloatingVideoCallScreen";
import VideoCallPrepScreen from "../screens/CommonScreen/VideoCallPrepScreen/VideoCallPrepScreen";

import NotificationScreen from "../screens/CommonScreen/NotificationScreen/NotificationScreen";
import { useSignalR } from "../context/SignalRContext";
import {
  MessagingStateProvider,
  useMessagingState,
} from "../context/messagingStateContext";
import * as Notifications from "expo-notifications";
import notificationService from "../services/notificationService";
import NotificationBannerWrapper from "../components/NotificationBannerWrapper";
import ScheduleFreelanceScreen from "../screens/CustomerScreen/ScheduleFreelanceScreen/ScheduleFreelanceScreen";
import FreelanceChoosingCourseScreen from "../screens/FreelancePTScreen/FreelanceChoosingCourseScreen/FreelanceChoosingCourseScreen";
import FreelancePTRequestScreen from "../screens/FreelancePTScreen/FreelancePTRequestScreen/FreelancePTRequestScreen";
import BookingDetailScreen from "../screens/CustomerScreen/BookingDetailScreen/BookingDetailScreen";
import TrainingActivityScreen from "../screens/CustomerScreen/TrainingActivityScreen/TrainingActivityScreen";
import EditSessionActivityScreen from "../screens/CustomerScreen/EditSessionActivityScreen/EditSessionActivityScreen";
import EditActivitySetScreen from "../screens/CustomerScreen/EditActivitySetScreen/EditActivitySetScreen";
import AddMeasurementScreen from "../screens/CommonScreen/AddMeasurementScreen/AddMeasurementScreen";
import { useRevenueCat } from "../context/RevenueCatContext";
import { useUser } from "../context/UserContext";
import CalendarPTScreen from "../screens/GymPTScreen/CalendarPTScreen/CalendarPTScreen";
import EcommerceScreen from "../screens/CommonScreen/EcommerceScreen/EcommerceScreen";
import BestSellerProductsScreen from "../screens/CommonScreen/BestSellerProductsScreen/BestSellerProductsScreen";
import TopRatingProductsScreen from "../screens/CommonScreen/TopRatingProductsScreen/TopRatingProductsScreen";
import ProductDetailsScreen from "../screens/CommonScreen/ProductDetailsScreen/ProductDetailsScreen";
import MessageScreen from "../screens/CommonScreen/ChatScreen/MessageScreen";
import MessageDetailScreen from "../screens/CommonScreen/ChatScreen/MessageDetailScreen";
import AddressListScreen from "../screens/CommonScreen/PaymentScreen/AddressListScreen";
import AddressSelectionScreen from "../screens/CommonScreen/PaymentScreen/AddressSelectionScreen";
import ContractScreen from "../screens/FreelancePTScreen/ContractScreen/ContractScreen";
import ContractDetailScreen from "../screens/FreelancePTScreen/ContractDetailScreen/ContractDetailScreen";
import MyReviewsRatingsScreen from "../screens/CommonScreen/MyReviewsRatingsScreen/MyReviewsRatingsScreen";
import ManageCerScreen from "../screens/FreelancePTScreen/ManageCerScreen/ManageCerScreen";
import FreelancePTBookingHistoryScreen from "../screens/FreelancePTScreen/FreelancePTBookingHistoryScreen/FreelancePTBookingHistoryScreen";
import CustomerPurchasedTransactionScreen from "../screens/FreelancePTScreen/CustomerPurchasedTransactionScreen";
import CustomerPurchasedBookingHistoryScreen from "../screens/FreelancePTScreen/CustomerPurchasedBookingHistoryScreen";
import PackageHistoryScreen from "../screens/CustomerScreen/PackageHistoryScreen/PackageHistoryScreen";
import GymPTProfileScreen from "../screens/CommonScreen/GymPTProfileScreen/GymPTProfileScreen";

export default function Navigator({
  isAuthenticated: propIsAuthenticated,
  isGuest: propIsGuest,
  user: propUser,
}) {
  const { t } = useTranslation();
  const Tab = createBottomTabNavigator();
  const Stack = createNativeStackNavigator();

  // Use authentication state from App.js props
  const [user, setUser] = useState(propUser);
  const [isAuthenticated, setIsAuthenticated] = useState(propIsAuthenticated);
  const [isGuest, setIsGuest] = useState(propIsGuest ?? true);
  const [isLoading, setIsLoading] = useState(false);
  const { fetchOfferings, fetchCustomerInfo } = useRevenueCat();
  // Update local state when props change
  useEffect(() => {
    setUser(propUser);
    setIsAuthenticated(propIsAuthenticated);
    setIsGuest(propIsGuest ?? true);
  }, [propUser, propIsAuthenticated, propIsGuest]);

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
                OrderSuccessScreen: "orderprocess",
              },
            },
            // Login/Register are now within the guest profile tab
            [t("navigation.login")]: {
              screens: {
                Login: "login",
                Register: "register",
              },
            },
          },
        },
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
            setIsGuest(false);
            setUser(authResult.user);
            await AsyncStorage.setItem("user", JSON.stringify(authResult.user));

            // Update App.js state as well
            if (global.setAppAuthState) {
              global.setAppAuthState({
                isAuthenticated: true,
                isGuest: false,
                user: authResult.user,
              });
            }

            // Avatar will be automatically updated when screens refresh
          } else {
            setIsAuthenticated(false);
            setIsGuest(true);
            setUser(null);
            console.log("User cleared - reverting to guest mode");
            await AsyncStorage.multiRemove(["token", "user"]);

            // Update App.js state as well
            if (global.setAppAuthState) {
              global.setAppAuthState({
                isAuthenticated: false,
                isGuest: true,
                user: null,
              });
            }
          }
        } catch (error) {
          console.error("Error updating navigation user:", error);
          setIsAuthenticated(false);
          setIsGuest(true);
          setUser(null);
          await AsyncStorage.multiRemove(["token", "user"]);

          // Update App.js state as well
          if (global.setAppAuthState) {
            global.setAppAuthState({
              isAuthenticated: false,
              isGuest: true,
              user: null,
            });
          }
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
          name="FeaturedFreelancePTScreen"
          component={FeaturedFreelancePTScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="FeaturedGymsScreen"
          component={FeaturedGymsScreen}
          options={{
            headerShown: false,
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
          name="PTProfileScreen"
          component={PTProfileScreen}
          options={{
            headerTitleAlign: "center",
            headerShown: true,
            title: t("screenTitles.ptInfo"),
          }}
        />
        <Stack.Screen
          name="GymPTProfileScreen"
          component={GymPTProfileScreen}
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
          name="FreelancePTPackageDetailScreen"
          component={FreelancePTPackageDetailScreen}
          options={{
            headerTitleAlign: "center",
            headerShown: true,
            title: t("screenTitles.packageDetail"),
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
          name="VideoCallPrep"
          component={VideoCallPrepScreen}
          options={{
            headerShown: true,
            orientation: "portrait",
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="MapScreen"
          component={MapScreen}
          options={{
            headerTitleAlign: "center",
            headerShown: true,
            title: t("screenTitles.map"),
          }}
        />

        <Stack.Screen
          name="NotificationScreen"
          component={NotificationScreen}
          options={{
            headerTitleAlign: "center",
            headerShown: true,
            title: t("screenTitles.notification"),
          }}
        />
        <Stack.Screen
          name="ProductDetailsScreen"
          component={ProductDetailsScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.productDetail"),
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
          component={FloatingVideoCallScreen}
          options={{
            headerShown: false,
            orientation: "portrait",
          }}
        />
        <Stack.Screen
          name="VideoCallScreen"
          component={FloatingVideoCallScreen}
          options={{
            headerShown: false,
            orientation: "portrait",
          }}
        />
        <Stack.Screen
          name="FloatingVideoCallScreen"
          component={FloatingVideoCallScreen}
          options={{
            headerShown: false,
            orientation: "portrait",
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
          name="BookingDetailScreen"
          component={BookingDetailScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.bookingDetail"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="TrainingResultScreen"
          component={TrainingResultScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.trainingResult"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="AddMeasurementScreen"
          component={AddMeasurementScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.addMeasurement"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="TrainingActivityScreen"
          component={TrainingActivityScreen}
          options={{
            headerShown: true,
            title: "Tập luyện",
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="VideoCallPrep"
          component={VideoCallPrepScreen}
          options={{
            headerShown: true,
            orientation: "portrait",
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="VideoCallScreen"
          component={FloatingVideoCallScreen}
          options={{
            headerShown: false,
            orientation: "portrait",
          }}
        />
        <Stack.Screen
          name="FloatingVideoCallScreen"
          component={FloatingVideoCallScreen}
          options={{
            headerShown: false,
            orientation: "portrait",
          }}
        />

        <Stack.Screen
          name="CustomerDetailScreen"
          component={CustomerDetailScreen}
          options={{
            headerShown: true,
            title: t("userMenu.customerDetail"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />

        {/* Booking Screens - moved from BookingStack */}
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
          name="ScheduleFreelanceScreen"
          component={ScheduleFreelanceScreen}
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

  const CalendarPTStack = () => {
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
          name="CalendarPTScreen"
          component={CalendarPTScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.schedulePT"),
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
        <Stack.Screen
          name="CustomerDetailScreen"
          component={CustomerDetailScreen}
          options={{
            headerShown: true,
            title: t("userMenu.customerDetail"),
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
          name="MessageScreen"
          component={MessageScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="MessageDetailScreen"
          component={MessageDetailScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="ChatbotScreen"
          component={ChatbotScreen}
          options={({ navigation, route }) => ({
            headerShown: true,
            title: t("screenTitles.aiChatbox"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
            headerLeft: (props) =>
              navigation.canGoBack() ? (
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Ionicons name="caret-back" size={30} color="#ED2A46" />
                </TouchableOpacity>
              ) : null,
          })}
        />
        <Stack.Screen
          name="VideoCallScreen"
          component={FloatingVideoCallScreen}
          options={{
            headerShown: false,
            orientation: "portrait",
          }}
        />
      </Stack.Navigator>
    );
  };

  const EcommerceStack = () => {
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
          name="EcommerceMain"
          component={EcommerceScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="GymDetailScreen"
          component={GymDetailScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.gymDetail"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="PTProfileScreen"
          component={PTProfileScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.ptInfo"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
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
          name="CartScreen"
          component={CartScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.cart"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="PaymentScreen"
          component={PaymentScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.payment"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="AddressListScreen"
          component={AddressListScreen}
          options={{
            zIndex: 999,
            headerShown: true,
            title: t("screenTitles.addressList"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="AddressSelectionScreen"
          component={AddressSelectionScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.addressSelection"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="ProductDetailsScreen"
          component={ProductDetailsScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.productDetail"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="BestSellerProductsScreen"
          component={BestSellerProductsScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.bestSellerProducts"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="TopRatingProductsScreen"
          component={TopRatingProductsScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.topRatedProducts"),
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

  const BookingStack = () => {
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
          name="ScheduleFreelanceScreen"
          component={ScheduleFreelanceScreen}
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
        <Stack.Screen
          name="VideoCallScreen"
          component={FloatingVideoCallScreen}
          options={{
            headerShown: false,
            orientation: "portrait",
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
          name="NotificationScreen"
          component={NotificationScreen}
          options={{
            headerTitleAlign: "center",
            headerShown: true,
            title: t("screenTitles.notification"),
          }}
        />

        <Stack.Screen
          name="BalanceDetailScreen"
          component={BalanceDetailScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.balanceDetail"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />

        <Stack.Screen
          name="VideoCallPrep"
          component={VideoCallPrepScreen}
          options={{
            headerShown: false,
            orientation: "portrait",
          }}
        />
        <Stack.Screen
          name="VideoCallScreen"
          component={FloatingVideoCallScreen}
          options={{
            headerShown: false,
            orientation: "portrait",
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
        <Stack.Screen
          name="BookingDetailScreen"
          component={BookingDetailScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.bookingDetail") || "Chi tiết buổi tập",
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="EditSessionActivityScreen"
          component={EditSessionActivityScreen}
          options={{
            headerShown: true,
            title: "Chỉnh sửa bài tập",
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="EditActivitySetScreen"
          component={EditActivitySetScreen}
          options={{
            headerShown: true,
            title: "Chỉnh sửa set",
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="TrainingActivityScreen"
          component={TrainingActivityScreen}
          options={{
            headerShown: true,
            title: "Tập luyện",
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="VideoCallPrep"
          component={VideoCallPrepScreen}
          options={{
            headerShown: true,
            orientation: "portrait",
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="VideoCallScreen"
          component={FloatingVideoCallScreen}
          options={{
            headerShown: false,
            orientation: "portrait",
          }}
        />
        <Stack.Screen
          name="FloatingVideoCallScreen"
          component={FloatingVideoCallScreen}
          options={{
            headerShown: false,
            orientation: "portrait",
          }}
        />
        <Stack.Screen
          name="CustomerDetailScreen"
          component={CustomerDetailScreen}
          options={{
            headerShown: true,
            title: t("userMenu.customerDetail"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="TrainingResultScreen"
          component={TrainingResultScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.trainingResult"),
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

  const FreelancePTRequestStack = () => {
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
          name="FreelanceChoosingCourseScreen"
          component={FreelanceChoosingCourseScreen}
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
        <Stack.Screen
          name="FreelancePTRequestScreen"
          component={FreelancePTRequestScreen}
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

        <Stack.Screen
          name="FreelancePTBookingHistoryScreen"
          component={FreelancePTBookingHistoryScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.freelancePTBookingHistory"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="BookingDetailScreen"
          component={BookingDetailScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.bookingDetail"),
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
          name="MessageScreen"
          component={MessageScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="MessageDetailScreen"
          component={MessageDetailScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="VideoCallScreen"
          component={FloatingVideoCallScreen}
          options={{
            headerShown: false,
            orientation: "portrait",
          }}
        />
      </Stack.Navigator>
    );
  };

  const GymPTChatStack = () => {
    return (
      <Stack.Navigator
        screenOptions={({ navigation, route }) => ({
          headerTitleAlign: "center",
          headerShown: false,
          headerTintColor: "#ED2A46",
        })}
      >
        <Stack.Screen
          name="MessageScreen"
          component={MessageScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="MessageDetailScreen"
          component={MessageDetailScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    );
  };

  // Guest Profile Stack - shows login/register options for guests
  const GuestProfileStack = () => {
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
          component={
            user?.role === "FreelancePT"
              ? FreelancePTMyProfile
              : user?.role === "GymPT"
              ? GymPTMyProfile
              : ProfileScreen
          }
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
          name="PTProfileScreen"
          component={PTProfileScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.ptInfo"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="CartScreen"
          component={CartScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.cart"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="MyReviewsRatingsScreen"
          component={MyReviewsRatingsScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.myReviewsRatings"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
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
          name="FreelancePTPackageDetailScreen"
          component={FreelancePTPackageDetailScreen}
          options={{
            headerTitleAlign: "center",
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
            title:
              t("screenTitles.orderHistory") ||
              t("screenTitles.transactionHistory"),
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
          name="PackageHistoryScreen"
          component={PackageHistoryScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.packageHistory"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="MyReportsScreen"
          component={MyReportsScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.myReports") || "My Reports",
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="ReportDetailScreen"
          component={ReportDetailScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.reportDetail") || "Report Detail",
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
          name="ManageOrderScreen"
          component={ManageOrderScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.manageOrders"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="OrderDetailScreen"
          component={OrderDetailScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.orderDetails"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="AddMeasurementScreen"
          component={AddMeasurementScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.addMeasurement"),
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
          name="GymPTProfileScreen"
          component={GymPTProfileScreen}
          options={{
            headerTitleAlign: "center",
            headerShown: true,
            title: t("screenTitles.ptInfo"),
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
          name="BalanceDetailScreen"
          component={BalanceDetailScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.balanceDetail"),
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
          name="CustomerDetailScreen"
          component={CustomerDetailScreen}
          options={{
            headerShown: true,
            title: t("userMenu.customerDetail"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="CustomerPurchasedTransactionScreen"
          component={CustomerPurchasedTransactionScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.customerPurchasedTransaction"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="CustomerPurchasedBookingHistoryScreen"
          component={CustomerPurchasedBookingHistoryScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.customerPurchasedBookingHistory"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="BookingDetailScreen"
          component={BookingDetailScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.bookingDetail"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="TrainingResultScreen"
          component={TrainingResultScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.trainingResult"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="VideoCallPrep"
          component={VideoCallPrepScreen}
          options={{
            headerShown: false,
            orientation: "portrait",
          }}
        />
        <Stack.Screen
          name="VideoCallScreen"
          component={FloatingVideoCallScreen}
          options={{
            headerShown: false,
            orientation: "portrait",
          }}
        />
        <Stack.Screen
          name="ContractScreen"
          component={ContractScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.contracts"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="ContractDetailScreen"
          component={ContractDetailScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.contractDetail"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="ManageCerScreen"
          component={ManageCerScreen}
          options={{
            headerShown: true,
            title: t("userMenu.certificateManagement"),
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 20,
              color: "#ED2A46",
            },
          }}
        />
        <Stack.Screen
          name="PaymentScreen"
          component={PaymentScreen}
          options={{
            headerShown: true,
            title: t("screenTitles.payment"),
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
    const { service: signalrService } = useSignalR();
    const { startConnection } = useMessagingState();
    const { getAvatarUser } = useUser();
    const registerPushToken = async () => {
      // Only register push token for authenticated users
      if (!isAuthenticated || isGuest) {
        console.log("Skipping push token registration for guest user");
        return;
      }
      try {
        // Check current permission status
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        // If not granted, request permissions
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
          // Get device push token
        }

        if (finalStatus === "granted") {
          console.log("✅ Notification permissions granted");
          const pushSubscription =
            await Notifications.getDevicePushTokenAsync();
          console.log("pushSubscription", pushSubscription);
          const token = pushSubscription.data;
          const platform = Platform.OS;
          await notificationService.registerDeviceToken({
            deviceToken: token,
            platform,
          });
          console.log("✅ Device token registered successfully");
        }
      } catch (error) {
        console.error("❌ Error registering push token:", error);
      }
    };
    useEffect(() => {
      // Only initialize services for authenticated users
      if (isAuthenticated && !isGuest) {
        registerPushToken();
        getAvatarUser();
        signalrService.startConnection();
        // Start messaging SignalR connection when MainTab mounts
        startConnection();
      }
    }, [isAuthenticated, isGuest]);

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
              return (
                <TabBarIcon
                  routeName={route.name}
                  focused={focused}
                  color={color}
                  size={size}
                />
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
        {/* Ecommerce tab - available for Customers and Guests */}
        {(user?.role === "Customer" || isGuest) && (
          <Tab.Screen
            name={t("navigation.ecommerce")}
            component={EcommerceStack}
            options={{
              headerShown: false,
            }}
          />
        )}
        {/* Role-specific tabs - only for authenticated users */}
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
            name={t("navigation.message")}
            component={ChatStack}
            options={{
              headerShown: false,
            }}
          />
        )}
        {user?.role === "GymPT" && (
          <Tab.Screen
            name={t("navigation.ptSchedule")}
            component={CalendarPTStack}
            options={{
              headerShown: false,
            }}
          />
        )}
        {user?.role === "GymPT" && (
          <Tab.Screen
            name={t("navigation.registerSlot")}
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
            name={t("navigation.freelancePTBookingRequest")}
            component={FreelancePTRequestStack}
            options={{
              headerShown: false,
            }}
          />
        )}
        {/* {user?.role === "FreelancePT" && (
          <Tab.Screen
            name={t("navigation.withdrawal")}
            component={WithdrawalStack}
            options={{
              headerShown: false,
            }}
          />
        )} */}
        {user?.role === "FreelancePT" && (
          <Tab.Screen
            name={t("navigation.freelancePTChat")}
            component={FreelancePTChatStack}
            options={{
              headerShown: false,
            }}
          />
        )}
        {user?.role === "GymPT" && (
          <Tab.Screen
            name={t("navigation.freelancePTChat")}
            component={GymPTChatStack}
            options={{
              headerShown: false,
            }}
          />
        )}

        {/* {user?.role === "Customer" && (
            <Tab.Screen
              name={t("navigation.aiChatbox")}
              component={ChatStack}
              options={{
                headerShown: false,
              }}
            />
          )} */}
        {/* Profile/Login tab - shows login for guests, profile for authenticated users */}
        <Tab.Screen
          name={isGuest ? t("navigation.login") : t("navigation.me")}
          component={isGuest ? GuestProfileStack : ProfileStack}
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
    <MessagingStateProvider>
      <NavigationContainer linking={linking}>
        <NotificationBannerWrapper>
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
            initialRouteName="MainApp"
          >
            {/* MainApp is always accessible - guests can browse, login is available in tabs */}
            <Stack.Screen name="MainApp" component={MainTab} />
          </Stack.Navigator>
          <FloatingVideoCall />
        </NotificationBannerWrapper>
      </NavigationContainer>
    </MessagingStateProvider>
  );
}
