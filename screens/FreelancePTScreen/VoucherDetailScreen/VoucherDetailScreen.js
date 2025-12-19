import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../../hooks/useTranslation';
import couponService from '../../../services/couponService';
import VoucherCardVertical from '../../../components/VoucherCard/VoucherCardVertical';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EditVoucherModal from './EditVoucherModal';
import LoadingIndicator from '../../../components/LoadingIndicator';

const VoucherDetailScreen = ({ route, navigation }) => {
  const { voucherId } = route.params;
  const { t } = useTranslation();
  const [voucher, setVoucher] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchVoucherDetails();
    loadUserName();
  }, []);

  const loadUserName = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('user');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUserName(userData.fullName || userData.name || '');
      }
    } catch (error) {
      console.error('Error loading user name:', error);
    }
  };

  const fetchVoucherDetails = async () => {
    try {
      setLoading(true);
      const response = await couponService.getCoupons({ page: 1, size: 100 });
      
      if (response.status === '200' && response.data) {
        const foundVoucher = response.data.items.find(item => item.id === voucherId);
        if (foundVoucher) {
          setVoucher(foundVoucher);
        } else {
          Alert.alert(t('manageVoucher.error'), 'Voucher not found');
          navigation.goBack();
        }
      }
    } catch (error) {
      console.error('Error fetching voucher details:', error);
      Alert.alert(t('manageVoucher.error'), t('manageVoucher.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!voucher) return;

    Alert.alert(
      voucher.isActive ? t('manageVoucher.deactivateVoucherTitle') : t('manageVoucher.activateVoucherTitle'),
      voucher.isActive ? t('manageVoucher.deactivateConfirm') : t('manageVoucher.activateConfirm'),
      [
        {
          text: t('manageVoucher.cancel'),
          style: 'cancel',
        },
        {
          text: t('manageVoucher.confirm'),
          onPress: async () => {
            try {
              setUpdating(true);
              const newStatus = !voucher.isActive;
              
              // Call API to update only isActive status
              await couponService.updateCoupons(voucher.id, { 
                isActive: newStatus 
              });
              
              // Update local state after successful API call
              setVoucher({ ...voucher, isActive: newStatus });
              Alert.alert(
                t('manageVoucher.success'), 
                voucher.isActive ? t('manageVoucher.voucherDeactivated') : t('manageVoucher.voucherActivated')
              );
            } catch (error) {
              console.error('Error updating voucher:', error);
              Alert.alert(t('manageVoucher.error'), t('manageVoucher.failedToUpdateStatus'));
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      t('manageVoucher.deleteVoucherTitle'),
      t('manageVoucher.deleteConfirm'),
      [
        {
          text: t('manageVoucher.cancel'),
          style: 'cancel',
        },
        {
          text: t('manageVoucher.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdating(true);
              await couponService.deleteCoupons(voucherId);
              Alert.alert(t('manageVoucher.success'), t('manageVoucher.voucherDeleted'));
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting voucher:', error);
              Alert.alert(t('manageVoucher.error'), t('manageVoucher.failedToDelete'));
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!voucher) return;

    try {
      await Share.share({
        message: `🎁 Voucher Code: ${voucher.couponCode}\n💰 ${t('manageVoucher.discount')}: ${voucher.discountPercent}%\n📌 ${t('manageVoucher.maxDiscount')}: ${voucher.maxDiscount?.toLocaleString('vi-VN')} ₫\n\nGet your discount at FitBridge!`,
        title: t('manageVoucher.shareVoucher'),
      });
    } catch (error) {
      console.error('Error sharing voucher:', error);
    }
  };

  const handleVoucherUpdated = () => {
    fetchVoucherDetails();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <LoadingIndicator
          variant="page"
          message={t('manageVoucher.loadingVoucherDetails')}
        />
      </SafeAreaView>
    );
  }

  if (!voucher) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
        <Text style={styles.errorText}>{t('manageVoucher.voucherNotFound')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Voucher Card */}
        <VoucherCardVertical voucher={voucher} userName={userName} />

        {/* Details Section */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>{t('manageVoucher.voucherInformation')}</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{t('manageVoucher.discountPercentage')}</Text>
              <Text style={styles.infoValue}>{voucher.discountPercent}%</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{t('manageVoucher.maxDiscount')}</Text>
              <Text style={styles.infoValue}>{voucher.maxDiscount?.toLocaleString('vi-VN')} ₫</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{t('manageVoucher.totalQuantity')}</Text>
              <Text style={styles.infoValue}>{voucher.quantity}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{t('manageVoucher.used')}</Text>
              <Text style={styles.infoValue}>{voucher.numberOfUsedCoupon}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{t('manageVoucher.remaining')}</Text>
              <Text style={styles.infoValue}>{voucher.quantity - voucher.numberOfUsedCoupon}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>{t('manageVoucher.status')}</Text>
              <View style={[styles.statusBadge, { backgroundColor: voucher.isActive ? '#4CAF50' : '#F44336' }]}>
                <Text style={styles.statusBadgeText}>
                  {voucher.isActive ? t('manageVoucher.active').toUpperCase() : t('manageVoucher.inactive').toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.progressSection}>
            <Text style={styles.infoLabel}>{t('manageVoucher.usageProgress')}</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(voucher.numberOfUsedCoupon / voucher.quantity) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {t('manageVoucher.percentUsed', { percent: Math.round((voucher.numberOfUsedCoupon / voucher.quantity) * 100) })}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsCard}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowEditModal(true)}
            disabled={updating}
          >
            <Ionicons name="pencil" size={20} color="#2196F3" />
            <Text style={[styles.actionButtonText, { color: '#2196F3' }]}>{t('manageVoucher.editVoucher')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleToggleStatus}
            disabled={updating}
          >
            <Ionicons 
              name={voucher.isActive ? 'pause' : 'play'} 
              size={20} 
              color={voucher.isActive ? '#FF9800' : '#4CAF50'} 
            />
            <Text style={[styles.actionButtonText, { color: voucher.isActive ? '#FF9800' : '#4CAF50' }]}>
              {voucher.isActive ? t('manageVoucher.deactivate') : t('manageVoucher.activate')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleDelete}
            disabled={updating}
          >
            <Ionicons name="trash" size={20} color="#F44336" />
            <Text style={[styles.actionButtonText, { color: '#F44336' }]}>{t('manageVoucher.deleteVoucher')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {updating && (
        <View style={styles.loadingOverlay}>
          <LoadingIndicator variant="page" />
        </View>
      )}

      {/* Edit Voucher Modal */}
      <View
        style={{
          height: "120%",
          width: "120%",
          position: "absolute",
          justifyContent: "center",
          alignItems: "center",
          display: showEditModal ? "flex" : "none",
          zIndex: 1000,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <EditVoucherModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleVoucherUpdated}
        voucher={voucher}
      />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: -100,
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  progressSection: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ED2A46',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  actionsCard: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VoucherDetailScreen;
