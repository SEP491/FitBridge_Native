import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import LogoColor from '../../assets/LogoColor.png';
import { LinearGradient } from 'expo-linear-gradient';
import VoucherShareModal from './VoucherShareModal';

const VoucherCardVertical = ({ voucher, userName }) => {
  const [showShareModal, setShowShareModal] = useState(false);

  if (!voucher) {
    return null;
  }

  const handleShare = () => {
    setShowShareModal(true);
  };

  return (
    <View style={styles.voucherContainer}>
      {/* Top Section - Discount with Gradient */}
      <LinearGradient
        colors={voucher.isActive ? ['#FF914D', '#ED2A46'] : ['#6B7280', '#4B5563']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.topSection}
      >
        {/* Decorative dots */}
        <View style={styles.decorativeDots}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
                {userName || 'Personal Trainer'}
              </Text>
              <Text style={styles.headerSubtitle}>GIFT VOUCHER</Text>
            </View>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Ionicons name="share-social" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Discount */}
        <View style={styles.discountSection}>
          <Text style={styles.discountText}>
            GIẢM {voucher.discountPercent}%
          </Text>
        </View>

        {/* Coupon Code */}
        <View style={styles.codeSection}>
          <Text style={styles.codeLabel}>VOUCHER CODE</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeValue}>{voucher.couponCode}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Bottom Section - Details */}
      <View style={styles.bottomSection}>
        {/* Max Discount */}
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Giá trị tối đa</Text>
            <Text style={styles.detailValue}>
              {voucher.maxDiscount?.toLocaleString('vi-VN')} ₫
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Số lượng</Text>
            <Text style={styles.detailValue}>
              {voucher.numberOfUsedCoupon}/{voucher.quantity}
            </Text>
          </View>
        </View>

        {/* QR Code */}
        <View style={styles.qrSection}>
          <QRCode
            value={voucher.couponCode}
            size={100}
            backgroundColor="white"
            color="black"
          />
        </View>

        {/* Status Badge */}
        {/* <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: voucher.isActive ? '#4CAF50' : '#F44336' }]}>
            <Ionicons 
              name={voucher.isActive ? 'checkmark-circle' : 'close-circle'} 
              size={16} 
              color="white" 
            />
            <Text style={styles.statusText}>
              {voucher.isActive ? 'ACTIVE' : 'INACTIVE'}
            </Text>
          </View>
        </View> */}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>fitbridge.shop</Text>
          <Image source={LogoColor} style={styles.logo} />
        </View>
      </View>

      {/* Dashed Line Separator */}
      <View style={styles.dashedLine} />

      {/* Share Modal */}
      <VoucherShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        voucher={voucher}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  voucherContainer: {
    width: '100%',
    marginVertical: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  topSection: {
    padding: 24,
    paddingBottom: 32,
    position: 'relative',
  },
  decorativeDots: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  header: {
    // marginBottom: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  shareButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 1.5,
  },
  discountSection: {
    alignItems: 'center',
    marginVertical: 16,
  },
  discountText: {
    fontSize: 48,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
  },
  codeSection: {
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  codeBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  codeValue: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 2,
  },
  bottomSection: {
    padding: 24,
    backgroundColor: 'white',
    borderTopWidth: 3,
    borderTopColor: '#e5e7eb',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  qrSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '700',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
  },
  logo: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  dashedLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '60%',
    height: 2,
    borderTopWidth: 2,
    borderTopColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
});

export default VoucherCardVertical;
