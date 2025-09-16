# FitBridge Native - Internationalization (i18n) Guide

Welcome to the comprehensive internationalization guide for FitBridge Native! This document will help you understand and work with our multilingual support system.

## 🌍 Overview

FitBridge Native supports multiple languages using `i18n-js` and `expo-localization` with automatic device language detection, persistent language preferences, and reactive UI updates.

### Supported Languages

- **English (en)** - Default fallback language
- **Vietnamese (vi)** - Tiếng Việt

## 📁 File Structure

```
i18n/
├── index.js              # Main i18n configuration with AsyncStorage persistence
├── README.md            # This comprehensive guide
└── locales/
    ├── en.json          # English translations (150+ keys)
    └── vi.json          # Vietnamese translations (150+ keys)

hooks/
└── useTranslation.js    # Reactive translation hook for components

components/
├── LanguageSelector/    # Language selection modal component
└── [Various screens using translations]

screens/
├── SettingScreen/
│   └── LanguageSelectScreen/ # Custom language selection UI
└── [Other screens with i18n support]
```

## 🚀 Quick Start

### Method 1: Direct Import (Static Components)

Use this for components that don't need to react to language changes:

```javascript
import { t } from "../i18n";

const StaticComponent = () => {
  return <Text>{t("common.welcome")}</Text>;
};
```

### Method 2: Reactive Hook (Recommended)

Use this for components that should re-render when language changes:

```javascript
import { useTranslation } from "../hooks/useTranslation";

const ReactiveComponent = () => {
  const { t, currentLanguage, changeLanguage } = useTranslation();

  return (
    <View>
      <Text>{t("common.welcome")}</Text>
      <Text>Current: {currentLanguage}</Text>
      <Button
        title={t("settings.changeLanguage")}
        onPress={() => changeLanguage("vi")}
      />
    </View>
  );
};
```

## 🔧 Core Features

### 1. Automatic Language Detection

- Detects device language on first app launch
- Falls back to English if device language isn't supported
- Saves user preference for subsequent launches

### 2. Persistent Language Preferences

```javascript
// Language preferences are automatically saved to AsyncStorage
// No manual setup required - handled by the i18n system
```

### 3. Reactive Language Switching

```javascript
// All components using useTranslation() automatically re-render
// when language changes anywhere in the app
const { t } = useTranslation(); // ✅ Reactive
const text = t("key"); // ❌ Static (won't update on language change)
```

### 4. Built-in Language Selection UI

Navigate to: **Settings → Language** for the custom language selection screen

```javascript
// The LanguageSelectScreen is already integrated into your app
// Users can access it via: Settings → Language Selection
// Features:
// - Modern floating UI design
// - Language flags and native names
// - Persistent save with confirmation
// - Instant app-wide language switching
```

## 💡 Advanced Usage

### Custom Language Change Handler

```javascript
import { changeLanguage, onLanguageChange } from "../i18n";

const MyComponent = () => {
  useEffect(() => {
    // Subscribe to language changes
    const unsubscribe = onLanguageChange((newLanguage) => {
      console.log(`Language changed to: ${newLanguage}`);
      // Custom logic here
    });

    return unsubscribe; // Cleanup
  }, []);

  const handleLanguageSwitch = async () => {
    await changeLanguage("vi");
    // Language is automatically saved to AsyncStorage
    // All subscribed components will re-render
  };
};
```

### Conditional Rendering Based on Language

```javascript
const { currentLanguage } = useTranslation();

return (
  <View>
    {currentLanguage === "vi" ? (
      <Text style={styles.vietnameseText}>Chào mừng!</Text>
    ) : (
      <Text style={styles.englishText}>Welcome!</Text>
    )}
  </View>
);
```

## 📝 Adding New Translations

### Step-by-Step Process

1. **Add to both language files**: Always update both `en.json` AND `vi.json`
2. **Use nested structure**: Group related translations logically
3. **Follow naming conventions**: Use camelCase for keys

```json
// i18n/locales/en.json
{
  "navigation": {
    "home": "Home",
    "profile": "Profile",
    "settings": "Settings"
  },
  "buttons": {
    "save": "Save",
    "cancel": "Cancel",
    "confirm": "Confirm"
  },
  "errors": {
    "networkError": "Network connection failed",
    "invalidInput": "Please check your input"
  }
}
```

```json
// i18n/locales/vi.json
{
  "navigation": {
    "home": "Trang chủ",
    "profile": "Hồ sơ",
    "settings": "Cài đặt"
  },
  "buttons": {
    "save": "Lưu",
    "cancel": "Hủy",
    "confirm": "Xác nhận"
  },
  "errors": {
    "networkError": "Kết nối mạng thất bại",
    "invalidInput": "Vui lòng kiểm tra thông tin nhập"
  }
}
```

### Using Your New Translations

```javascript
const { t } = useTranslation();

// Access nested keys with dot notation
const homeTitle = t("navigation.home"); // "Home" / "Trang chủ"
const saveButton = t("buttons.save"); // "Save" / "Lưu"
const errorMsg = t("errors.networkError"); // Network error message
```

## 🔄 Language Detection & Persistence Flow

### Initialization Process

1. **App Launch**: System checks AsyncStorage for saved language preference
2. **Saved Preference**: If found, uses saved language
3. **Device Detection**: If no preference, detects device language via expo-localization
4. **Fallback**: If device language unsupported, defaults to English

```javascript
// This happens automatically - no setup required!
// Initialization order:
// 1. Check AsyncStorage.getItem("selectedLanguage")
// 2. If none, use getLocales()[0].languageCode
// 3. If unsupported, fallback to "en"
```

### Persistence (Automatic)

- Language changes are **automatically saved** to AsyncStorage
- No manual persistence code needed
- Survives app restarts and updates

```javascript
// When user changes language, this happens automatically:
await changeLanguage("vi");
// ✅ Saved to AsyncStorage
// ✅ Notifies all components
// ✅ Updates UI immediately
```

## 📚 Available Translation Categories

Your app includes **150+ translation keys** organized into these categories:

### Core Categories

- **`common.*`** - Universal UI elements (buttons, labels, actions)
- **`navigation.*`** - Navigation tabs and screen titles
- **`errors.*`** - Error messages and validation
- **`success.*`** - Success notifications and confirmations

### Feature Categories

- **`settings.*`** - Settings screen and preferences
- **`userMenu.*`** - User menu options and profile actions
- **`updatePassword.*`** - Password change functionality
- **`voucher.*`** - Voucher and promotion content
- **`transactionHistory.*`** - Transaction and payment history
- **`language.*`** - Language selection interface

### Example Keys

```javascript
// Common elements
t("common.welcome"); // "Welcome" / "Chào mừng"
t("common.loading"); // "Loading..." / "Đang tải..."
t("common.save"); // "Save" / "Lưu"

// Navigation
t("navigation.home"); // "Home" / "Trang chủ"
t("navigation.profile"); // "Profile" / "Hồ sơ"

// Settings
t("settings.language"); // "Language" / "Ngôn ngữ"
t("settings.changePassword"); // "Change Password" / "Đổi mật khẩu"

// Errors & Success
t("errors.networkError"); // Network error message
t("success.passwordUpdated"); // Password update confirmation
```

## ✅ Best Practices

### 1. Key Naming Conventions

```javascript
// ✅ Good - Descriptive and grouped
t("buttons.save");
t("errors.validation.emailInvalid");
t("screens.profile.title");

// ❌ Avoid - Generic and unclear
t("button1");
t("text");
t("message");
```

### 2. Component Architecture

```javascript
// ✅ Use useTranslation() for reactive components
const { t } = useTranslation(); // Auto re-renders on language change

// ❌ Avoid direct import for dynamic components
import { t } from "../i18n"; // Static, won't re-render
```

### 3. Translation Consistency

- Use the same translation key for identical text across screens
- Maintain consistent tone and terminology
- Consider context when translating (formal vs informal Vietnamese)

### 4. Testing Workflow

1. Add translations to both `en.json` and `vi.json`
2. Test in English first
3. Switch to Vietnamese and verify translations
4. Test language switching functionality
5. Verify persistence across app restarts

### 5. Performance Considerations

- Translation loading is optimized and cached
- Language changes are batched for performance
- Only components using `useTranslation()` re-render on language changes

## 🐛 Troubleshooting

### Common Issues

**Q: Language changes don't reflect across the entire app**

```javascript
// ✅ Solution: Use useTranslation() hook instead of direct import
const { t } = useTranslation(); // Reactive
// Not: import { t } from "../i18n"; // Static
```

**Q: Translations not showing up**

1. Check if key exists in both `en.json` and `vi.json`
2. Verify correct dot notation: `t("category.key")`
3. Check for typos in translation keys

**Q: App crashes on language change**

- Ensure AsyncStorage is properly installed
- Check that all translation files are valid JSON
- Verify import paths are correct

## 🚀 Getting Started Checklist

- [ ] Understand the difference between static `t()` and reactive `useTranslation()`
- [ ] Know how to access the Language Selection screen (Settings → Language)
- [ ] Understand the translation key structure and naming conventions
- [ ] Practice adding new translations to both language files
- [ ] Test language switching and persistence
- [ ] Explore the 150+ existing translation keys for reference

**Need help?** Check the existing screens like `SettingScreen.js`, `UserMenuScreen.js` for implementation examples!
