import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import contractService from "../../../services/contractService";
import { useTranslation } from "../../../hooks/useTranslation";
import { fetchUserFromStorage } from "../../../lib";
import LoadingIndicator from "../../../components/LoadingIndicator";

const ContractScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const user = await fetchUserFromStorage();
      if (!user?.id) {
        console.log("No user found, skipping contract fetch");
        setLoading(false);
        return;
      }
      const response = await contractService.getContractForCustomer(user.id);
      if (response?.data?.items) {
        setContracts(response.data.items);
      }
    } catch (error) {
      console.error("Error fetching contracts:", error);
      Alert.alert(t("contract.error"), t("contract.fetchError"));
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchContracts();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Created":
        return "#F59E0B"; // Orange
      case "CompanySigned":
        return "#3B82F6"; // Blue
      case "CustomerSigned":
        return "#8B5CF6"; // Purple
      case "BothSigned":
        return "#10B981"; // Green
      case "Finished":
        return "#6B7280"; // Gray
      default:
        return "#6B7280"; // Gray
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Created":
        return t("contract.statusCreated");
      case "CompanySigned":
        return t("contract.statusCompanySigned");
      case "CustomerSigned":
        return t("contract.statusCustomerSigned");
      case "BothSigned":
        return t("contract.statusBothSigned");
      case "Finished":
        return t("contract.statusFinished");
      default:
        return status;
    }
  };

  const getContractTypeText = (type) => {
    return type === "GymOwner"
      ? t("contract.typeGymOwner")
      : t("contract.typeFreelancePT");
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const renderContractItem = ({ item }) => (
    <TouchableOpacity
      style={styles.contractCard}
      onPress={() =>
        navigation.navigate("ContractDetailScreen", { contractId: item.id })
      }
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.typeContainer}>
          <Ionicons
            name={item.contractType === "GymOwner" ? "barbell" : "person"}
            size={20}
            color="#007AFF"
          />
          <Text style={styles.typeText}>
            {getContractTypeText(item.contractType)}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.contractStatus) },
          ]}
        >
          <Text style={styles.statusText}>
            {getStatusText(item.contractStatus)}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.contractId} numberOfLines={1}>
          {t("contract.id")}: {item.id.substring(0, 20)}...
        </Text>
        <Text style={styles.fullName}>{item.fullName}</Text>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            {formatDate(item.startDate)} - {formatDate(item.endDate)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText}>{item.phoneNumber}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="trending-up-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            {t("contract.commission")}: {item.commissionPercentage}%
          </Text>
        </View>

        {item.contractStatus === "CompanySigned" &&
          !item.customerSignatureUrl && (
            <View style={styles.actionNeeded}>
              <Ionicons name="alert-circle" size={16} color="#F59E0B" />
              <Text style={styles.actionText}>
                {t("contract.needsSignature")}
              </Text>
            </View>
          )}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.createdAt}>
          {t("contract.createdAt")}: {formatDate(item.createdAt)}
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={80} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>{t("contract.noContracts")}</Text>
      <Text style={styles.emptySubtitle}>{t("contract.noContractsDesc")}</Text>
    </View>
  );

  if (loading) {
    return (
      <LoadingIndicator variant="page" color="#007AFF" message={t("loading")} />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={contracts}
        renderItem={renderContractItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#007AFF"]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  contractCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  typeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  cardBody: {
    gap: 8,
  },
  contractId: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "monospace",
  },
  fullName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#6B7280",
  },
  actionNeeded: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#D97706",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  createdAt: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
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
    color: "#374151",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});

export default ContractScreen;
