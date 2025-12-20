import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import React, { useState, useMemo, useRef, useEffect } from "react";
import Checkbox from "expo-checkbox";
import CartCard from "../../../components/CartCard/CartCard";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Image } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCart } from "../../../context/CartContext"; // Import the cart context
import { SafeAreaView } from "react-native-safe-area-context";
import { showConfirmAlert, showAlert, formatPrice } from "../../../lib";
import { useTranslation } from "../../../hooks/useTranslation";
import { fetchUserFromStorage } from "../../../lib/async/asyncUtils";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function CartScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { cart, removeFromCart, getTotalPrice, clearCart, updateQuantity } =
    useCart(); // Use the cart context
  const { t } = useTranslation();

  // State for current user (guest check)
  const [currentUser, setCurrentUser] = useState(null);

  // Set initial tab based on route params, default to gym
  const [activeTab, setActiveTab] = useState(route.params?.initialTab || "gym"); // gym, freelance, product

  // State for selected items (checkbox selection)
  const [selectedItems, setSelectedItems] = useState(new Set());

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      const user = await fetchUserFromStorage();
      setCurrentUser(user);
    };
    loadUser();
  }, []);

  // Reset selected items when switching tabs
  useEffect(() => {
    setSelectedItems(new Set());
  }, [activeTab]);

  console.log("Cart items:", cart);

  // Handle individual item selection
  const toggleItemSelection = (cartItemId) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);

      // Find the item being toggled
      const itemToToggle = cart.find((item) => item.cartItemId === cartItemId);
      const isGymCourse =
        itemToToggle && itemToToggle.gymId && !itemToToggle.selectedVariant;

      if (newSet.has(cartItemId)) {
        // Deselecting
        newSet.delete(cartItemId);
      } else {
        // Selecting
        if (isGymCourse) {
          // If selecting a gym course, deselect all other gym courses first
          cart.forEach((item) => {
            const isOtherGymCourse =
              item.gymId &&
              !item.selectedVariant &&
              item.cartItemId !== cartItemId;
            if (isOtherGymCourse) {
              newSet.delete(item.cartItemId);
            }
          });
        }
        newSet.add(cartItemId);
      }
      return newSet;
    });
  };

  // Handle select all / deselect all
  const toggleSelectAll = () => {
    if (selectedItems.size === filteredCart.length && filteredCart.length > 0) {
      // Deselect all
      setSelectedItems(new Set());
    } else {
      // Select all, but for gym courses, only select the first one
      const gymCourses = filteredCart.filter(
        (item) => item.gymId && !item.selectedVariant
      );
      const nonGymItems = filteredCart.filter(
        (item) => !(item.gymId && !item.selectedVariant)
      );

      const allIds = new Set();

      // Add all non-gym items
      nonGymItems.forEach((item) => allIds.add(item.cartItemId));

      // For gym courses, only add the first one
      if (gymCourses.length > 0) {
        allIds.add(gymCourses[0].cartItemId);
      }

      setSelectedItems(allIds);
    }
  };

  // Map tab keys to indices
  const tabIndices = { gym: 0, freelance: 1, product: 2 };

  // Animations removed: content will render statically when tab changes

  // Filter cart items by type
  const filteredCart = useMemo(() => {
    if (!cart || cart.length === 0) return [];

    return cart.filter((item) => {
      if (activeTab === "gym") {
        // Gym courses: items with gymId
        return item.gymId && !item.selectedVariant;
      } else if (activeTab === "freelance") {
        // Freelance PT courses: items with pt and type "WithPt"
        return item.pt && item.type === "WithPt";
      } else if (activeTab === "product") {
        // Products: items with selectedVariant (product structure)
        return item.selectedVariant && !item.gymId;
      }
      return false;
    });
  }, [cart, activeTab]);

  // Get counts for each tab
  const tabCounts = useMemo(() => {
    const counts = {
      gym: 0,
      freelance: 0,
      product: 0,
    };

    cart.forEach((item) => {
      if (item.gymName && !item.selectedVariant) {
        counts.gym++;
      } else if (item.pt && item.type === "WithPt") {
        counts.freelance++;
      } else if (item.selectedVariant && !item.gymId) {
        counts.product++;
      }
    });

    return counts;
  }, [cart]);

  // Calculate total price for selected items in active tab
  const tabTotalPrice = useMemo(() => {
    return filteredCart
      .filter((item) => selectedItems.has(item.cartItemId))
      .reduce((total, item) => {
        // For products, use selectedVariant price if available
        const itemPrice =
          item.selectedVariant?.salePrice || item.price || item.salePrice;
        return total + itemPrice * (item.quantity || 1);
      }, 0);
  }, [filteredCart, selectedItems]);

  // Function to handle quantity change
  const handleQuantityChange = (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(cartItemId);
      return;
    }

    // Find the cart item to check if it's a gym course
    const cartItem = cart.find((item) => item.cartItemId === cartItemId);

    // For gym courses (items with gymId and no selectedVariant), limit quantity to 1
    if (cartItem && cartItem.gymId && !cartItem.selectedVariant) {
      if (newQuantity > 1) {
        showAlert(
          t("cart.maxQuantityReached") || "Maximum quantity reached",
          t("cart.gymCourseOneOnly") ||
            "You can only purchase 1 gym course at a time"
        );
        return;
      }
    }

    updateQuantity(cartItemId, newQuantity);
  };

  // Function to handle removing an item from cart
  const handleRemoveItem = (cartItemId) => {
    showConfirmAlert({
      title: t("cart.removePackage"),
      message: t("cart.removePackageConfirm"),
      confirmText: t("cart.remove"),
      confirmStyle: "destructive",
      onConfirm: () => removeFromCart(cartItemId),
    });
  };

  // Calculate the total price
  const totalPrice = getTotalPrice();

  // Function to handle checkout
  const handleCheckout = () => {
    // Check if user is logged in
    if (!currentUser) {
      Alert.alert(
        t("auth.loginRequired"),
        t("auth.pleaseLoginToCheckout"),
        [
          { text: t("common.cancel"), style: "cancel" },
          { 
            text: t("navigation.login"), 
            onPress: () => navigation.navigate(t("navigation.login"), { screen: "Login" })
          },
        ]
      );
      return;
    }

    if (selectedItems.size === 0) {
      showAlert(
        t("cart.noItemsSelected") || "No items selected",
        t("cart.selectItemsBeforeCheckout") ||
          "Please select items before proceeding to checkout"
      );
      return;
    }

    const selectedCartItems = filteredCart.filter((item) =>
      selectedItems.has(item.cartItemId)
    );

    navigation.navigate("PaymentScreen", {
      total: tabTotalPrice,
      items: selectedCartItems,
      selectedCartItemIds: selectedCartItems.map((item) => item.cartItemId),
    });
  };

  // Render tab button
  const renderTabButton = (tabKey, label, count) => {
    const isActive = activeTab === tabKey;
    return (
      <TouchableOpacity
        style={[styles.tabButton, isActive && styles.activeTabButton]}
        onPress={() => setActiveTab(tabKey)}
        activeOpacity={0.7}
      >
        <View style={styles.tabContent}>
          <Text style={[styles.tabText, isActive && styles.activeTabText]}>
            {label}
          </Text>
          {count > 0 && (
            <View style={[styles.badge, isActive && styles.activeBadge]}>
              <Text
                style={[styles.badgeText, isActive && styles.activeBadgeText]}
              >
                {count}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.cartScreen}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTabButton(
          "gym",
          t("cart.gymCourses") || "Gym Courses",
          tabCounts.gym
        )}
        {/* {renderTabButton(
          "freelance",
          t("cart.freelancePTCourses") || "Freelance PT Courses",
          tabCounts.freelance
        )} */}
        {renderTabButton(
          "product",
          t("cart.products") || "Products ",
          tabCounts.product
        )}
      </View>

      {filteredCart.length > 0 ? (
        <>
          {/* Select All Header - Hidden for Gym Course tab */}
          {activeTab !== "gym" && (
            <View style={styles.selectAllContainer}>
              <TouchableOpacity
                style={styles.selectAllButton}
                onPress={toggleSelectAll}
              >
                <Checkbox
                  value={
                    selectedItems.size === filteredCart.length &&
                    filteredCart.length > 0
                  }
                  onValueChange={toggleSelectAll}
                  color={
                    selectedItems.size === filteredCart.length &&
                    filteredCart.length > 0
                      ? "#ED2A46"
                      : undefined
                  }
                  style={styles.checkbox}
                />
                <Text style={styles.selectAllText}>
                  {selectedItems.size === filteredCart.length &&
                  filteredCart.length > 0
                    ? t("cart.deselectAll") || "Deselect All"
                    : t("cart.selectAll") || "Select All"}
                </Text>
              </TouchableOpacity>
              <Text style={styles.selectedCountText}>
                {selectedItems.size} / {filteredCart.length}{" "}
                {t("cart.selected") || "selected"}
              </Text>
            </View>
          )}

          <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
              {filteredCart.map((item, index) => {
                // Render product items differently from gym/PT courses
                if (activeTab === "product") {
                  const variantImage = item.selectedVariant?.imageUrl;
                  const productImage = item.imageUrl;
                  const displayImage =
                    variantImage && variantImage !== null
                      ? variantImage
                      : productImage;

                  return (
                    <View
                      key={item.cartItemId || index}
                      style={styles.productCartItem}
                    >
                      <Checkbox
                        value={selectedItems.has(item.cartItemId)}
                        onValueChange={() =>
                          toggleItemSelection(item.cartItemId)
                        }
                        color={
                          selectedItems.has(item.cartItemId)
                            ? "#ED2A46"
                            : undefined
                        }
                        style={styles.productCheckbox}
                      />
                      <Image
                        source={{ uri: displayImage }}
                        style={styles.productCartImage}
                        resizeMode="cover"
                      />
                      <View style={styles.productCartInfo}>
                        <Text style={styles.productCartName} numberOfLines={2}>
                          {item.name}
                        </Text>
                        {item.selectedVariant && (
                          <Text style={styles.productCartVariant}>
                            {item.selectedVariant.weightValue}{" "}
                            {item.selectedVariant.weightUnit} -{" "}
                            {item.selectedVariant.flavourName}
                          </Text>
                        )}
                        <Text style={styles.productCartPrice}>
                          {formatPrice(
                            item.selectedVariant?.salePrice || item.salePrice
                          )}
                        </Text>

                        <View style={styles.productCartActions}>
                          <View style={styles.productQuantityControls}>
                            <TouchableOpacity
                              style={styles.productQuantityButton}
                              onPress={() =>
                                handleQuantityChange(
                                  item.cartItemId,
                                  (item.quantity || 1) - 1
                                )
                              }
                              disabled={(item.quantity || 1) <= 1}
                            >
                              <FontAwesome5
                                name="minus"
                                size={12}
                                color={
                                  (item.quantity || 1) <= 1 ? "#CCC" : "#666"
                                }
                              />
                            </TouchableOpacity>
                            <Text style={styles.productQuantityText}>
                              {item.quantity || 1}
                            </Text>
                            <TouchableOpacity
                              style={styles.productQuantityButton}
                              onPress={() => {
                                const maxQty =
                                  item.selectedVariant?.quantity || 99;
                                const currentQty = item.quantity || 1;
                                if (currentQty < maxQty) {
                                  handleQuantityChange(
                                    item.cartItemId,
                                    currentQty + 1
                                  );
                                }
                              }}
                              disabled={
                                (item.quantity || 1) >=
                                (item.selectedVariant?.quantity || 99)
                              }
                            >
                              <FontAwesome5
                                name="plus"
                                size={12}
                                color={
                                  (item.quantity || 1) >=
                                  (item.selectedVariant?.quantity || 99)
                                    ? "#CCC"
                                    : "#666"
                                }
                              />
                            </TouchableOpacity>
                          </View>

                          <TouchableOpacity
                            style={styles.productRemoveButton}
                            onPress={() => handleRemoveItem(item.cartItemId)}
                          >
                            <FontAwesome5
                              name="trash-alt"
                              size={16}
                              color="#FF4D4F"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                }

                // Render gym/PT courses using CartCard
                return (
                  <View
                    key={item.cartItemId || index}
                    style={styles.cartCardContainer}
                  >
                    <Checkbox
                      value={selectedItems.has(item.cartItemId)}
                      onValueChange={() => toggleItemSelection(item.cartItemId)}
                      color={
                        selectedItems.has(item.cartItemId)
                          ? "#ED2A46"
                          : undefined
                      }
                      style={styles.cartCardCheckbox}
                    />
                    <View style={{ flex: 1 }}>
                      <CartCard
                        product={{
                          gymId: item.gymId,
                          gymName: item.gymName,
                          rating: 5, // Default since we don't have ratings in cart items
                          address: item.gymAddress,
                          image: item?.gymImage,
                          quantity: item.quantity || 1, // Add quantity to product object
                          selectedPackage: {
                            packageId: item.id,
                            packageName: item.name,
                            packagePrice: item.price,
                            type: item.type,
                          },
                          // Include PT information if it exists
                          pt: item.pt
                            ? {
                                id: item.pt.id,
                                fullName: item.pt.fullName,
                                avatar: item.pt.avatar,
                                gender: item.pt.gender,
                                goalTraining: item.pt.goalTraining,
                              }
                            : null,
                          // Mark as gym course for quantity limit
                          isGymCourse: item.gymId && !item.selectedVariant,
                        }}
                        onQuantityChange={(newQuantity) =>
                          handleQuantityChange(item.cartItemId, newQuantity)
                        }
                        onRemove={() => handleRemoveItem(item.cartItemId)}
                      />
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.orderSummary}>
            <View style={styles.proceedContainer}>
              <View>
                <Text style={{ fontSize: 15 }}>{t("cart.totalPayment")}</Text>
                <Text
                  style={{ fontSize: 20, fontWeight: "bold", color: "#ED2A46" }}
                >
                  {formatPrice(tabTotalPrice)}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={handleCheckout}
              >
                <Text style={styles.checkoutText}>{t("cart.payment")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      ) : (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <FontAwesome5 name="shopping-cart" size={100} color="#FF914D" />
          <Text
            style={{
              fontSize: 20,
              fontWeight: "normal",
              textAlign: "center",
              marginTop: 10,
              color: "#6B6B6B",
            }}
          >
            {activeTab === "gym"
              ? t("cart.noGymCourses") || "No gym courses in cart"
              : activeTab === "freelance"
              ? t("cart.noFreelancePTCourses") ||
                "No freelance PT courses in cart"
              : t("cart.noProducts") || "No products in cart"}
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>{t("cart.backToHome")}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cartScreen: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F8F9FA",
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E5E5",
    minHeight: 50,
  },
  activeTabButton: {
    backgroundColor: "#ED2A46",
    borderColor: "#ED2A46",
    shadowColor: "#ED2A46",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    position: "relative",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666666",
    textAlign: "center",
  },
  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  badge: {
    backgroundColor: "#E5E5E5",
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    marginLeft: 4,
  },
  activeBadge: {
    backgroundColor: "#FFFFFF",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#666666",
  },
  activeBadgeText: {
    color: "#ED2A46",
  },
  button: {
    backgroundColor: "#FF914D",
    height: 50,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    width: "50%",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  orderSummary: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 40,
    borderColor: "#ccc",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    elevation: 9,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#fff",
  },
  proceedContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  checkoutButton: {
    backgroundColor: "#FF914D",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 30,
    fontWeight: "bold",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  checkoutText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  // Select all container
  selectAllContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F8F9FA",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  selectAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectAllText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  selectedCountText: {
    fontSize: 14,
    color: "#666",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
  },
  // Product cart item styles
  productCartItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
    gap: 8,
  },
  productCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
  },
  productCartImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
  },
  productCartInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  productCartName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  productCartVariant: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  productCartPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ED2A46",
    marginBottom: 8,
  },
  productCartActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productQuantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 20,
    paddingHorizontal: 4,
  },
  productQuantityButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  productQuantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginHorizontal: 12,
    minWidth: 30,
    textAlign: "center",
  },
  productRemoveButton: {
    padding: 8,
  },
  // Cart card with checkbox styles
  cartCardContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingLeft: 16,
    gap: 8,
  },
  cartCardCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    marginTop: 12,
  },
});
