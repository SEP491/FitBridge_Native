import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import accountService from "../../../services/accountService";
import Ionicons from "@expo/vector-icons/Ionicons";
import Foundation from "@expo/vector-icons/Foundation";
import { useTranslation } from "../../../hooks/useTranslation";
import CourseCard from "../../../components/CourseCard/CourseCard";
import colors from "../../../constants/color";
export default function ChoosingCourseScreen() {
  const { t } = useTranslation();
  const [searchText, setSearchText] = useState("");
  const [courseList, setCourseList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const loadCourseForUser = async () => {
    try {
      setLoading(true);
      const response = await accountService.getCourseForUser();
      console.log("Course Data:", response.data);

      if (response.data) {
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        const mapFreelancePackage = (item) => ({
          id: item.id,
          customerPurchasedId: item.id,
          name: item.packageName,
          availableSessions: item.availableSessions,
          expirationDate: item.expirationDate,
          sessionDurationInMinutes: item.sessionDurationInMinutes,
          packageType: "FreelancePTPackage",
          pt: item.ptId
            ? {
                id: item.ptId,
                fullName: item.ptName,
                avatarUrl: item.ptImageUrl,
              }
            : null,
        });

        const mapGymCourse = (item) => ({
          id: item.id,
          customerPurchasedId: item.id,
          name: item.packageName,
          availableSessions: item.availableSessions,
          expirationDate: item.expirationDate,
          packageType: "GymCourse",
          canAssignPT: item.canAssignPT,
          gymCourseId: item.gymCourseId,
          pt: item.ptId
            ? {
                id: item.ptId,
                fullName: item.ptName,
                avatarUrl: item.ptImageUrl,
              }
            : null,
        });

        const freelanceItems =
          response.data.freelancePtPackage?.items?.map(mapFreelancePackage) ||
          [];
        const gymCourseItems =
          response.data.gymCourse?.items?.map(mapGymCourse) || [];

        const merged = [...freelanceItems, ...gymCourseItems].filter((item) => {
          const expiration = new Date(item.expirationDate);
          if (Number.isNaN(expiration.getTime())) return false;
          return expiration >= today;
        });

        setCourseList(merged);
      }
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseForUser();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourseForUser();
    setRefreshing(false);
  };

  const filteredCourses = courseList.filter(
    (item) =>
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (item.pt &&
        item.pt.fullName.toLowerCase().includes(searchText.toLowerCase()))
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="school-outline" size={64} color="#ccc" />
      <Text style={styles.emptySubtitle}>
        {searchText
          ? t("courseScreen.tryDifferentKeyword")
          : t("courseScreen.noCourseInSchedule")}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons
              name="search"
              size={20}
              color="#666"
              style={styles.searchIcon}
            />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder={t("courseScreen.searchPlaceholder")}
              placeholderTextColor="#999"
              style={styles.searchInput}
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchText("")}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.orange]}
              tintColor={colors.orange}
            />
          }
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>
                {t("courseScreen.loading")}
              </Text>
            </View>
          ) : filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onPress={() => {
                  if (course.packageType === "FreelancePTPackage") {
                    navigation.navigate("ScheduleFreelanceScreen", {
                      customerPurchasedId: course.customerPurchasedId,
                      duration: course.sessionDurationInMinutes,
                    });
                  } else {
                    navigation.navigate("ScheduleScreen", {
                      customerPurchasedId: course.customerPurchasedId,
                      ptId: course.pt?.id,
                    });
                  }
                }}
              />
            ))
          ) : (
            renderEmptyState()
          )}
        </ScrollView>

        {/* Floating Action Button for History */}
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.navigate("BookingHistoryScreen")}
          activeOpacity={0.8}
        >
          <Ionicons name="time-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#212529",
  },
  clearButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6C757D",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#ADB5BD",
    textAlign: "center",
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#6C757D",
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.orange,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});
