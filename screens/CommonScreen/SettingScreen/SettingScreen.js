import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "../../../hooks/useTranslation";

export default function SettingScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();

  const renderItem = (labelKey, navigationTarget = null) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => {
        if (labelKey === "settings.language") {
          navigation.navigate("LanguageSelectScreen");
        } // Thêm các điều kiện khác nếu cần
      }}
    >
      <Text style={styles.rowText}>{t(labelKey)}</Text>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Phần còn lại - nền xám */}
      <View style={styles.content}>
        {/* Search Box */}
        <View style={styles.searchBox}>
          <Ionicons
            name="search"
            size={16}
            color="#999"
            style={{ marginHorizontal: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={t("settings.searchSettings")}
            placeholderTextColor="#999"
          />
        </View>

        <ScrollView>
          <Text style={styles.section}>{t("settings.myAccount")}</Text>
          {renderItem("settings.security")}
          {renderItem("settings.address")}
          {renderItem("settings.bankCard")}

          <Text style={styles.section}>{t("userMenu.settings")}</Text>
          {renderItem("settings.aiChatbot")}
          {renderItem("settings.notifications")}
          {renderItem("settings.privacy")}
          {renderItem("settings.language")}

          <Text style={styles.section}>{t("userMenu.support")}</Text>
          {renderItem("settings.supportCenter")}
          {renderItem("settings.terms")}
          {renderItem("settings.rateApp")}
          {/* {renderItem("settings.deleteAccountRequest")} */}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff", // Header màu trắng
  },
  content: {
    flex: 1,
    backgroundColor: "#F5F5F5", // phần sau header là xám
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D5E9EC",
    textAlignVertical: "center",
    margin: 16,
    borderRadius: 25,
    paddingHorizontal: 8,
    height: 36,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#000",
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    fontWeight: "bold",
    color: "#888",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    backgroundColor: "#fff", // mục chọn có nền trắng
  },
  rowText: {
    fontSize: 16,
    color: "#000",
  },
});
