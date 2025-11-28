import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import * as ImagePicker from "expo-image-picker";
import accountService from "../../../services/accountService";
import { useTranslation } from "../../../hooks/useTranslation";
import { formatNumber, formatDate, formatDateForAPI } from "../../../lib";
import { useUser } from "../../../context/UserContext";

const GymPTMyProfile = () => {
  const { t } = useTranslation();
  const { avatarUrl } = useUser();
  const [userId, setUserId] = useState("");
  const [userProfile, setUserProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    weight: 0,
    height: 0,
    gender: "",
    avatarUrl: "",
    isActive: "",
    frontCitizenIdUrl: "",
    backCitizenIdUrl: "",
    citizenIdNumber: "",
    identityCardPlace: "",
    citizenCardPermanentAddress: "",
    identityCardDate: "",
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showIdentityDatePicker, setShowIdentityDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [displayDate, setDisplayDate] = useState("");
  const [displayIdentityDate, setDisplayIdentityDate] = useState("");

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    return formatDate(dateString);
  };

  const formatAPIDate = (date) => {
    return formatDateForAPI(date);
  };

  const calculateBMI = (weight, height) => {
    const numWeight = parseFloat(weight);
    const numHeight = parseFloat(height);
    if (!numWeight || !numHeight || numWeight <= 0 || numHeight <= 0)
      return null;
    const heightInMeters = numHeight / 100;
    return formatNumber(
      parseFloat((numWeight / (heightInMeters * heightInMeters)).toFixed(1))
    );
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return "";
    const numBmi =
      typeof bmi === "string"
        ? parseFloat(bmi.replace(",", "."))
        : parseFloat(bmi);
    if (isNaN(numBmi)) return "";
    if (numBmi < 18.5) return t("profile.bmiCategories.underweight");
    if (numBmi < 25) return t("profile.bmiCategories.normal");
    if (numBmi < 30) return t("profile.bmiCategories.overweight");
    return t("profile.bmiCategories.obese");
  };

  const getBMIColor = (bmi) => {
    if (!bmi) return "#666";
    const numBmi =
      typeof bmi === "string"
        ? parseFloat(bmi.replace(",", "."))
        : parseFloat(bmi);
    if (isNaN(numBmi)) return "#666";
    if (numBmi < 18.5) return "#2196F3";
    if (numBmi < 25) return "#4CAF50";
    if (numBmi < 30) return "#FF9800";
    return "#F44336";
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  useEffect(() => {
    if (userProfile.dob) {
      setDisplayDate(formatDisplayDate(userProfile.dob));
    }
  }, [userProfile.dob]);

  useEffect(() => {
    if (userProfile.identityCardDate) {
      setDisplayIdentityDate(formatDisplayDate(userProfile.identityCardDate));
    }
  }, [userProfile.identityCardDate]);

  const openDatePicker = () => {
    if (isEditMode) {
      setShowDatePicker(true);
    }
  };

  const openIdentityDatePicker = () => {
    if (isEditMode) {
      setShowIdentityDatePicker(true);
    }
  };

  const handleDateConfirm = (selectedDate) => {
    setShowDatePicker(false);
    const newDateString = formatAPIDate(selectedDate);
    setUserProfile({
      ...userProfile,
      dob: newDateString,
    });
  };

  const handleIdentityDateConfirm = (selectedDate) => {
    setShowIdentityDatePicker(false);
    const newDateString = formatAPIDate(selectedDate);
    setUserProfile({
      ...userProfile,
      identityCardDate: newDateString,
    });
  };

  const handleDateCancel = () => {
    setShowDatePicker(false);
  };

  const handleIdentityDateCancel = () => {
    setShowIdentityDatePicker(false);
  };

  const genderOptions = [
    { label: t("profile.genderOptions.male"), value: "Male" },
    { label: t("profile.genderOptions.female"), value: "Female" },
  ];

  const getGenderLabel = (value) => {
    const option = genderOptions.find((opt) => opt.value === value);
    return option ? option.label : t("profile.selectGender");
  };

  const calculateAge = (dob) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const fetchProfileData = async () => {
    try {
      const response = await accountService.getProfile();
      console.log("Profile response:", response);
      setUserProfile(response.data);
      if (response.data.id) {
        setUserId(response.data.id);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      Alert.alert(t("profile.profileError"), t("profile.fetchProfileError"));
    }
  };

  const pickImage = async (type) => {
    if (!isEditMode) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        t("profile.permissionDenied"),
        t("profile.permissionMessage")
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === "avatar" ? [1, 1] : [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      // Update the appropriate field
      if (type === "avatar") {
        setUserProfile({ ...userProfile, avatarUrl: result.assets[0].uri });
      } else if (type === "frontCitizenId") {
        setUserProfile({
          ...userProfile,
          frontCitizenIdUrl: result.assets[0].uri,
        });
      } else if (type === "backCitizenId") {
        setUserProfile({
          ...userProfile,
          backCitizenIdUrl: result.assets[0].uri,
        });
      }
    }
  };

  const handleUpdateProfile = async () => {
    if (!isEditMode) {
      setIsEditMode(true);
      return;
    }

    try {
      const updateData = {
        fullName: userProfile.fullName,
        isMale: userProfile.gender === "Female" ? false : true,
        dob: userProfile.dob,
        citizenIdNumber: userProfile.citizenIdNumber || null,
        identityCardPlace: userProfile.identityCardPlace || null,
        citizenCardPermanentAddress:
          userProfile.citizenCardPermanentAddress || null,
        identityCardDate: userProfile.identityCardDate || null,
        userDetail: {
          height: parseFloat(userProfile.height) || 0,
          weight: parseFloat(userProfile.weight) || 0,
        },
        // Note: Image uploads would typically be handled separately
        // frontCitizenIdUrl and backCitizenIdUrl would need multipart/form-data upload
      };

      const response = await accountService.updateProfileUser(
        userId,
        updateData
      );
      console.log("Update profile response:", response);
      if (global.updateNavigationUser) {
        global.updateNavigationUser();
      }
      if (response.status === "200") {
        Alert.alert(
          t("profile.updateSuccess"),
          t("profile.updateProfileSuccess")
        );
        fetchProfileData();
        setIsEditMode(false);
      } else {
        Alert.alert(
          t("profile.profileError"),
          response.message || t("profile.updateProfileError")
        );
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert(t("profile.profileError"), t("profile.updateProfileError"));
    }
  };

  const cancelEditMode = () => {
    setIsEditMode(false);
    fetchProfileData();
  };

  const bmi = calculateBMI(
    parseFloat(userProfile.weight),
    parseFloat(userProfile.height)
  );
  const bmiCategory = getBMICategory(bmi);
  const bmiColor = getBMIColor(bmi);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section with Gradient */}
        <LinearGradient
          colors={["#FF914D", "#ED2A46"]}
          style={styles.gradientContainer}
        >
          <View style={styles.profileHeader}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={() => pickImage("avatar")}
              disabled={!isEditMode}
            >
              <Image
                source={{
                  uri: userProfile.avatarUrl || avatarUrl,
                }}
                style={styles.avatar}
              />
              {isEditMode && (
                <View style={styles.avatarEditBadge}>
                  <MaterialCommunityIcons
                    name="camera"
                    size={16}
                    color="#fff"
                  />
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.name}>{userProfile.fullName}</Text>
            <Text style={styles.email}>{userProfile.email}</Text>

            <View style={styles.basicInfoContainer}>
              <View style={styles.basicInfoItem}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={18}
                  color="#FFD700"
                />
                <Text style={styles.basicInfoText}>
                  {calculateAge(userProfile.dob)} {t("profile.yearsOld")}
                </Text>
              </View>
              <View style={styles.basicInfoItem}>
                <MaterialCommunityIcons
                  name="cake-variant"
                  size={18}
                  color="#FFD700"
                />
                <Text style={styles.basicInfoText}>{displayDate}</Text>
              </View>
              {userProfile.gender && (
                <View style={styles.basicInfoItem}>
                  <MaterialCommunityIcons
                    name="gender-male-female"
                    size={18}
                    color="#FFD700"
                  />
                  <Text style={styles.basicInfoText}>
                    {getGenderLabel(userProfile.gender)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="weight-kilogram"
              size={24}
              color="#FF914D"
            />
            <Text style={styles.statValue}>{userProfile.weight}</Text>
            <Text style={styles.statLabel}>{t("profile.units.kg")}</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons
              name="human-male-height"
              size={24}
              color="#FF914D"
            />
            <Text style={styles.statValue}>{userProfile.height}</Text>
            <Text style={styles.statLabel}>{t("profile.units.cm")}</Text>
          </View>

          {bmi && (
            <View style={styles.statCard}>
              <MaterialCommunityIcons
                name="heart-pulse"
                size={24}
                color={bmiColor}
              />
              <Text style={[styles.statValue, { color: bmiColor }]}>{bmi}</Text>
              <Text style={styles.statLabel}>BMI</Text>
            </View>
          )}
        </View>

        {/* Personal Information Form */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("profile.personalInfo")}</Text>
            <TouchableOpacity
              style={styles.editToggle}
              onPress={() =>
                isEditMode ? cancelEditMode() : setIsEditMode(true)
              }
            >
              <MaterialCommunityIcons
                name={isEditMode ? "close" : "pencil"}
                size={20}
                color={isEditMode ? "#f44336" : "#FF914D"}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <MaterialCommunityIcons
                  name="account"
                  size={16}
                  color="#FF914D"
                />{" "}
                {t("profile.fullName")}
              </Text>
              <TextInput
                style={[styles.textInput, styles.disabledInput]}
                value={userProfile.fullName}
                editable={false}
                placeholder={t("profile.enterFullName")}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <MaterialCommunityIcons
                  name="email"
                  size={16}
                  color="#FF914D"
                />{" "}
                {t("email")}
              </Text>
              <TextInput
                style={[styles.textInput, styles.disabledInput]}
                value={userProfile.email}
                editable={false}
                placeholder={t("email")}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <MaterialCommunityIcons
                  name="phone"
                  size={16}
                  color="#FF914D"
                />{" "}
                {t("profile.phoneNumber")}
              </Text>
              <TextInput
                style={[styles.textInput, styles.disabledInput]}
                value={userProfile.phone}
                editable={false}
                placeholder={t("profile.phoneNumber")}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={16}
                  color="#FF914D"
                />{" "}
                {t("profile.dateOfBirth")}
              </Text>
              <TouchableOpacity onPress={openDatePicker} disabled={!isEditMode}>
                <View
                  style={[
                    styles.dateInput,
                    !isEditMode && styles.disabledInput,
                  ]}
                >
                  <Text
                    style={[
                      styles.dateText,
                      !displayDate && styles.placeholderText,
                    ]}
                  >
                    {displayDate || t("profile.selectDateOfBirth")}
                  </Text>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={20}
                    color={isEditMode ? "#FF914D" : "#999"}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.inputRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>
                  <MaterialCommunityIcons
                    name="weight-kilogram"
                    size={16}
                    color="#FF914D"
                  />{" "}
                  {t("profile.weight")}
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    !isEditMode && styles.disabledInput,
                  ]}
                  value={userProfile.weight?.toString()}
                  onChangeText={(text) =>
                    setUserProfile({ ...userProfile, weight: text })
                  }
                  placeholder="0"
                  keyboardType="numeric"
                  editable={isEditMode}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>
                  <MaterialCommunityIcons
                    name="human-male-height"
                    size={16}
                    color="#FF914D"
                  />{" "}
                  {t("profile.height")}
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    !isEditMode && styles.disabledInput,
                  ]}
                  value={userProfile.height?.toString()}
                  onChangeText={(text) =>
                    setUserProfile({ ...userProfile, height: text })
                  }
                  placeholder="0"
                  keyboardType="numeric"
                  editable={isEditMode}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <MaterialCommunityIcons
                  name="gender-male-female"
                  size={16}
                  color="#FF914D"
                />{" "}
                {t("profile.gender")}
              </Text>
              <TouchableOpacity
                onPress={() => isEditMode && setShowGenderPicker(true)}
                disabled={!isEditMode}
              >
                <View
                  style={[
                    styles.dateInput,
                    !isEditMode && styles.disabledInput,
                  ]}
                >
                  <Text
                    style={[
                      styles.dateText,
                      !userProfile.gender && styles.placeholderText,
                    ]}
                  >
                    {getGenderLabel(userProfile.gender)}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={20}
                    color={isEditMode ? "#FF914D" : "#999"}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Identity Information Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t("profile.identityInformation")}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <MaterialCommunityIcons
                  name="card-account-details"
                  size={16}
                  color="#FF914D"
                />{" "}
                {t("profile.citizenIdNumber")}
              </Text>
              <TextInput
                style={[styles.textInput, !isEditMode && styles.disabledInput]}
                value={userProfile.citizenIdNumber}
                onChangeText={(text) =>
                  setUserProfile({ ...userProfile, citizenIdNumber: text })
                }
                placeholder={t("profile.enterCitizenIdNumber")}
                editable={isEditMode}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={16}
                  color="#FF914D"
                />{" "}
                {t("profile.identityCardPlace")}
              </Text>
              <TextInput
                style={[styles.textInput, styles.disabledInput]}
                value={userProfile.identityCardPlace}
                editable={false}
                placeholder={t("profile.enterIdentityCardPlace")}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <MaterialCommunityIcons
                  name="home-city"
                  size={16}
                  color="#FF914D"
                />{" "}
                {t("profile.permanentAddress")}
              </Text>
              <TextInput
                style={[styles.textInput, !isEditMode && styles.disabledInput]}
                value={userProfile.citizenCardPermanentAddress}
                onChangeText={(text) =>
                  setUserProfile({
                    ...userProfile,
                    citizenCardPermanentAddress: text,
                  })
                }
                placeholder={t("profile.enterPermanentAddress")}
                editable={isEditMode}
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <MaterialCommunityIcons
                  name="calendar-check"
                  size={16}
                  color="#FF914D"
                />{" "}
                {t("profile.identityCardDate")}
              </Text>
              <TouchableOpacity
                onPress={openIdentityDatePicker}
                disabled={!isEditMode}
              >
                <View
                  style={[
                    styles.dateInput,
                    !isEditMode && styles.disabledInput,
                  ]}
                >
                  <Text
                    style={[
                      styles.dateText,
                      !displayIdentityDate && styles.placeholderText,
                    ]}
                  >
                    {displayIdentityDate || t("profile.selectIdentityCardDate")}
                  </Text>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={20}
                    color={isEditMode ? "#FF914D" : "#999"}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* Citizen ID Images */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                <MaterialCommunityIcons
                  name="card-account-details-outline"
                  size={16}
                  color="#FF914D"
                />{" "}
                {t("profile.citizenIdImages")}
              </Text>
              <View style={styles.idImagesContainer}>
                <TouchableOpacity
                  style={styles.idImageCard}
                  onPress={() => pickImage("frontCitizenId")}
                  disabled={!isEditMode}
                >
                  {userProfile.frontCitizenIdUrl ? (
                    <Image
                      source={{ uri: userProfile.frontCitizenIdUrl }}
                      style={styles.idImage}
                    />
                  ) : (
                    <View style={styles.idImagePlaceholder}>
                      <MaterialCommunityIcons
                        name="image-plus"
                        size={32}
                        color="#ccc"
                      />
                      <Text style={styles.idImageText}>
                        {t("profile.frontCitizenId")}
                      </Text>
                    </View>
                  )}
                  {isEditMode && (
                    <View style={styles.idEditBadge}>
                      <MaterialCommunityIcons
                        name="camera"
                        size={12}
                        color="#fff"
                      />
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.idImageCard}
                  onPress={() => pickImage("backCitizenId")}
                  disabled={!isEditMode}
                >
                  {userProfile.backCitizenIdUrl ? (
                    <Image
                      source={{ uri: userProfile.backCitizenIdUrl }}
                      style={styles.idImage}
                    />
                  ) : (
                    <View style={styles.idImagePlaceholder}>
                      <MaterialCommunityIcons
                        name="image-plus"
                        size={32}
                        color="#ccc"
                      />
                      <Text style={styles.idImageText}>
                        {t("profile.backCitizenId")}
                      </Text>
                    </View>
                  )}
                  {isEditMode && (
                    <View style={styles.idEditBadge}>
                      <MaterialCommunityIcons
                        name="camera"
                        size={12}
                        color="#fff"
                      />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {isEditMode && (
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleUpdateProfile}
            >
              <MaterialCommunityIcons
                name="content-save"
                size={20}
                color="#fff"
              />
              <Text style={styles.saveButtonText}>
                {t("profile.saveChanges")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={cancelEditMode}
            >
              <MaterialCommunityIcons name="close" size={20} color="#f44336" />
              <Text style={styles.cancelButtonText}>{t("profile.cancel")}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Gender Picker Modal */}
        <Modal
          visible={showGenderPicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
                  <Text style={styles.pickerCancel}>{t("profile.cancel")}</Text>
                </TouchableOpacity>
                <Text style={styles.pickerTitle}>
                  {t("profile.selectGender")}
                </Text>
                <TouchableOpacity onPress={() => setShowGenderPicker(false)}>
                  <Text style={styles.pickerDone}>{t("profile.done")}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.pickerOptions}>
                {genderOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.pickerOption,
                      userProfile.gender === option.value &&
                        styles.selectedOption,
                    ]}
                    onPress={() => {
                      setUserProfile({ ...userProfile, gender: option.value });
                      setShowGenderPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerOptionText,
                        userProfile.gender === option.value &&
                          styles.selectedOptionText,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {userProfile.gender === option.value && (
                      <MaterialCommunityIcons
                        name="check"
                        size={20}
                        color="#FF914D"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>

      {/* Date Picker Modal */}
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={handleDateCancel}
        date={userProfile.dob ? new Date(userProfile.dob) : new Date()}
        maximumDate={new Date()}
        minimumDate={new Date(1924, 0, 1)}
        confirmTextIOS={t("common.confirm")}
        cancelTextIOS={t("common.cancel")}
        headerTextIOS={t("profile.selectDateOfBirth")}
        display="spinner"
        isDarkModeEnabled={false}
        buttonTextColorIOS="#FF914D"
        textColor="#1A191A"
      />

      {/* Identity Card Date Picker Modal */}
      <DateTimePickerModal
        isVisible={showIdentityDatePicker}
        mode="date"
        onConfirm={handleIdentityDateConfirm}
        onCancel={handleIdentityDateCancel}
        date={
          userProfile.identityCardDate
            ? new Date(userProfile.identityCardDate)
            : new Date()
        }
        maximumDate={new Date()}
        minimumDate={new Date(1924, 0, 1)}
        confirmTextIOS={t("common.confirm")}
        cancelTextIOS={t("common.cancel")}
        headerTextIOS={t("profile.selectIdentityCardDate")}
        display="spinner"
        isDarkModeEnabled={false}
        buttonTextColorIOS="#FF914D"
        textColor="#1A191A"
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flex: 1,
  },
  gradientContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileHeader: {
    alignItems: "center",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarEditBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FF914D",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  name: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  email: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 16,
    marginBottom: 16,
  },
  basicInfoContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  basicInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  basicInfoText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 20,
    marginTop: -30,
    marginBottom: 20,
    zIndex: 10,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  sectionContainer: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  editToggle: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
  },
  formContainer: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fff",
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  placeholderText: {
    color: "#999",
  },
  disabledInput: {
    backgroundColor: "#f8f9fa",
    color: "#666",
  },
  idImagesContainer: {
    flexDirection: "row",
    gap: 12,
  },
  idImageCard: {
    flex: 1,
    aspectRatio: 1.5,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    overflow: "hidden",
    position: "relative",
  },
  idImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  idImagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  idImageText: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  idEditBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#FF914D",
    borderRadius: 16,
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  actionContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  saveButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#f44336",
    gap: 8,
  },
  cancelButtonText: {
    color: "#f44336",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  pickerModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    maxHeight: "50%",
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  pickerCancel: {
    color: "#666",
    fontSize: 16,
  },
  pickerDone: {
    color: "#FF914D",
    fontSize: 16,
    fontWeight: "600",
  },
  pickerOptions: {
    paddingHorizontal: 16,
  },
  pickerOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedOption: {
    backgroundColor: "#fff5f6",
  },
  pickerOptionText: {
    fontSize: 16,
    color: "#333",
  },
  selectedOptionText: {
    color: "#FF914D",
    fontWeight: "600",
  },
});

export default GymPTMyProfile;
