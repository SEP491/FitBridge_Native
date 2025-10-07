import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "../../../../hooks/useTranslation";

export default function LanguageSelectScreen({ navigation }) {
  const { t, currentLanguage, changeLanguage } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  const languages = [
    {
      code: "en",
      name: "English",
      nativeName: "English",
      flag: "🇺🇸",
      description: t("languageSelect.englishDescription"),
    },
    {
      code: "vi",
      name: "Vietnamese",
      nativeName: "Tiếng Việt",
      flag: "🇻🇳",
      description: t("languageSelect.vietnameseDescription"),
    },
  ];

  const handleLanguageSelect = (languageCode) => {
    setSelectedLanguage(languageCode);
  };

  const handleSaveLanguage = () => {
    if (selectedLanguage !== currentLanguage) {
      changeLanguage(selectedLanguage);
      Alert.alert(
        t("common.success"),
        t("success.languageChanged", {
          language: languages.find((lang) => lang.code === selectedLanguage)
            ?.nativeName,
        }),
        [
          {
            text: t("common.confirm"),
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const renderLanguageOption = (language) => {
    const isSelected = selectedLanguage === language.code;

    return (
      <TouchableOpacity
        key={language.code}
        style={[
          styles.languageOption,
          isSelected && styles.selectedLanguageOption,
        ]}
        onPress={() => handleLanguageSelect(language.code)}
        activeOpacity={0.7}
      >
        <View style={styles.languageContent}>
          <View style={styles.languageInfo}>
            <Text style={styles.flagEmoji}>{language.flag}</Text>
            <View style={styles.languageText}>
              <Text
                style={[
                  styles.languageName,
                  isSelected && styles.selectedLanguageName,
                ]}
              >
                {language.nativeName}
              </Text>
              <Text
                style={[
                  styles.languageSubtitle,
                  isSelected && styles.selectedLanguageSubtitle,
                ]}
              >
                {language.name}
              </Text>
            </View>
          </View>

          <View style={styles.radioContainer}>
            <View
              style={[
                styles.radioOuter,
                isSelected && styles.radioOuterSelected,
              ]}
            >
              {isSelected && <View style={styles.radioInner} />}
            </View>
          </View>
        </View>

        <Text
          style={[
            styles.languageDescription,
            isSelected && styles.selectedLanguageDescription,
          ]}
        >
          {language.description}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Ionicons name="language" size={24} color="#ED2A46" />
          <Text style={styles.sectionTitle}>
            {t("settings.selectLanguage")}
          </Text>
        </View>

        <Text style={styles.sectionDescription}>
          {t("settings.languageDescription")}
        </Text>

        <View style={styles.languageList}>
          {languages.map(renderLanguageOption)}
        </View>

        {/* Current Language Info */}
        <View style={styles.currentLanguageInfo}>
          <View style={styles.infoRow}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.currentLanguageText}>
              {t("settings.currentLanguage")}:{" "}
              <Text style={styles.currentLanguageValue}>
                {
                  languages.find((lang) => lang.code === currentLanguage)
                    ?.nativeName
                }
              </Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Save Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            selectedLanguage === currentLanguage && styles.saveButtonDisabled,
          ]}
          onPress={handleSaveLanguage}
          disabled={selectedLanguage === currentLanguage}
        >
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={selectedLanguage === currentLanguage ? "#999999" : "#FFFFFF"}
            style={styles.saveButtonIcon}
          />
          <Text
            style={[
              styles.saveButtonText,
              selectedLanguage === currentLanguage &&
                styles.saveButtonTextDisabled,
            ]}
          >
            {selectedLanguage === currentLanguage
              ? t("settings.noChanges")
              : t("common.save")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#F8F9FA",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ED2A46",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveButtonDisabled: {
    backgroundColor: "#E0E0E0",
    elevation: 0,
    shadowOpacity: 0,
  },
  saveButtonIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  saveButtonTextDisabled: {
    color: "#999999",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginLeft: 12,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666666",
    lineHeight: 20,
    marginBottom: 30,
  },
  languageList: {
    marginBottom: 30,
  },
  languageOption: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedLanguageOption: {
    borderColor: "#ED2A46",
    backgroundColor: "#FFF5F6",
  },
  languageContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  languageInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  flagEmoji: {
    fontSize: 32,
    marginRight: 15,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 2,
  },
  selectedLanguageName: {
    color: "#ED2A46",
  },
  languageSubtitle: {
    fontSize: 14,
    color: "#666666",
  },
  selectedLanguageSubtitle: {
    color: "#ED2A46",
  },
  languageDescription: {
    fontSize: 13,
    color: "#888888",
    fontStyle: "italic",
    lineHeight: 18,
  },
  selectedLanguageDescription: {
    color: "#ED2A46",
  },
  radioContainer: {
    marginLeft: 10,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#CCCCCC",
    alignItems: "center",
    justifyContent: "center",
  },
  radioOuterSelected: {
    borderColor: "#ED2A46",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ED2A46",
  },
  currentLanguageInfo: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  currentLanguageText: {
    fontSize: 14,
    color: "#333333",
    marginLeft: 10,
  },
  currentLanguageValue: {
    fontWeight: "bold",
    color: "#4CAF50",
  },
});
