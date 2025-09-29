import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import gymService from "../../services/gymService";
import { useCart } from "../../context/CartContext";
import colors from "../../constants/color";
import { useTranslation } from "../../hooks/useTranslation";
import PTCard from "../../components/PTCard/PTCard";

export default function PTinCourseScreen({ route }) {
  const { t } = useTranslation();
  const { gymPackage } = route.params;
  const [pt, setPT] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");

  const { cart, addToCart, getCartCount } = useCart();

  useEffect(() => {
    const fetchPT = async () => {
      try {
        setLoading(true);
        const response = await gymService.getPTinGymCourse(gymPackage.id);
        console.log("PT in Course response:", response.data);
        const { items } = response.data;
        setPT(items);
      } catch (error) {
        console.error("Error fetching PT:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPT();
  }, []);

  const handleAddToCart = async (selectedPT) => {
    // if (getCartCount() > 0) {
    //   Alert.alert(
    //     t("ptCourse.cartHasPackage"),
    //     t("ptCourse.viewCartQuestion"),
    //     [
    //       {
    //         text: t("ptCourse.no"),
    //         style: "cancel",
    //       },
    //       {
    //         text: t("ptCourse.viewCart"),
    //         onPress: () => navigation.navigate("CartScreen"),
    //       },
    //     ]
    //   );
    //   return;
    // } else {
    const cartItem = {
      ...gymPackage,
      pt:
        gymPackage.type === "WithPt"
          ? {
              id: selectedPT.id,
              fullName: selectedPT.fullName,
              avatar: selectedPT.avatarUrl,
              gender: selectedPT.gender,
              goalTraining: selectedPT.goalTraining,
            }
          : null,
    };

    addToCart(cartItem);

    let successMessage = "";
    if (gymPackage.type === "Normal") {
      successMessage = t("ptCourse.addedNormalPackage", {
        packageName: gymPackage.name,
        gymName: gymPackage.gymName,
      });
    } else if (gymPackage.type === "WithPt") {
      successMessage = t("ptCourse.addedPTPackage", {
        packageName: gymPackage.name,
        ptName: selectedPT?.fullName,
        gymName: gymPackage.gymName,
      });
    }

    Alert.alert(t("ptCourse.notification"), successMessage, [
      { text: t("ptCourse.ok") },
    ]);
    navigation.goBack();
    // }
  };

  const filteredPT = pt.filter((item) =>
    item.fullName.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderPTCard = (item) => (
    <PTCard
      key={item.id}
      item={item}
      showButtons={true}
      onDetailPress={() => {
        navigation.navigate("PTProfileScreen", {
          ptId: item.id,
        });
      }}
      onSelectPress={() => handleAddToCart(item)}
      detailButtonText={t("ptCourse.details")}
      selectButtonText={t("ptCourse.selectPT")}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Foundation name="torsos-all" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>{t("ptCourse.noPTAvailable")}</Text>
      <Text style={styles.emptySubtitle}>{t("ptCourse.noPTForPackage")}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

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
              placeholder={t("ptScreen.searchPlaceholder")}
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
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{t("ptScreen.loading")}</Text>
            </View>
          ) : filteredPT.length > 0 ? (
            filteredPT.map(renderPTCard)
          ) : (
            renderEmptyState()
          )}
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  clearButton: {
    padding: 4,
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
});
