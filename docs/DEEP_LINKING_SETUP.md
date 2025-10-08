# Deep Linking Setup for Voucher Sharing

## Overview
This document explains how deep linking is configured for sharing vouchers in the FitBridge app.

## How It Works

### 1. Share Flow
When a user clicks the **Share** button on a voucher:
1. `VoucherShareModal` opens with voucher details
2. User can:
   - Share via native share dialog
   - Copy the deep link
   - Scan QR code containing the deep link
   - Copy the voucher code directly

### 2. Deep Link Structure
```
https://fitbridge.shop/voucherDetails/{voucherId}
```

Example: `https://fitbridge.shop/voucherDetails/123`

### 3. When Someone Clicks the Link

#### If App is Installed:
1. Link opens the FitBridge app
2. App automatically navigates to `VoucherDetailScreen`
3. Screen receives `voucherId` parameter
4. Fetches and displays voucher details

#### If App is NOT Installed:
1. Link opens in web browser
2. Can be configured to redirect to App Store/Play Store
3. After installation, link can be saved to open the voucher

## Technical Configuration

### 1. app.json
```json
{
  "expo": {
    "scheme": "fitbridge",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": {
            "scheme": "https",
            "host": "fitbridge.shop"
          }
        }
      ]
    }
  }
}
```

### 2. Navigator.js - Linking Configuration
```javascript
const linking = {
  prefixes: [
    'fitbridge://',
    'https://fitbridge.shop',
    'http://fitbridge.shop'
  ],
  config: {
    screens: {
      MainApp: {
        screens: {
          VoucherDetailScreen: 'voucherDetails/:voucherId'
        }
      }
    }
  }
};
```

### 3. Components

#### VoucherShareModal.js
- Generates deep link URL
- Creates QR code with deep link
- Handles sharing via native share dialog
- Copy link and code functionality

#### VoucherCardVertical.js
- Share button opens VoucherShareModal
- Modal state management

#### VoucherDetailScreen.js
- Receives `voucherId` from route params
- Works for both navigation and deep linking
- Fetches voucher data from API

## URL Formats Supported

All these URLs will open the same voucher (ID: 123):

1. **HTTPS Web Link** (Recommended for sharing)
   ```
   https://fitbridge.shop/voucherDetails/123
   ```

2. **HTTP Web Link**
   ```
   http://fitbridge.shop/voucherDetails/123
   ```

3. **App Scheme**
   ```
   fitbridge://voucherDetails/123
   ```

## Share Message Format

```
🎁 Share Voucher!

📌 Code: SUMMER2024
💰 Discount: 20%
🎯 Max Discount: 100,000 ₫

🔗 https://fitbridge.shop/voucherDetails/123

Get your discount at FitBridge!
```

## Testing Deep Links

### On iOS Simulator:
```bash
xcrun simctl openurl booted "https://fitbridge.shop/voucherDetails/123"
```

### On Android Emulator:
```bash
adb shell am start -W -a android.intent.action.VIEW -d "https://fitbridge.shop/voucherDetails/123"
```

### Real Device:
1. Send the link via messaging app
2. Click the link
3. App should open if installed

## Features

### VoucherShareModal Features:
✅ **Voucher Preview** - Shows discount percentage, code, and max discount
✅ **QR Code** - Scan to open voucher directly
✅ **Copy Link** - One-tap copy deep link to clipboard
✅ **Copy Code** - Quickly copy voucher code
✅ **Native Share** - Share via WhatsApp, Messenger, Email, etc.
✅ **Responsive Design** - Bottom sheet modal with smooth animations
✅ **Translation Support** - English and Vietnamese

### Security Considerations:
- Links are public (no authentication required to view)
- Voucher details are fetched from API
- Only active vouchers should be shareable
- Consider implementing view tracking

## Future Enhancements

1. **Website Landing Page**
   - Create web page at `https://fitbridge.shop/voucherDetails/:id`
   - Show voucher preview
   - "Open in App" button
   - Redirect to App Store if app not installed

2. **Analytics**
   - Track link clicks
   - Monitor conversion rates
   - Measure sharing effectiveness

3. **Dynamic Links**
   - Use Firebase Dynamic Links
   - Better attribution
   - Deferred deep linking support

4. **Branch.io Integration**
   - Advanced deep linking
   - Cross-platform support
   - Marketing analytics

## Troubleshooting

### Link doesn't open app:
1. Check app is installed
2. Verify `scheme` in app.json
3. Test with `fitbridge://` scheme first
4. Check Navigator.js linking config

### Wrong screen opens:
1. Verify route name matches Navigator.js
2. Check parameter name (`voucherId`)
3. Ensure screen is in linking config

### QR code doesn't work:
1. Check QR code value is correct URL
2. Test URL manually first
3. Verify QR scanner supports URLs

## Related Files

- `/components/VoucherCard/VoucherShareModal.js` - Share modal component
- `/components/VoucherCard/VoucherCardVertical.js` - Voucher card with share button
- `/screens/FreelancePTScreen/VoucherDetailScreen/VoucherDetailScreen.js` - Destination screen
- `/navigation/Navigator.js` - Deep linking configuration
- `/app.json` - App scheme and configuration
- `/i18n/locales/*.json` - Translation strings

## Support

For questions or issues with deep linking:
1. Check this documentation
2. Review Navigator.js configuration
3. Test with provided test commands
4. Check React Navigation docs: https://reactnavigation.org/docs/deep-linking
