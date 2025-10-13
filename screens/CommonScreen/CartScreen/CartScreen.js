import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import React, { useState, useMemo, useRef, useEffect } from "react";
import CartCard from "../../../components/CartCard/CartCard";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { useNavigation } from "@react-navigation/native";
import { useCart } from "../../../context/CartContext"; // Import the cart context
import { SafeAreaView } from "react-native-safe-area-context";
import { showConfirmAlert, showAlert, formatPrice } from "../../../lib";
import { useTranslation } from "../../../hooks/useTranslation";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function CartScreen() {
  const navigation = useNavigation();
  const { cart, removeFromCart, getTotalPrice, clearCart, updateQuantity } =
    useCart(); // Use the cart context
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("gym"); // gym, freelance, product
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  console.log("Cart items:", cart);

  // Map tab keys to indices
  const tabIndices = { gym: 0, freelance: 1, product: 2 };

  // Animate when tab changes
  useEffect(() => {
    const toValue = tabIndices[activeTab];
    
    // Fade out and slide
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Fade back in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  }, [activeTab]);

  // Filter cart items by type
  const filteredCart = useMemo(() => {
    if (!cart || cart.length === 0) return [];
    
    return cart.filter((item) => {
      if (activeTab === "gym") {
        // Gym courses: items with gymId but not freelance PT (no pt or type !== "WithPt")
        return item.gymName;
      } else if (activeTab === "freelance") {
        // Freelance PT courses: items with pt and type "WithPt"
        return item
      } else if (activeTab === "product") {
        // Products: items without gymId (future implementation)
        return item
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
      if (item.gymId && (!item.pt || item.type !== "WithPt")) {
        counts.gym++;
      } else if (item.pt && item.type === "WithPt") {
        counts.freelance++;
      } else if (!item.gymId && item.productId) {
        counts.product++;
      }
    });

    return counts;
  }, [cart]);

  // Calculate total price for active tab
  const tabTotalPrice = useMemo(() => {
    return filteredCart.reduce(
      (total, item) => total + item.price * (item.quantity || 1),
      0
    );
  }, [filteredCart]);

  // Function to handle quantity change
  const handleQuantityChange = (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(cartItemId);
      return;
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
    if (filteredCart.length === 0) {
      showAlert(t("cart.emptyCart"), t("cart.addPackageBeforePayment"));
      return;
    }
    navigation.navigate("PaymentScreen", { total: tabTotalPrice, items: filteredCart });
  };

  // Render tab button
  const renderTabButton = (tabKey, label, count) => {
    const isActive = activeTab === tabKey;
    return (
      <TouchableOpacity
        style={[styles.tabButton, isActive && styles.activeTabButton]}
        onPress={() => setActiveTab(tabKey)}
      >
        <Text style={[styles.tabText, isActive && styles.activeTabText]}>
          {label}
        </Text>
        {count > 0 && (
          <View style={[styles.badge, isActive && styles.activeBadge]}>
            <Text style={[styles.badgeText, isActive && styles.activeBadgeText]}>
              {count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.cartScreen}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {renderTabButton("gym", t("cart.gymCourses") || "Gym Courses", tabCounts.gym)}
        {renderTabButton("freelance", t("cart.freelancePTCourses") || "Freelance PT Courses", tabCounts.freelance)}
        {renderTabButton("product", t("cart.products") || "Products ", tabCounts.product)}
      </View>

      {filteredCart.length > 0 ? (
        <>
          <Animated.View
            style={{
              flex: 1,
              opacity: fadeAnim,
              transform: [
                {
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 50, 50],
                    outputRange: [0, 0, 0],
                    extrapolate: "clamp",
                  }),
                },
              ],
            }}
          >
            <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
              {filteredCart.map((item, index) => (
                <CartCard
                  key={item.cartItemId || index}
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
                  }}
                  onQuantityChange={(newQuantity) =>
                    handleQuantityChange(item.cartItemId, newQuantity)
                  }
                  onRemove={() => handleRemoveItem(item.cartItemId)}
                />
              ))}
            </ScrollView>
          </Animated.View>

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
        <Animated.View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            opacity: fadeAnim,
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1, 2],
                  outputRange: [0, SCREEN_WIDTH * 0.05, SCREEN_WIDTH * -0.05],
                }),
              },
            ],
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
              ? t("cart.noFreelancePTCourses") || "No freelance PT courses in cart"
              : t("cart.noProducts") || "No products in cart"}
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>{t("cart.backToHome")}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cartScreen: {
    flex: 1,
    backgroundColor: "#ffffff"
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    paddingTop: 10,
    paddingHorizontal: 10,
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10
  },
  tabButton: {
    flex: 1,
    height: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderRadius: 120,
    textAlign: "center",
    fontWeight: "bold",
    gap: 6,
    borderColor: "#ED2A46",
    borderWidth: 0.5,
    // backgroundColor:'#ED2A46',
    
    backgroundColor:'#ffffff'
  },
  activeTabButton: {
    backgroundColor:'#ED2A46',
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor:'#000',
    borderWidth: 1,
    shadowColor: "#ED2A46",
    shadowOpacity: 0.35,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    color: "#ED2A46",
  },
  activeTabText: {
    color: "#ffffff",
    fontWeight: "800",
  },
  badge: {
    backgroundColor: "#E5E5E5",
    borderRadius: 10,
    minWidth: 25,
    height: 25,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    position: "absolute",
    top: -5,
    right: -10,
  },
  activeBadge: {
    backgroundColor: "#FF914D",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#6B6B6B",
  },
  activeBadgeText: {
    color: "#FFFFFF",
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
});
