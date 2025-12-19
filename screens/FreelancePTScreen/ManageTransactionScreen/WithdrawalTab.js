import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Linking,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import paymentService from "../../../services/paymentService";
import { useFocusEffect } from "@react-navigation/native";
import dashBoardService from "../../../services/dashBoardService";
import banks from "../../../constants/banks";
import SummaryCard from "../../../components/SummaryCards/SummaryCard";

const WithdrawalTab = ({
  totalRevenue,
  withdrawalAmount,
  setWithdrawalAmount,
  bankAccount,
  setBankAccount,
  bankName,
  setBankName,
  accountName,
  setAccountName,
  withdrawalHistory,
  handleWithdrawal,
  getStatusColor,
  getStatusText,
  formatAmount,
  formatDate,
  t,
  loadWithdrawalHistory,
}) => {
  const [availableBalance, setAvailableBalance] = useState(0);
  const [pendingBalance, setPendingBalance] = useState(0);
  const [validationMessage, setValidationMessage] = useState("");
  const [filteredBanks, setFilteredBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [showBankSuggestions, setShowBankSuggestions] = useState(false);
  const MIN_WITHDRAW = 50000;
  const MAX_WITHDRAW = 20000000;

  // Format currency to Vietnamese Dong
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + "₫";
  };

  const fetchWalletData = async () => {
    try {
      const response = await dashBoardService.getWalletBalance();
      setAvailableBalance(response.data.totalAvailableBalance || 0);
      setPendingBalance(response.data.totalPendingBalance || 0);
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      setAvailableBalance(0);
      setPendingBalance(0);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWalletData();
    }, [])
  );

  const summaryFinancialStats = [
    {
      id: "availableBalance",
      label: t("dashboard.availableBalance", "Số dư khả dụng"),
      value: formatCurrency(availableBalance),
      helper: t("dashboard.canWithdrawNow", "Có thể rút ngay"),
      icon: "wallet",
      accent: "#FF914D",
      variant: "wide",
      style: ''
    },
    {
      id: "pendingBalance",
      label: t("dashboard.pendingBalance", "Số dư chờ xử lý"),
      value: formatCurrency(pendingBalance),
      helper: t("dashboard.awaitingPayment", "Đang chờ thanh toán"),
      icon: "timer-outline",
      accent: "#ED2A46",
      variant: "wide",
      style: ''
    },
  ];

  const handleConfirmPayment = async (id) => {
    try {
      const response = await paymentService.confirmWithdrawal(id);
      console.log("Confirm payment response:", response);
      if (response.data) {
        Alert.alert(
          t("withdrawal.confirmPaymentSuccess", "Confirm payment success")
        );
        loadWithdrawalHistory?.();
      } else {
        Alert.alert(
          t("withdrawal.confirmPaymentFailed", "Confirm payment failed")
        );
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      Alert.alert(
        t("withdrawal.confirmPaymentFailed", "Confirm payment failed")
      );
    }
  };
  // Format amount input with thousand separators
  const formatAmountInput = (value) => {
    // Remove all non-digit characters
    const numericValue = value.replace(/\D/g, "");

    // Format with thousand separators
    if (numericValue === "") return "";

    return new Intl.NumberFormat("vi-VN").format(parseInt(numericValue));
  };

  // Handle amount change with formatting
  const handleAmountChange = (text) => {
    // Remove all non-digit characters
    const numericValue = text.replace(/\D/g, "");
    setWithdrawalAmount(numericValue);
    setValidationMessage("");
  };

  const handleBankInputChange = (text) => {
    setBankName(text);
    setSelectedBank(null);
    if (!text) {
      setFilteredBanks([]);
      return;
    }
    const query = text.toLowerCase();
    const matches = banks.filter(
      (bank) =>
        bank.name.toLowerCase().includes(query) ||
        bank.code.toLowerCase().includes(query)
    );
    setFilteredBanks(matches);
  };

  const handleSelectBank = (bank) => {
    setBankName(`${bank.name} (${bank.code})`);
    setSelectedBank(bank);
    setShowBankSuggestions(false);
  };

  const handleSubmitWithdrawal = () => {
    setValidationMessage("");
    const amountNumber = parseInt(withdrawalAmount || "0", 10);
    if (Number.isNaN(amountNumber) || amountNumber <= 0) {
      setValidationMessage(
        t("withdrawal.invalidAmount", "Please enter a valid amount")
      );
      return;
    }

    if (amountNumber < MIN_WITHDRAW) {
      setValidationMessage(
        t(
          "withdrawal.amountTooLow",
          `Số tiền tối thiểu là ${MIN_WITHDRAW.toLocaleString("vi-VN")}₫`
        )
      );
      return;
    }

    if (amountNumber > MAX_WITHDRAW) {
      setValidationMessage(
        t(
          "withdrawal.amountTooHigh",
          `Số tiền tối đa là ${MAX_WITHDRAW.toLocaleString("vi-VN")}₫`
        )
      );
      return;
    }

    if (amountNumber > availableBalance) {
      setValidationMessage(
        t(
          "withdrawal.exceedBalance",
          "Số tiền rút không được vượt quá số dư khả dụng"
        )
      );
      return;
    }

    setValidationMessage("");
    handleWithdrawal();
  };

  const handleViewProof = (url) => () => {
    if (!url) return;
    Linking.openURL(url).catch((err) => {
      console.error("Failed to open proof URL:", err);
      Alert.alert(t("withdrawal.openProofFailed", "Unable to open proof"));
    });
  };

  return (
    <View style={styles.withdrawalContainer}>
      {/* Financial Stats */}
      <View style={styles.financialStatsContainer}>
        <View style={styles.financialRow}>
          {summaryFinancialStats.map((stat) => (
            <SummaryCard stat={stat} key={stat.id} />
          ))}
        </View>
      </View>

      {/* Withdrawal Form */}
      <View style={styles.withdrawalForm}>
        <Text style={styles.formTitle}>
          {t("withdrawal.requestWithdrawal", "Request Withdrawal")}
        </Text>

        {/* Amount Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {t("withdrawal.amount", "Amount")} *
          </Text>
          <View style={styles.inputContainer}>
            <Ionicons name="cash-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder={t("withdrawal.enterAmount", "Enter amount")}
              value={formatAmountInput(withdrawalAmount)}
              onChangeText={handleAmountChange}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>
          {!!validationMessage && (
            <Text style={styles.validationText}>{validationMessage}</Text>
          )}
        </View>

        {/* Bank Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {t("withdrawal.bankName", "Bank Name")} *
          </Text>
          <View style={styles.inputContainer}>
          {selectedBank?.logo ? (
            <Image
              source={{ uri: selectedBank.logo }}
              style={styles.selectedBankIcon}
            />
          ) : (
            <Ionicons name="business-outline" size={20} color="#666" />
          )}
            <TextInput
              style={styles.input}
              placeholder={t("withdrawal.enterBankName", "Enter bank name")}
              value={bankName}
              onChangeText={handleBankInputChange}
              onFocus={() => {
                setShowBankSuggestions(true);
                setFilteredBanks(banks);
              }}
              placeholderTextColor="#999"
            />
          </View>
          {showBankSuggestions && filteredBanks.length > 0 && (
            <View style={styles.suggestionContainer}>
              <ScrollView contentContainerStyle={styles.suggestionScroll}>
                {filteredBanks.map((bank) => (
                  <TouchableOpacity
                    key={bank.code}
                    style={styles.suggestionItem}
                    onPress={() => handleSelectBank(bank)}
                  >
                    <Image
                      source={{ uri: bank.logo }}
                      style={styles.suggestionImage}
                    />
                    <View style={styles.suggestionTextContainer}>
                      <Text style={styles.suggestionText}>
                        {bank.name} ({bank.code})
                      </Text>
                      <Text style={styles.suggestionSubText}>
                        {bank.bankFullName}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Account Number Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {t("withdrawal.accountNumber", "Account Number")} *
          </Text>
          <View style={styles.inputContainer}>
            <Ionicons name="card-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder={t(
                "withdrawal.enterAccountNumber",
                "Enter account number"
              )}
              value={bankAccount}
              onChangeText={setBankAccount}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Account Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            {t("withdrawal.accountName", "Account Name")} *
          </Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder={t(
                "withdrawal.enterAccountName",
                "Enter account name"
              )}
              value={accountName}
              onChangeText={setAccountName}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitWithdrawal}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.submitButtonText}>
            {t("withdrawal.submitRequest", "Submit Request")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Withdrawal History */}
      <View style={styles.withdrawalHistory}>
        <Text style={styles.historyTitle}>
          {t("withdrawal.history", "Withdrawal History")}
        </Text>
        {withdrawalHistory.length === 0 ? (
          <View style={styles.emptyHistory}>
            <Ionicons name="file-tray-outline" size={60} color="#E0E0E0" />
            <Text style={styles.emptyHistoryText}>
              {t("withdrawal.noHistory", "No withdrawal history")}
            </Text>
          </View>
        ) : (
          withdrawalHistory.map((item) => (
            <View key={item.id} style={styles.withdrawalCard}>
              <View style={styles.withdrawalCardHeader}>
                <View style={styles.withdrawalInfo}>
                  <Text style={styles.withdrawalAmount}>
                    {formatAmount(item.amount)}
                  </Text>
                  <Text style={styles.withdrawalMethod}>{item.bankName}</Text>
                  <Text style={styles.withdrawalAccountName}>
                    {item.accountName}
                  </Text>
                  <Text style={styles.withdrawalAccount}>
                    {item.accountNumber}
                  </Text>
                  {item.reason && (
                    <Text style={styles.withdrawalReason}>
                      {t("withdrawal.reason", "Reason")}: {item.reason}
                    </Text>
                  )}
                </View>
                <View
                  style={[
                    styles.withdrawalStatusBadge,
                    { backgroundColor: getStatusColor(item.status) },
                  ]}
                >
                  <Text style={styles.withdrawalStatusText}>
                    {getStatusText(item.status)}
                  </Text>
                </View>
              </View>
              <View style={styles.withdrawalCardFooter}>
                <View style={styles.withdrawalDate}>
                  <Ionicons name="calendar-outline" size={14} color="#666" />
                  <Text style={styles.withdrawalDateText}>
                    {formatDate(item.createdAt)}
                  </Text>
                </View>
                {item.imageUrl && (
                  <TouchableOpacity onPress={handleViewProof(item.imageUrl)}>
                    <View style={styles.withdrawalDate}>
                      <Ionicons
                        name="image-outline"
                        size={14}
                        color="#2196F3"
                      />
                      <Text style={styles.withdrawalDateText}>
                        {t("withdrawal.hasProof", "Proof attached")}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
              {item.status === "AdminApproved" && (
                <View style={styles.withdrawalButtonAction}>
                  <TouchableOpacity
                    onPress={() => handleConfirmPayment(item.id)}
                    style={styles.withdrawalButtonActionItem}
                  >
                    <Text style={styles.withdrawalButtonActionText}>
                      {t("withdrawal.confirmPayment", "Confirm Payment")}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  withdrawalContainer: {
    padding: 16,
  },
  financialStatsContainer: {
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  financialRow: {
    flexDirection: "row",
    gap: 12,
  },
  withdrawalForm: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingLeft: 12,
    fontSize: 16,
    color: "#333",
  },
  submitButton: {
    flexDirection: "row",
    backgroundColor: "#ED2A46",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    gap: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  withdrawalHistory: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  emptyHistory: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyHistoryText: {
    fontSize: 14,
    color: "#999",
    marginTop: 12,
  },
  withdrawalCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#ED2A46",
  },
  withdrawalCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  withdrawalInfo: {
    flex: 1,
    marginRight: 12,
  },
  withdrawalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  withdrawalMethod: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
    fontWeight: "600",
  },
  withdrawalAccountName: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  withdrawalAccount: {
    fontSize: 12,
    color: "#999",
    marginBottom: 2,
  },
  withdrawalReason: {
    fontSize: 11,
    color: "#FF9800",
    fontStyle: "italic",
    marginTop: 4,
  },
  withdrawalStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  withdrawalStatusText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
  },
  withdrawalButtonAction: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  withdrawalButtonActionItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#4CAF50",
    borderRadius: 10,
    elevation: 1,
  },
  withdrawalButtonActionText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  withdrawalCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    paddingTop: 12,
  },
  withdrawalDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  withdrawalDateText: {
    fontSize: 12,
    color: "#666",
  },
  validationText: {
    color: "#F44336",
    fontSize: 12,
    marginTop: 6,
  },
  suggestionContainer: {
    marginTop: 6,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    overflow: "hidden",
    maxHeight: 240,
  },
  suggestionScroll: {
    flexGrow: 0,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    width: "100%",
  },
  suggestionImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  suggestionTextContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  suggestionSubText: {
    fontSize: 12,
    color: "#777",
    marginTop: 2,
  },
  selectedBankIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});

export default WithdrawalTab;
