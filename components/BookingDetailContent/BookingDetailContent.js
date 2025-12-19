import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import colors from "../../constants/color";
import customerPurchasedService from "../../services/customerPurchased";
import accountService from "../../services/accountService";
import bookingService from "../../services/bookingService";

const bodyPartImages = {
  chest: require("../../assets/images/bodyparts/chest.png"),
  back: require("../../assets/images/bodyparts/back.png"),

  shoulder: require("../../assets/images/bodyparts/shoulder.png"),
  biceps: require("../../assets/images/bodyparts/biceps.png"),
  triceps: require("../../assets/images/bodyparts/triceps.png"),
  foreArm: require("../../assets/images/bodyparts/foreArm.png"),
  thigh: require("../../assets/images/bodyparts/thigh.png"),
  glutes: require("../../assets/images/bodyparts/glutes.png"),
  calf: require("../../assets/images/bodyparts/calf.png"),
  waist: require("../../assets/images/bodyparts/waist.png"),
  fullbody: require("../../assets/images/bodyparts/fullbody.png"),
  other: require("../../assets/images/bodyparts/other.png"),
};

const ACTIVITY_TYPES = [
  { id: "WarmUp", name: "Warm Up", color: "#FFF7ED", iconColor: "#EA580C" },
  {
    id: "Resistance",
    name: "Resistance",
    color: "#ECFDF5",
    iconColor: "#059669",
  },
  { id: "Cardio", name: "Cardio", color: "#EFF6FF", iconColor: "#2563EB" },
  { id: "Mobility", name: "Mobility", color: "#F5F3FF", iconColor: "#7C3AED" },
  { id: "CoolDown", name: "Cool Down", color: "#ECFEFF", iconColor: "#06B6D4" },
  { id: "Rehab", name: "Rehab", color: "#FEF2F2", iconColor: "#DC2626" },
];

const MUSCLE_GROUPS = [
  { id: "Chest", name: "Ngực", image: bodyPartImages.chest },
  { id: "Back", name: "Lưng", image: bodyPartImages.back },
  { id: "Shoulders", name: "Vai", image: bodyPartImages.shoulder },
  { id: "Biceps", name: "Tay Trước", image: bodyPartImages.biceps },
  { id: "Triceps", name: "Tay Sau", image: bodyPartImages.triceps },
  { id: "Forearms", name: "Cẳng Tay", image: bodyPartImages.foreArm },
  { id: "Thighs", name: "Đùi", image: bodyPartImages.thigh },
  { id: "Glutes", name: "Mông", image: bodyPartImages.glutes },
  { id: "Calves", name: "Bắp chân", image: bodyPartImages.calf },
  { id: "AbsCore", name: "Bụng", image: bodyPartImages.waist },
  { id: "FullBody", name: "Toàn Thân", image: bodyPartImages.fullbody },
  { id: "Other", name: "Khác", image: bodyPartImages.other },
];

export default function BookingDetailContent({
  bookingDetail,
  Booking,
  userRole,
  navigation,
  t,
  onAddExercise,
}) {
  // Get unique activity types from sessionActivities

  const scrollViewRef = React.useRef(null);

  const getActivityAssetLabel = (activity) => {
    return (
      activity.vietnameseAssetName ||
      activity.assetName ||
      activity.vietnameseAssetDescription ||
      ""
    );
  };

  const getActivityMuscle = (activity) => {
    if (!activity?.muscleGroup) return null;
    const muscleId = Array.isArray(activity.muscleGroup)
      ? activity.muscleGroup[0]
      : activity.muscleGroup;
    return MUSCLE_GROUPS.find((m) => m.id === muscleId) || null;
  };
  const getUniqueActivityTypes = () => {
    if (
      !bookingDetail?.sessionActivities ||
      bookingDetail.sessionActivities.length === 0
    ) {
      return [];
    }
    const types = bookingDetail.sessionActivities.map(
      (activity) => activity.activityType
    );
    return [...new Set(types)];
  };

  // Get unique muscle groups from sessionActivities
  const getUniqueMuscleGroups = () => {
    if (
      !bookingDetail?.sessionActivities ||
      bookingDetail.sessionActivities.length === 0
    ) {
      return [];
    }
    const muscleGroups = bookingDetail.sessionActivities.flatMap(
      (activity) => activity.muscleGroup || []
    );
    return [...new Set(muscleGroups)];
  };

  const handleNoteFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleCustomerDetail = () => {
    fetchCustomerAndPackages(Booking);
  };

  const fetchCustomerAndPackages = async (booking) => {
    try {
      if (!booking?.customerId) {
        console.log("No customer ID provided");
        return;
      }

      // Fetch customer information
      const customerId = booking.customerId;
      const customerResponse = await accountService.getFreelancePTCustomers({
        customerId: customerId,
      });
      const customerData = customerResponse.data?.items[0];
      console.log("Customer Data:", customerData);

      // Fetch customer packages
      const packagesResponse =
        await customerPurchasedService.getAllCustomerPurchasedPackageById(
          booking.customerId
        );
      const packages = packagesResponse.data?.items || [];

      // Calculate join date from earliest package purchase
      const joinDate =
        packages.length > 0
          ? new Date(
              Math.min(...packages.map((p) => new Date(p.purchaseDate)))
            ).toLocaleDateString("vi-VN")
          : "N/A";

      // Filter active packages (not expired and have sessions left)
      const activePackagesList = packages.filter((pkg) => {
        const expDate = new Date(pkg.expirationDate);
        const today = new Date();
        return expDate > today && pkg.availableSessions > 0;
      });

      const totalActiveSessions = activePackagesList.reduce(
        (sum, pkg) => sum + pkg.availableSessions,
        0
      );
      const activePackages = activePackagesList.length;

      // Construct complete customer object with packages
      const completeCustomer = {
        id: customerData.id,
        name: customerData.fullName,
        email: customerData.email,
        phone: "(+84)" + (customerData.phoneNumber || "N/A"),
        avatarUrl: customerData.avatarUrl,
        status: activePackages > 0 ? "active" : "inactive",
        joinDate: joinDate,
        packages: packages,
        totalPackages: packages.length,
        activePackages: activePackages,
        totalSessions: totalActiveSessions,
        lastSession: "N/A",
      };

      console.log("Complete Customer Data:", completeCustomer);

      // Navigate to CustomerDetailScreen with complete data after all data is fetched
      if (customerData && packages) {
        navigation.navigate("CustomerDetailScreen", {
          customer: completeCustomer,
        });
      }
    } catch (error) {
      console.error(
        "Error fetching customer and packages:",
        error.response?.data?.message
      );
    }
  };

  // useEffect removed - no longer needed as fetchCustomerAndPackages is called on demand

  //   // Fetch customer purchased information using the customerId
  //   // This is a placeholder for the actual API call
  //   const response = customerPurchasedService.getAllCustomerPurchasedPackageById(customerId);
  //   setCustomer(response.data.items);
  // };

  // useEffect(() => {
  //   getCustomerPurchasedInformation(Booking.customerId);
  // }, [Booking]);

  // Determine session state
  const getSessionState = () => {
    if (
      bookingDetail.sessionStartTime == null &&
      bookingDetail.sessionEndTime == null
    ) {
      return "not-started";
    } else if (
      bookingDetail.sessionStartTime != null &&
      bookingDetail.sessionEndTime == null
    ) {
      return "in-progress";
    } else if (
      bookingDetail.sessionStartTime != null &&
      bookingDetail.sessionEndTime != null
    ) {
      return "completed";
    }
    return "not-started";
  };

  const [sessionState, setSessionState] = useState(getSessionState());

  const handleStartSession = async () => {
    try {
      const response = await bookingService.startSession({
        bookingId: bookingDetail.bookingId,
      });
      console.log(response);
      setSessionState("in-progress");
    } catch (error) {
      console.error("Error starting session:", error.response?.data?.message);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Unable to start session. Please try again."
      );
    }
  };

  const handleEndSession = async () => {
    try {
      const response = await bookingService.endSession({
        bookingId: bookingDetail.bookingId,
      });
      console.log(response);
      setSessionState("completed");
    } catch (error) {
      console.error("Error ending session:", error.response?.data?.message);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Unable to end session. Please try again."
      );
    }
  };
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Booking Detail Card */}
        {bookingDetail?.bookingName && (
          <View style={styles.bookingCard}>
            <View style={styles.bookingHeader}>
              <Text style={styles.bookingHeaderTitle}>
                {t("bookingDetail.bookingInfo", "Booking Information")}
              </Text>
              {Booking.sessionStatus && (
                <Text style={styles.sessionStatusBadge}>
                  {Booking.sessionStatus}
                </Text>
              )}
            </View>

            <View style={styles.bookingInfoRow}>
              <View style={styles.bookingAvatar}>
                <Ionicons
                  name="barbell-sharp"
                  size={32}
                  color={colors.orange}
                />
              </View>

              <View style={styles.bookingDetails}>
                <Text style={styles.bookingName}>
                  {bookingDetail.bookingName || "N/A"}
                </Text>
                <Text style={styles.bookingDetailText}>
                  {t("bookingDetail.bookingDate")}:{" "}
                  {(() => {
                    if (!Booking.bookingDate) return "N/A";
                    const dateParts = Booking.bookingDate.split("-");
                    return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                  })()}
                </Text>
                {Booking.packageName && (
                  <Text style={styles.bookingDetailText}>
                    {t("bookingDetail.packageName")}: {Booking.packageName}
                  </Text>
                )}
                {bookingDetail.sessionStartTime && (
                  <Text style={styles.bookingDetailText}>
                    {t("bookingDetail.bookingTime")}:{" "}
                    {new Date(
                      bookingDetail.sessionStartTime
                    ).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(bookingDetail.sessionEndTime).toLocaleTimeString(
                      "vi-VN",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Customer Detail Card */}
        {Booking?.customerName && (
          <View style={styles.customerCard}>
            <View style={styles.customerHeader}>
              <Ionicons name="person-circle" size={20} color={colors.orange} />
              <Text style={styles.customerHeaderTitle}>
                {t("bookingDetail.customerInfo", "Customer Information")}
              </Text>
            </View>

            <TouchableOpacity onPress={handleCustomerDetail}>
              <View style={styles.customerInfoRow}>
                <View style={styles.customerAvatar}>
                  {Booking.customerAvatarUrl ? (
                    <Image
                      source={{ uri: Booking.customerAvatarUrl }}
                      style={styles.customerAvatarImage}
                    />
                  ) : (
                    <Ionicons name="person" size={32} color={colors.orange} />
                  )}
                </View>

                <View style={styles.customerDetails}>
                  <Text style={styles.customerSubtitle}>
                    {t("bookingDetail.customerName")}
                  </Text>
                  <Text style={styles.customerName}>
                    {Booking.customerName || "N/A"}
                  </Text>
                </View>
                <View style={styles.customerViewMore}>
                  <Text style={styles.customerViewMoreText}>
                    <Ionicons
                      name="chevron-forward"
                      size={25}
                      color={colors.orange}
                    />
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Activity Types Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="fitness" size={20} color={colors.red} />
            <Text style={styles.sectionLabel}>
              {t("bookingDetail.activityTypes")}
            </Text>
          </View>
          <View style={styles.activityTypesContainer}>
            {getUniqueActivityTypes().map((activityType, index) => {
              const activityTypeInfo = ACTIVITY_TYPES.find(
                (t) => t.id === activityType
              );
              return (
                <View
                  key={index}
                  style={[
                    styles.activityTypeChip,
                    { backgroundColor: activityTypeInfo?.color || "#f0f0f0" },
                  ]}
                >
                  <Ionicons
                    name={activityType === "WarmUp" ? "walk" : "barbell"}
                    size={16}
                    color="#333"
                  />
                  <Text style={styles.activityTypeText}>
                    {activityTypeInfo?.name || activityType}
                  </Text>
                </View>
              );
            })}
            {/* Empty state */}
            {getUniqueActivityTypes().length === 0 && (
              <View style={styles.emptyStateCard}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#999"
                />
                <Text style={styles.emptyText}>
                  {t("bookingDetail.noActivityTypes")}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Muscle Groups Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="body" size={20} color={colors.red} />
            <Text style={styles.sectionLabel}>
              {t("bookingDetail.mainMuscleGroups")}
            </Text>
          </View>
          <View style={styles.muscleGrid}>
            {getUniqueMuscleGroups().map((muscleId) => {
              const muscle = MUSCLE_GROUPS.find((m) => m.id === muscleId);
              if (!muscle) return null;
              return (
                <View key={muscleId} style={styles.muscleCard}>
                  {muscle.image ? (
                    <Image
                      source={muscle.image}
                      style={styles.muscleImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.muscleIcon}>
                      <Ionicons name="body" size={32} color="#FF914D" />
                    </View>
                  )}
                  <Text style={styles.muscleName}>{muscle.name}</Text>
                </View>
              );
            })}
            {/* Empty state */}
            {getUniqueMuscleGroups().length === 0 && (
              <View style={styles.emptyStateCard}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#999"
                />
                <Text style={styles.emptyText}>
                  {t("bookingDetail.noMuscleGroups")}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Activity Sets Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="list" size={20} color={colors.red} />
            <Text style={styles.sectionLabel}>
              {t("bookingDetail.exerciseList")} (
              {bookingDetail?.sessionActivities?.length || 0})
            </Text>
          </View>

          {bookingDetail?.sessionActivities?.map((activity, actIndex) => (
            <View
              key={actIndex}
              style={[
                styles.setCard,
                activity.isCompleted && styles.completedSetCard,
              ]}
            >
              <TouchableOpacity
                style={[styles.setCardContent]}
                onPress={() =>
                  navigation.navigate("TrainingActivityScreen", {
                    activityId: activity.id,
                    userRole: userRole,
                    sessionState: sessionState,
                  })
                }
              >
                <View style={styles.activityCardRow}>
                  {/* Left: muscle thumbnail */}
                  <View style={styles.activityThumbWrapper}>
                    {getActivityMuscle(activity)?.image ? (
                      <Image
                        source={getActivityMuscle(activity).image}
                        style={styles.activityThumbImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <View style={styles.activityThumbFallback}>
                        <Ionicons name="body" size={26} color={colors.orange} />
                      </View>
                    )}
                    {activity.isCompleted && (
                      <View style={styles.activityThumbStatus}>
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      </View>
                    )}
                  </View>

                  {/* Right: main info */}
                  <View style={styles.activityInfo}>
                    <View style={styles.activityTitleRow}>
                      <View style={{ flex: 1 }}>
                        <Text numberOfLines={1} style={styles.activityTitle}>
                          {activity.activityName ||
                            t("bookingDetail.exerciseName")}
                        </Text>
                        {getActivityAssetLabel(activity) ? (
                          <Text
                            numberOfLines={1}
                            style={styles.activityAssetText}
                          >
                            {getActivityAssetLabel(activity)}
                          </Text>
                        ) : null}
                      </View>
                      {userRole === "FreelancePT" && (
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() =>
                            navigation.navigate("EditSessionActivityScreen", {
                              sessionActivity: activity,
                              Booking: Booking,
                            })
                          }
                        >
                          <Ionicons
                            name="create-outline"
                            size={22}
                            color={colors.orange}
                          />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Chips row: activity type + asset type */}
                    <View style={styles.activityChipsRow}>
                      <View
                        style={[
                          styles.activityTypeChip,
                          {
                            backgroundColor:
                              ACTIVITY_TYPES.find(
                                (t) => t.id === activity.activityType
                              )?.color || "#E2E8F0",
                          },
                        ]}
                      >
                        <Text style={styles.activityTypeChipText}>
                          {ACTIVITY_TYPES.find(
                            (t) => t.id === activity.activityType
                          )?.name || activity.activityType}
                        </Text>
                      </View>

                      {activity.assetType && (
                        <View
                          style={[
                            styles.assetTypeBadge,
                            activity.assetType === "Equipment"
                              ? styles.assetTypeEquipment
                              : styles.assetTypeNoneEquipment,
                          ]}
                        >
                          <Ionicons
                            name={
                              activity.assetType === "Equipment"
                                ? "fitness-outline"
                                : "body-outline"
                            }
                            size={14}
                            color="#FFFFFF"
                          />
                          <Text style={styles.assetTypeText}>
                            {activity.assetType === "Equipment"
                              ? t(
                                  "bookingDetail.assetTypeEquipment",
                                  "Equipment"
                                )
                              : t(
                                  "bookingDetail.assetTypeNoneEquipment",
                                  "None Equipment"
                                )}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Stats row */}
                    <View style={styles.activityStatsRow}>
                      {getActivityMuscle(activity) && (
                        <View style={styles.activityStatItem}>
                          <Ionicons
                            name="body-outline"
                            size={14}
                            color="#64748B"
                          />
                          <Text style={styles.activityStatText}>
                            {getActivityMuscle(activity).name}
                          </Text>
                        </View>
                      )}

                      <View style={styles.activityStatItem}>
                        <Ionicons
                          name="layers-outline"
                          size={14}
                          color="#64748B"
                        />
                        <Text style={styles.activityStatText}>
                          {activity.totalSets || 0}{" "}
                          {t("bookingDetail.sets", "sets")}
                        </Text>
                      </View>

                      <View style={styles.activityStatItem}>
                        <Ionicons
                          name="analytics-outline"
                          size={14}
                          color="#64748B"
                        />
                        <Text style={styles.activityStatText}>
                          {activity.activitySetType === "Reps"
                            ? `${activity.totalPlannedNumOfReps || 0} ${t(
                                "bookingDetail.reps",
                                "reps"
                              )}`
                            : activity.activitySetType === "Time"
                            ? `${activity.totalPlannedPracticeTime || 0}${t(
                                "bookingDetail.seconds",
                                "s"
                              )}`
                            : activity.activitySetType === "Distance"
                            ? `${activity.totalPlannedDistance || 0}${t(
                                "bookingDetail.meters",
                                "m"
                              )}`
                            : ""}
                        </Text>
                      </View>

                      {activity.isCompleted && (
                        <View style={styles.activityCompletedPill}>
                          <Ionicons
                            name="checkmark-circle"
                            size={14}
                            color="#16A34A"
                          />
                          <Text style={styles.activityCompletedText}>
                            {t("bookingDetail.completed", "Completed")}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          ))}

          {/* Empty state for sets */}
          {(!bookingDetail?.sessionActivities ||
            bookingDetail.sessionActivities.length === 0) && (
            <View style={styles.emptySetContainer}>
              <Ionicons name="clipboard-outline" size={48} color="#ddd" />
              <Text style={styles.emptySetText}>
                {t("bookingDetail.noExercises")}
              </Text>
              {userRole === "FreelancePT" && (
                <Text style={styles.emptySetHint}>
                  {t("bookingDetail.addExerciseHint")}
                </Text>
              )}
            </View>
          )}

          {/* Add Button - Only for PT */}
          {userRole === "FreelancePT" && (
            <TouchableOpacity style={styles.addButton} onPress={onAddExercise}>
              <Ionicons name="add-circle" size={24} color={colors.white} />
              <Text style={styles.addButtonText}>
                {t("bookingDetail.addExercise")}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={20} color={colors.red} />
            <Text style={styles.sectionLabel}>{t("bookingDetail.notes")}</Text>
          </View>
          <View style={styles.noteBox}>
            <TextInput
              style={styles.noteInput}
              placeholder={
                userRole === "FreelancePT"
                  ? t("bookingDetail.addNotesPlaceholder")
                  : t("bookingDetail.noNotes")
              }
              placeholderTextColor="#999"
              value={bookingDetail?.note || ""}
              editable={userRole === "FreelancePT"}
              multiline
              onFocus={handleNoteFocus}
            />
          </View>
        </View>
        {userRole === "Customer" && (
          <View style={styles.controlsContainer}>
            {sessionState === "not-started" && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleStartSession}
              >
                <Ionicons
                  name="play-circle"
                  size={24}
                  color="#FFFFFF"
                  style={styles.buttonIcon}
                />
                <Text style={styles.actionButtonText}>
                  {t("bookingDetail.startSession", "Start Session")}
                </Text>
              </TouchableOpacity>
            )}

            {sessionState === "in-progress" && (
              <TouchableOpacity
                style={[styles.actionButton, styles.endSessionButton]}
                onPress={handleEndSession}
              >
                <Ionicons
                  name="stop-circle"
                  size={24}
                  color="#FFFFFF"
                  style={styles.buttonIcon}
                />
                <Text style={styles.actionButtonText}>
                  {t("bookingDetail.endSession", "End Session")}
                </Text>
              </TouchableOpacity>
            )}

            {sessionState === "completed" && (
              <View style={[styles.actionButton, styles.completedButton]}>
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color="#FFFFFF"
                  style={styles.buttonIcon}
                />
                <Text style={styles.actionButtonText}>
                  {t("bookingDetail.sessionCompleted", "Completed")}
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  actionButton: {
    backgroundColor: colors.orange,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  endSessionButton: {
    backgroundColor: "#DC2626",
    shadowColor: "#DC2626",
  },
  completedButton: {
    backgroundColor: "#4CAF50",
    shadowColor: "#4CAF50",
    opacity: 0.8,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  buttonIcon: {
    marginRight: 4,
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    margin: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  customerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  bookingCard: {
    marginTop: 16,
    backgroundColor: "#FFF8F0",
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
    borderColor: "#FFE5CC",
  },
  bookingHeader: {
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: "#FFE5CC",
  },
  bookingHeaderTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.orange,
    marginLeft: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sessionStatusBadge: {
    backgroundColor: colors.orange,
    color: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    overflow: "hidden",
  },
  bookingInfoRow: {
    flexDirection: "row",
  },
  bookingAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFE5CC",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
    borderWidth: 3,
    borderColor: colors.orange,
    overflow: "hidden",
  },
  bookingDetails: {
    flex: 1,
    justifyContent: "center",
    gap: 8,
  },
  bookingName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 6,
    textTransform: "capitalize",
  },
  bookingDetailText: {
    fontSize: 14,
    color: "#4A5568",
    fontWeight: "600",
    lineHeight: 20,
  },
  customerHeader: {
    justifyContent: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  customerHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginLeft: 8,
  },
  customerInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  customerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFF7ED",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    overflow: "hidden",
  },
  customerAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  customerDetails: {
    flex: 1,
    justifyContent: "center",
    gap: 6,
  },
  customerSubtitle: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  customerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  customerDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  customerDetailText: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
  },
  customerStatsRow: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  customerStatItem: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  customerStatLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  customerStatValue: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "700",
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginLeft: 8,
  },
  activityTypesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  activityTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  emptyStateCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748B",
  },
  muscleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  muscleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    width: "30%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  muscleImage: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  muscleIcon: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  muscleName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E293B",
    textAlign: "center",
  },
  setCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  setCardContent: {
    flex: 1,
    padding: 14,
  },
  completedSetCard: {
    backgroundColor: "#F0F8F0",
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  setHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  setTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  setTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    flex: 1,
  },
  completedBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  setTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  setTagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  setDetailContainer: {
    flexDirection: "row",
    gap: 16,
  },
  setDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  setDetailText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "600",
  },
  activityCardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  activityThumbWrapper: {
    width: 64,
    height: 64,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  activityThumbImage: {
    width: "100%",
    height: "100%",
  },
  activityThumbFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  activityThumbStatus: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
  },
  activityInfo: {
    flex: 1,
    gap: 6,
  },
  activityTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  activityAssetText: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  activityChipsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activityTypeChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  activityTypeChipText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#111827",
    textTransform: "uppercase",
  },
  activityStatsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  activityStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  activityStatText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  activityCompletedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF3",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  activityCompletedText: {
    fontSize: 11,
    color: "#166534",
    fontWeight: "600",
  },
  activityMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  assetTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
  },
  assetTypeEquipment: {
    backgroundColor: "#4F46E5",
  },
  assetTypeNoneEquipment: {
    backgroundColor: "#64748B",
  },
  assetTypeText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  setSubtitle: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 2,
  },
  emptySetContainer: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
  },
  emptySetText: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 12,
    fontWeight: "600",
  },
  emptySetHint: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 8,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: colors.orange,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 12,
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    gap: 8,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  noteBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    minHeight: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  noteInput: {
    fontSize: 14,
    color: "#1E293B",
    lineHeight: 22,
  },
  editButton: {
    padding: 0,
    marginRight: 8,
  },
});
