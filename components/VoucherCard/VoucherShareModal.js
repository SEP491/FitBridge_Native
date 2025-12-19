import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Share,
  Clipboard,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LoadingIndicator from '../LoadingIndicator';
import { useTranslation } from '../../hooks/useTranslation';
import QRCode from 'react-native-qrcode-svg';

/**
 * VoucherShareModal - Modal for sharing voucher via deep links
 * 
 * Deep Linking Configuration:
 * - URL Format: https://fitbridge.shop/voucherDetails/{voucherId}
 * - App Scheme: fitbridge://voucherDetails/{voucherId}
 * 
 * When user clicks the link:
 * 1. If app is installed: Opens app and navigates to VoucherDetailScreen with voucherId
 * 2. If app is not installed: Opens website (can redirect to app store)
 * 
 * Setup in app.json:
 * - scheme: "fitbridge"
 * - prefixes: ["https://fitbridge.shop", "fitbridge://"]
 * 
 * Navigator.js handles the routing to VoucherDetailScreen
 */
const VoucherShareModal = ({ visible, onClose, voucher }) => {
  const { t } = useTranslation();
  const [copying, setCopying] = useState(false);

  if (!voucher) return null;

  // Generate deep link URL that works both on web and in-app
  const deepLinkUrl = `https://fitbridge.shop/voucherDetails/${voucher.id}`;
  const shareMessage = `🎁 ${t('manageVoucher.shareVoucher')}!\n\n` +
    `📌 Code: ${voucher.couponCode}\n` +
    `💰 ${t('manageVoucher.discount')}: ${voucher.discountPercent}%\n` +
    `🎯 ${t('manageVoucher.maxDiscount')}: ${voucher.maxDiscount?.toLocaleString('vi-VN')} ₫\n\n` +
    `🔗 ${deepLinkUrl}\n\n` +
    `Get your discount at FitBridge!`;

  const handleShare = async () => {
    try {
      await Share.share({
        message: shareMessage,
        url: deepLinkUrl,
        title: t('manageVoucher.shareVoucher'),
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      setCopying(true);
      await Clipboard.setString(deepLinkUrl);
      Alert.alert('Success', 'Link copied to clipboard!');
      setTimeout(() => setCopying(false), 500);
    } catch (error) {
      console.error('Error copying link:', error);
      Alert.alert('Error', 'Failed to copy link');
      setCopying(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await Clipboard.setString(voucher.couponCode);
      Alert.alert('Success', 'Voucher code copied!');
    } catch (error) {
      console.error('Error copying code:', error);
      Alert.alert('Error', 'Failed to copy code');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('manageVoucher.shareVoucher')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Voucher Info Card */}
          <View style={styles.voucherCard}>
            <View style={styles.voucherHeader}>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{voucher.discountPercent}%</Text>
                <Text style={styles.discountLabel}>OFF</Text>
              </View>
              <View style={styles.voucherDetails}>
                <Text style={styles.voucherCode}>{voucher.couponCode}</Text>
                <Text style={styles.maxDiscount}>
                  {t('manageVoucher.maxDiscount')}: {voucher.maxDiscount?.toLocaleString('vi-VN')} ₫
                </Text>
              </View>
              <TouchableOpacity onPress={handleCopyCode} style={styles.copyCodeButton}>
                <Ionicons name="copy-outline" size={20} color="#ED2A46" />
              </TouchableOpacity>
            </View>
          </View>

          {/* QR Code Section */}
          {/* <View style={styles.qrSection}>
            <Text style={styles.qrLabel}>Scan QR Code</Text>
            <View style={styles.qrCodeContainer}>
              <QRCode
                value={deepLinkUrl}
                size={150}
                backgroundColor="white"
                color="black"
              />
            </View>
            <Text style={styles.qrHint}>Scan to open voucher details</Text>
          </View> */}

          {/* Link Section */}
          <View style={styles.linkSection}>
            <Text style={styles.linkLabel}>Share Link</Text>
            <View style={styles.linkContainer}>
              <Text style={styles.linkText} numberOfLines={1}>
                {deepLinkUrl}
              </Text>
              <TouchableOpacity onPress={handleCopyLink} style={styles.copyButton}>
                {copying ? (
                  <LoadingIndicator variant="inline" />
                ) : (
                  <Ionicons name="copy-outline" size={20} color="#ED2A46" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Share Buttons */}
          <View style={styles.shareButtons}>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Ionicons name="share-social" size={24} color="white" />
              <Text style={styles.shareButtonText}>Share via...</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    maxHeight: '50%',
    width: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  voucherCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  voucherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  discountBadge: {
    backgroundColor: '#ED2A46',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountText: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  discountLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 1,
  },
  voucherDetails: {
    flex: 1,
  },
  voucherCode: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  maxDiscount: {
    fontSize: 12,
    color: '#666',
  },
  copyCodeButton: {
    padding: 8,
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  qrCodeContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  qrHint: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  linkSection: {
    marginBottom: 24,
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  linkText: {
    flex: 1,
    fontSize: 12,
    color: '#ED2A46',
    fontWeight: '600',
  },
  copyButton: {
    padding: 4,
  },
  shareButtons: {
    gap: 12,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ED2A46',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default VoucherShareModal;